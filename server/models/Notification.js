const mongoose = require("mongoose");
const { userField } = require("./validObjectId");
const {
  NOTIFICATION_AUDIENCE,
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_SEVERITY,
  NOTIFICATION_DEFAULTS,
} = require("../constants");

/**
 * One notification, addressed to one person — the row behind the in-app bell.
 *
 * Written first, delivered second: `helpers/notifications/notify.js` always
 * stores the row and only then attempts push and email. That way the in-app
 * feed is the source of truth and an FCM or SMTP outage costs a delivery, not
 * the record that it happened.
 *
 * One row per recipient rather than one shared row per broadcast, because read
 * state is per person: a message one patient has read and another has not
 * cannot be a single document.
 */
const notificationSchema = new mongoose.Schema(
  {
    userId: { ...userField, required: true, index: true },

    /**
     * Which feed this belongs in, from the recipient's `User.role`. Stored
     * rather than joined so a mixed send (patients and doctors together) still
     * lands in the right feed for each of them without a lookup on read.
     */
    audience: {
      type: String,
      enum: Object.values(NOTIFICATION_AUDIENCE),
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
    },
    severity: {
      type: String,
      enum: Object.values(NOTIFICATION_SEVERITY),
      default: NOTIFICATION_SEVERITY.INFO,
    },

    // Already merge-tag substituted, per recipient.
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: NOTIFICATION_DEFAULTS.maxTitleLength,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: NOTIFICATION_DEFAULTS.maxBodyLength,
    },
    imageUrl: { type: String, trim: true },

    /**
     * Where it actually landed — not what was attempted. `IN_APP` is present
     * from creation; `PUSH` and `EMAIL` are added only once that delivery has
     * succeeded, which is what makes this column answer "did they get it".
     */
    channels: {
      type: [{ type: String, enum: Object.values(NOTIFICATION_CHANNELS) }],
      default: [NOTIFICATION_CHANNELS.IN_APP],
    },
    pushSentAt: { type: Date },
    pushError: { type: String, trim: true },
    emailSentAt: { type: Date },
    emailError: { type: String, trim: true },

    /**
     * Anything the client needs to render or route: `deepLink`,
     * `appointmentId`, `subscriptionId`. Kept as one free-form column rather
     * than a growing list of nullable ids.
     */
    meta: { type: mongoose.Schema.Types.Mixed },

    // Set when the row came out of an admin broadcast, so a campaign can list
    // its own rows and count what it actually wrote.
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NotificationCampaign",
    },

    /**
     * Stable identity for a logical event, e.g.
     * `APPOINTMENT_REMINDER:<appointmentId>:24H`. Unique, so a reminder job
     * that runs every 30 minutes cannot send the same reminder 48 times.
     */
    dedupeKey: { type: String, trim: true },

    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

// The bell list: one person's feed, newest first.
notificationSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });
// The unread badge. Runs on every app open, and filters before it sorts.
notificationSchema.index({ userId: 1, isRead: 1, isDeleted: 1 });
// Campaign drill-down: which rows did this broadcast actually write.
notificationSchema.index({ campaignId: 1 });
// Sparse, so the many rows without a dedupeKey do not all collide on null.
notificationSchema.index({ dedupeKey: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Notification", notificationSchema);
