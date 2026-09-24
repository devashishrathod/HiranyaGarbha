const Notification = require("../../models/Notification");
const {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_SEVERITY,
  NOTIFICATION_LIMITS,
} = require("../../constants");
const { dispatchPush } = require("../push");
const { sendMail } = require("../nodeMailer");
const { renderTemplate, recipientValues } = require("./renderTemplate");

/**
 * Run `task` over `items` with at most `size` in flight.
 *
 * `Promise.all` over a thousand recipients opens a thousand sockets; the
 * providers drop the connection long before the loop finishes.
 */
const inBatches = async (items, size, task) => {
  const results = [];
  for (let index = 0; index < items.length; index += size) {
    // eslint-disable-next-line no-await-in-loop
    const batch = await Promise.all(items.slice(index, index + size).map(task));
    results.push(...batch);
  }
  return results;
};

/**
 * Notify a whole audience in one call.
 *
 * `notify()` handles a single recipient and is what domain events use. This is
 * its fan-out counterpart: hand it a resolved recipient list and it writes one
 * notification row per person, pushes to their devices and optionally emails
 * them.
 *
 * One row per recipient rather than one shared row, because read state is per
 * person. Each row is labelled with the audience matching that recipient's
 * role, so a mixed send lands in the right feed for each of them without the
 * caller splitting it up.
 *
 * ⚠️ **Never throws.** A partial failure is reported in the returned stats,
 * because a broadcast that reached 900 of 1,000 people is a result to record,
 * not an exception to unwind.
 *
 * @param {object}   params
 * @param {Array}    params.users          from `resolveAudience()`
 * @param {string}   params.type
 * @param {string}   params.title          may contain merge tags
 * @param {string}   params.body           may contain merge tags
 * @param {string[]} params.channels       which channels this send uses
 * @param {string[]}[params.externalEmails] CSV addresses with no account
 * @returns {Promise<object>} stats
 */
