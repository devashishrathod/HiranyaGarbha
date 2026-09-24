const User = require("../../models/User");
const { sendPush } = require("./fcmClient");

/**
 * Push a notification to the devices of the given users.
 *
 * ⚠️ **This is the only file in the codebase that knows where a push token
 * lives.** Everything above it — `notify`, `notifyAudience`, every appointment
 * and subscription notice — names *users*, and this finds their devices. That
 * is deliberate: when tokens move to a `DeviceToken` collection
 * (docs/NOTIFICATIONS.md §9.3), this file changes and nothing else does.
 *
 * Today a token lives on `User.fcmToken`, which means one device per user. The
 * multi-device story, the delivery history and the soft-failure counter all
 * arrive with that migration.
 *
 * Keeps the token honest as a side effect: a token the provider reports as
 * gone (app uninstalled, token rotated) is cleared, so a dead device is not
 * retried on every future broadcast.
 *
 * ⚠️ **Never throws.** Push is best-effort; the in-app row is the record.
 *
 * @param {Array}  userIds
 * @param {object} message  { title, body, data, imageUrl }
 * @returns {Promise<{sent:number, failed:number, devices:number, users:number,
 *                    noDevice:number, sentUserIds:string[], cleared:number,
 *                    skipped?:boolean, reason?:string}>}
 */
exports.dispatchPush = async (userIds = [], message = {}) => {
  const empty = {
    sent: 0,
    failed: 0,
    devices: 0,
    users: 0,
    noDevice: 0,
    sentUserIds: [],
    cleared: 0,
  };

  try {
    const ids = [...new Set(userIds.filter(Boolean).map(String))];
    if (!ids.length) return empty;

    const users = await User.find({
      _id: { $in: ids },
      fcmToken: { $nin: [null, ""] },
    })
      .select("_id fcmToken")
      .lean();

    const noDevice = ids.length - users.length;

    if (!users.length) {
      return {
        ...empty,
        users: ids.length,
        noDevice,
        reason: "no registered devices",
      };
    }

    /**
     * A token maps back to *users*, plural.
     *
     * `User.fcmToken` has no uniqueness constraint, so the same device token
     * can sit on two accounts — precisely what happens when someone logs out
     * of a shared phone without the app de-registering (§9.2). Treating the
     * mapping as one-to-one would silently drop one of them from the report.
     */
    const usersByToken = new Map();
    users.forEach((user) => {
      const list = usersByToken.get(user.fcmToken) || [];
      list.push(String(user._id));
      usersByToken.set(user.fcmToken, list);
    });

    const result = await sendPush([...usersByToken.keys()], message);

    if (result.skipped) {
      return {
        ...empty,
        users: ids.length,
        devices: usersByToken.size,
        noDevice,
        skipped: true,
        reason: result.reason,
      };
    }

    // The provider says these are gone. Clearing the field stops every future
    // broadcast from paying for a request that cannot land.
    let cleared = 0;
    if (result.deadTokens.length) {
      const outcome = await User.updateMany(
        { fcmToken: { $in: result.deadTokens } },
        { $set: { fcmToken: null } }
      );
      cleared = outcome?.modifiedCount || 0;
    }

    const sentUserIds = result.results
      .filter((item) => item.sent)
      .flatMap((item) => usersByToken.get(item.token) || []);

    return {
      sent: result.sent,
      failed: result.failed,
      devices: usersByToken.size,
      users: ids.length,
      noDevice,
      // Distinct people actually reached, which is the number worth reporting
      // when one token can serve more than one account.
      sentUserIds: [...new Set(sentUserIds)],
      cleared,
    };
  } catch (error) {
    console.error("[dispatchPush] failed:", error?.message);
    return { ...empty, reason: error?.message };
  }
};
