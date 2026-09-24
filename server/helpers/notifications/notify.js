const Notification = require("../../models/Notification");
const User = require("../../models/User");
const Patient = require("../../models/Patient");
const Doctor = require("../../models/Doctor");
const {
  ROLES,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_SEVERITY,
  NOTIFICATION_AUDIENCE,
} = require("../../constants");
const { dispatchPush } = require("../push");
const { sendMail } = require("../nodeMailer");
const { renderTemplate, recipientValues } = require("./renderTemplate");
const { AUDIENCE_BY_ROLE } = require("./resolveAudience");

/**
 * Everything needed to address one person, in one round trip per collection.
 */
const resolveRecipient = async (userId) => {
  const user = await User.findById(userId)
    .select("_id name email mobile role fcmToken isActive isDeleted")
    .lean();

  if (!user || user.isDeleted) return null;

  let profile = null;
  if (user.role === ROLES.USER) {
    profile = await Patient.findOne({ userId: user._id })
      .select("fullName email phone currentTrimester")
      .lean();
  } else if (user.role === ROLES.DOCTOR) {
    profile = await Doctor.findOne({ userId: user._id })
      .select("fullName email phone")
      .lean();
  }

  return {
    userId: String(user._id),
    role: user.role,
    audience: AUDIENCE_BY_ROLE[user.role] || NOTIFICATION_AUDIENCE.PATIENT,
    name: profile?.fullName || user.name || "",
    email: user.email || profile?.email || null,
    currentTrimester: profile?.currentTrimester || null,
  };
};

/**
 * Record a notification for one person and try to deliver it.
 *
 * This is the entry point every domain event uses — appointment booked,
 * subscription expiring, report uploaded. Callers describe *who* and *what*;
 * nothing about FCM, SMTP or tokens appears at a call site.
 *
 * **Persist first, deliver second.** The row is always written, then push and
 * email are attempted and their outcome recorded back onto that row. So the
 * in-app bell is the source of truth and a provider outage costs a delivery,
 * not the record.
 *
 * ⚠️ **Never throws.** Every caller is a business operation — a booking, a
 * payment verification — that must not be rolled back because a notification
 * failed. Failures come back as `{ created: false, reason }`.
 *
 * `dedupeKey` makes the write idempotent, which is what lets a reminder job run
 * every few hours without sending the same reminder each time.
 *
 * @param {object}   params
 * @param {string}   params.userId
 * @param {string}   params.type                NOTIFICATION_TYPES
 * @param {string}   params.title
 * @param {string}   params.body
 * @param {string}  [params.severity]
 * @param {string}  [params.imageUrl]
 * @param {string}  [params.deepLink]           client route to open on tap
 * @param {object}  [params.meta]
 * @param {string}  [params.dedupeKey]
 * @param {boolean} [params.push=true]
 * @param {boolean} [params.email=false]        off by default — SMTP is slow
 * @param {object}  [params.mail]               { subject, ctaLabel, ctaUrl, footnote }
 * @param {boolean} [params.awaitDelivery=false]
 * @returns {Promise<{created:boolean, notification?:object, reason?:string}>}
 */
exports.notify = async ({
  userId,
  type,
  title,
  body,
  severity = NOTIFICATION_SEVERITY.INFO,
  imageUrl,
  deepLink,
  meta,
  dedupeKey,
  push = true,
  email = false,
  mail,
  /**
   * Wait for push and email instead of leaving them in flight.
   *
   * Off by default because a request must not be held open for a provider
   * round trip — this runs inside appointment booking, where five seconds of
   * SMTP on the response is unacceptable. Set it only in a short-lived caller
   * (a script, a test, a job) that would exit before a fire-and-forget send
   * completed.
   */
  awaitDelivery = false,
}) => {
  try {
    const recipient = await resolveRecipient(userId);
    if (!recipient) return { created: false, reason: "recipient not found" };

    const values = recipientValues(recipient);
    const renderedTitle = renderTemplate(title, values);
    const renderedBody = renderTemplate(body, values);

    const notification = await Notification.create({
      userId: recipient.userId,
      audience: recipient.audience,
      type,
      severity,
      title: renderedTitle,
      body: renderedBody,
      imageUrl,
      channels: [NOTIFICATION_CHANNELS.IN_APP],
      // `deepLink` rides inside meta rather than as its own column: it is a
      // client routing hint, and the bulk path carries it there too — one
      // shape means the app reads it from one place.
      meta: { ...(meta || {}), ...(deepLink ? { deepLink } : {}) },
      dedupeKey,
    });

    /* ---------------- push ---------------- */
    const pushing =
      push && recipient.userId
        ? dispatchPush([recipient.userId], {
            title: renderedTitle,
            body: renderedBody,
            imageUrl,
            data: {
              type,
              notificationId: String(notification._id),
              ...(deepLink ? { deepLink } : {}),
              ...(meta?.appointmentId
                ? { appointmentId: String(meta.appointmentId) }
                : {}),
            },
          })
            .then((result) => {
              if (result.sent > 0) {
                return Notification.updateOne(
                  { _id: notification._id },
                  {
                    $set: { pushSentAt: new Date() },
                    $addToSet: { channels: NOTIFICATION_CHANNELS.PUSH },
                  }
                );
              }
              // A user with no registered device is a normal state, not a
              // failure worth writing to the row.
              if (result.failed > 0) {
                return Notification.updateOne(
                  { _id: notification._id },
                  { $set: { pushError: result.reason || "push failed" } }
                );
              }
              return null;
            })
            .catch((error) =>
              console.error(
                `[notify] push bookkeeping failed for ${notification._id}:`,
                error?.message
              )
            )
        : null;

    /* ---------------- email ---------------- */
    const mailing =
      email && recipient.email
        ? sendMail({
            ...(mail || {}),
            to: recipient.email,
            subject: mail?.subject || renderedTitle,
            title: renderedTitle,
            body: mail?.body
              ? renderTemplate(mail.body, values)
              : renderedBody,
          })
            .then((result) =>
              Notification.updateOne(
                { _id: notification._id },
                result.sent
                  ? {
                      $set: { emailSentAt: new Date() },
                      $addToSet: { channels: NOTIFICATION_CHANNELS.EMAIL },
                    }
                  : { $set: { emailError: result.error || "unknown" } }
              )
            )
            .catch((error) =>
              console.error(
                `[notify] email bookkeeping failed for ${notification._id}:`,
                error?.message
              )
            )
        : null;

    if (awaitDelivery) {
      if (pushing) await pushing;
      if (mailing) await mailing;
    }

    return { created: true, notification };
  } catch (error) {
    // Duplicate dedupeKey — this exact notification already exists, which is
    // the whole point of the key and not an error.
    if (error?.code === 11000) return { created: false, reason: "duplicate" };

    console.error(`[notify] failed to record ${type} for ${userId}:`, error?.message);
    return { created: false, reason: error?.message };
  }
};

// Exported for the tests that check who a notification actually reaches.
exports.resolveRecipient = resolveRecipient;