exports.notifyAudience = async ({
  users = [],
  externalEmails = [],
  type,
  title,
  body,
  subject,
  emailBody,
  channels = [],
  severity = NOTIFICATION_SEVERITY.INFO,
  imageUrl,
  deepLink,
  meta,
  dedupeKeyPrefix,
  campaignId,
}) => {
  const stats = {
    targeted: users.length + externalEmails.length,
    created: 0,
    duplicates: 0,
    push: { sent: 0, failed: 0, noDevice: 0 },
    email: { sent: 0, failed: 0 },
  };

  if (!users.length && !externalEmails.length) return stats;

  const wantsPush = channels.includes(NOTIFICATION_CHANNELS.PUSH);
  const wantsEmail = channels.includes(NOTIFICATION_CHANNELS.EMAIL);

  /* ---------------- 1. the rows ---------------- */

  // Rendered per recipient, because merge tags resolve per person. The row
  // stores the finished text, so the app never has to know a template language.
  const rendered = new Map();

  const rows = users.map((user) => {
    const values = recipientValues(user);
    const personal = {
      title: renderTemplate(title, values),
      body: renderTemplate(body, values),
      emailBody: renderTemplate(emailBody || body, values),
      subject: renderTemplate(subject || title, values),
    };
    rendered.set(user.userId, personal);

    return {
      userId: user.userId,
      audience: user.audience,
      type,
      severity,
      title: personal.title,
      body: personal.body,
      imageUrl,
      channels: [NOTIFICATION_CHANNELS.IN_APP],
      meta: { ...(meta || {}), ...(deepLink ? { deepLink } : {}) },
      campaignId,
      ...(dedupeKeyPrefix
        ? { dedupeKey: `${dedupeKeyPrefix}:${user.userId}` }
        : {}),
    };
  });

  /**
   * The rows this call actually wrote. Everything downstream keys off these
   * rather than off the audience, so a retried broadcast cannot push again to
   * someone who was skipped as a duplicate — which is exactly what dedupe
   * exists to prevent.
   */
  const insertedIds = new Set();

  for (
    let index = 0;
    index < rows.length;
    index += NOTIFICATION_LIMITS.INSERT_BATCH_SIZE
  ) {
    const chunk = rows.slice(
      index,
      index + NOTIFICATION_LIMITS.INSERT_BATCH_SIZE
    );

    try {
      // Unordered, so one duplicate dedupeKey does not abandon the rest of the
      // batch — the whole point of being able to retry a partial broadcast.
      // eslint-disable-next-line no-await-in-loop
      const written = await Notification.insertMany(chunk, { ordered: false });
      written.forEach((row) => insertedIds.add(String(row.userId)));
    } catch (error) {
      // An unordered insertMany throws on the first failure but has already
      // written the rest, and hands back the documents that landed.
      const landed = Array.isArray(error?.insertedDocs) ? error.insertedDocs : [];
      landed.forEach((row) => insertedIds.add(String(row.userId)));

      const onlyDuplicates =
        error?.code === 11000 ||
        (Array.isArray(error?.writeErrors) &&
          error.writeErrors.every(
            (item) => item?.err?.code === 11000 || item?.code === 11000
          ));

      if (!onlyDuplicates) {
        console.error(`[notifyAudience] ${type} partially failed:`, error?.message);
      }
    }
  }

  stats.created = insertedIds.size;
  stats.duplicates = users.length - insertedIds.size;

  const recipients = users.filter((user) => insertedIds.has(user.userId));

  /* ---------------- 2. push ---------------- */

  if (wantsPush && recipients.length) {
    // Awaited, unlike in notify(): a broadcast is an explicit admin action
    // whose campaign row should report what was actually delivered, and it is
    // not sitting inside a payment or booking path. dispatchPush never throws.
    const result = await dispatchPush(
      recipients.map((user) => user.userId),
      {
        title,
        body,
        imageUrl,
        data: {
          type,
          ...(campaignId ? { campaignId: String(campaignId) } : {}),
          ...(deepLink ? { deepLink } : {}),
        },
      }
    );

    stats.push = {
      sent: result.sent || 0,
      failed: result.failed || 0,
      noDevice: result.noDevice || 0,
      ...(result.skipped ? { skipped: true, reason: result.reason } : {}),
    };

    if (result.sentUserIds?.length) {
      await Notification.updateMany(
        { campaignId, userId: { $in: result.sentUserIds } },
        {
          $set: { pushSentAt: new Date() },
          $addToSet: { channels: NOTIFICATION_CHANNELS.PUSH },
        }
      );
    }
  }

  /**
   * ⚠️ The push payload above uses the **unrendered** title and body.
   *
   * FCM sends one payload to many tokens; personalising it would mean one
   * request per person with different text, which is what the per-recipient
   * rows already are. The tags fall back to readable defaults ("Hi there"),
   * and the in-app row the push opens carries the personalised copy.
   */

  /* ---------------- 3. email ---------------- */

  if (wantsEmail) {
    const withEmail = recipients.filter((user) => user.email);

    const results = await inBatches(
      withEmail,
      NOTIFICATION_LIMITS.EMAIL_CONCURRENCY,
      async (user) => {
        const personal = rendered.get(user.userId) || {};
        const outcome = await sendMail({
          to: user.email,
          subject: personal.subject,
          title: personal.title,
          body: personal.emailBody,
        });

        return { userId: user.userId, ...outcome };
      }
    );

    // CSV addresses with no account: mailed, but there is no row to write.
    const externals = await inBatches(
      externalEmails,
      NOTIFICATION_LIMITS.EMAIL_CONCURRENCY,
      (address) =>
        sendMail({
          to: address,
          subject: subject || title,
          title,
          body: emailBody || body,
        })
    );

    stats.email = {
      sent:
        results.filter((item) => item.sent).length +
        externals.filter((item) => item.sent).length,
      failed:
        results.filter((item) => !item.sent).length +
        externals.filter((item) => !item.sent).length,
    };

    const deliveredTo = results
      .filter((item) => item.sent)
      .map((item) => item.userId);

    if (deliveredTo.length) {
      await Notification.updateMany(
        { campaignId, userId: { $in: deliveredTo } },
        {
          $set: { emailSentAt: new Date() },
          $addToSet: { channels: NOTIFICATION_CHANNELS.EMAIL },
        }
      );
    }
  }

  return stats;
};
