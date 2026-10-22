const mongoose = require("mongoose");
const {
  SUBSCRIPTION_TYPES,
  SUBSCRIPTION_TIERS,
  PLAN_TRIMESTERS,
} = require("../constants");
const { normalizeModules } = require("../helpers/subscriptions/modules");

/*
 * One point in the course. Description and video are optional; the video can
 * be any link, YouTube ones play inline in the panel.
 */
const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    videoUrl: { type: String, trim: true },
  },
  { _id: false }
);

/*
 * One price point of a package. A package carries one plan per trimester the
 * mother can join in, so the Pro/Elite cards can change their price without
 * duplicating the whole module list per trimester.
 */
const planSchema = new mongoose.Schema(
  {
    trimester: {
      type: String,
      enum: Object.values(PLAN_TRIMESTERS),
      required: true,
    },
    label: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    durationInDays: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const premiumFeaturesSchema = new mongoose.Schema(
  {
    medicalCare: { type: [String], default: [] },
    holisticWellness: { type: [String], default: [] },
    birthPreparation: { type: [String], default: [] },
    afterDelivery: { type: [String], default: [] },
    premiumSupport: { type: [String], default: [] },
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tier: {
      type: String,
      enum: Object.values(SUBSCRIPTION_TIERS),
      required: true,
    },
    subtitle: { type: String, trim: true },
    description: { type: String, trim: true },

    // Display copy shown on the package card
    duration: { type: String, trim: true }, // e.g. "Entire Pregnancy"
    idealFor: { type: String, trim: true },
    badge: { type: String, trim: true }, // e.g. "Best Value"
    theme: {
      color: { type: String, trim: true }, // tailwind gradient stops
      borderColor: { type: String, trim: true },
    },
    isPopular: { type: Boolean, default: false },
    isFree: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },

    // Content
    // Legacy string modules are turned into { title } on the way in
    modules: { type: [moduleSchema], default: [], set: normalizeModules },
    includes: { type: [String], default: [] },
    exclusiveBenefits: { type: [String], default: [] },
    premiumFeatures: { type: premiumFeaturesSchema, default: undefined },

    // Pricing: plans hold the real numbers, the three fields below are derived
    // from the cheapest active plan so list/table views keep working as before.
    plans: { type: [planSchema], default: [] },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    durationInDays: { type: Number },

    // Legacy fields, kept so older subscription records stay readable
    type: {
      type: String,
      enum: Object.values(SUBSCRIPTION_TYPES),
    },
    benefits: { type: [String], default: [] },
    limitations: { type: [String], default: [] },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

/*
 * ⚠️ Records saved before modules became objects still hold strings, and
 * Mongoose drops the whole array when it meets one. Converting before init
 * keeps them readable (and an edit-and-save from wiping them) until
 * `npm run migrate:module-objects` has run.
 */
subscriptionSchema.pre("init", function (raw) {
  if (Array.isArray(raw?.modules)) raw.modules = normalizeModules(raw.modules);
});

subscriptionSchema.index({ tier: 1, isDeleted: 1 });
subscriptionSchema.index({ displayOrder: 1 });

module.exports = mongoose.model("Subscription", subscriptionSchema);
