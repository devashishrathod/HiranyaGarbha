const mongoose = require("mongoose");
const { userField } = require("./validObjectId");
const {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_DEFAULTS,
} = require("../constants");

/**
 * Reusable copy for the updates an admin sends often — "appointment reminder",
 * "new package launch".
 *
 * Plain storage, no delivery logic: loading a template only pre-fills the
 * composer. Whatever the admin then sends goes through the same campaign path
 * as anything typed from scratch.
 */
const notificationTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    // When to use it — shown on the template card.
    description: { type: String, trim: true, maxlength: 300 },

    channels: {
      type: [{ type: String, enum: Object.values(NOTIFICATION_CHANNELS) }],
      default: [],
    },
    title: {
      type: String,
      trim: true,
      maxlength: NOTIFICATION_DEFAULTS.maxTitleLength,
    },
    body: {
      type: String,
      trim: true,
      maxlength: NOTIFICATION_DEFAULTS.maxBodyLength,
    },
    subject: { type: String, trim: true },
    emailBody: { type: String, trim: true },

    // Free text, e.g. "Active patients in the city". A hint for whoever picks
    // the template — not a stored audience, because the admin re-chooses it.
    audienceHint: { type: String, trim: true, maxlength: 200 },

    createdBy: userField,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

notificationTemplateSchema.index({ isDeleted: 1, createdAt: -1 });

module.exports = mongoose.model(
  "NotificationTemplate",
  notificationTemplateSchema
);
