const mongoose = require("mongoose");
const { userField } = require("./validObjectId");
const {
  NOTIFICATION_CHANNELS,
  CAMPAIGN_STATUS,
  AUDIENCE_MODES,
  AUDIENCE_GROUPS,
  NOTIFICATION_DEFAULTS,
} = require("../constants");

/**
 * The audience an admin described, stored **declaratively**.
 *
 * ⚠️ Not a frozen list of user ids. A campaign scheduled for next week and
 * aimed at "all active patients" must reach the patients who exist when it
 * runs, not the ones who existed when it was composed. `resolveAudience()`
 * turns this back into people at send time.
 *
 * `MANUAL` and `CSV` are the exceptions by nature — a hand-picked list is a
 * frozen list — and those are stored as the ids and contacts the admin chose.
 */
const audienceSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      enum: Object.values(AUDIENCE_MODES),
      required: true,
    },
    // ROLE mode: `User.role` values.
    roles: [{ type: String, trim: true }],
    // MANUAL mode.
    userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // SEGMENT mode: the filters run against the Patient / Doctor collection.
    segment: {
      group: { type: String, enum: Object.values(AUDIENCE_GROUPS) },
      isActive: { type: Boolean },
      search: { type: String, trim: true },
      fromDate: { type: Date },
      toDate: { type: Date },
    },
    // CSV mode.
    contacts: {
      emails: [{ type: String, trim: true, lowercase: true }],
      phones: [{ type: String, trim: true }],
    },
  },
  { _id: false }
);

const deliveryStatSchema = new mongoose.Schema(
  { sent: { type: Number, default: 0 }, failed: { type: Number, default: 0 } },
  { _id: false }
);

/**
 * One admin broadcast — what the panel's History tab lists.
 *
 * Holds what was composed, who it was aimed at, when it goes out and what
 * happened. The per-recipient rows it produced live in `Notification`, linked
 * back by `campaignId`.
 */
const notificationCampaignSchema = new mongoose.Schema(
  {
    // ---- content ----
    // Push / in-app.
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
    // Client route the app opens when the notification is tapped.
    deepLink: { type: String, trim: true },
    // Email, which carries its own subject and a longer body.
    subject: { type: String, trim: true },
    emailBody: { type: String, trim: true },

    channels: {
      type: [{ type: String, enum: Object.values(NOTIFICATION_CHANNELS) }],
      required: true,
    },

    // ---- audience ----
    audience: { type: audienceSchema, required: true },
    // Human-readable, frozen at compose time: "All patients, all doctors".
    // The stat is recomputed on send; this is only for the history table.
    audienceLabel: { type: String, trim: true },

    // ---- scheduling ----
    status: {
      type: String,
      enum: Object.values(CAMPAIGN_STATUS),
      default: CAMPAIGN_STATUS.SENDING,
      index: true,
    },
    // Null for send-now. The scheduler sweeps on this.
    scheduledAt: { type: Date },

    // ---- run bookkeeping ----
    startedAt: { type: Date },
    completedAt: { type: Date },
    error: { type: String, trim: true },

    stats: {
      // Recipients the audience resolved to at send time.
      targeted: { type: Number, default: 0 },
      // Notification rows this run actually wrote. Lower than `targeted` when
      // dedupe skipped someone who had already been notified.
      created: { type: Number, default: 0 },
      duplicates: { type: Number, default: 0 },
      push: {
        sent: { type: Number, default: 0 },
        failed: { type: Number, default: 0 },
        // Users with no registered device — unreachable on push, which is
        // different from a push that was attempted and failed.
        noDevice: { type: Number, default: 0 },
      },
      email: { type: deliveryStatSchema, default: () => ({}) },
      // CSV entries that matched no account and could not be reached at all.
      unmatched: { type: Number, default: 0 },
    },

    createdBy: userField,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

// The history list: newest first.
notificationCampaignSchema.index({ isDeleted: 1, createdAt: -1 });
// The scheduler sweep: due campaigns, cheapest possible query.
notificationCampaignSchema.index({ status: 1, scheduledAt: 1 });

module.exports = mongoose.model(
  "NotificationCampaign",
  notificationCampaignSchema
);
