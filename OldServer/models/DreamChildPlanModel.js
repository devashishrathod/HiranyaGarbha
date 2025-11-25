const mongoose = require("mongoose");

const DreamChildPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: "Best Investment You can make for Your Child, Your Future.",
  },
  category: {
    type: String,
    required: true,
    default: "Silver",
  },
  price: {
    original: { type: Number, required: true },
    discounted: { type: Number, required: true },
    discountPercentage: { type: Number, required: true },
    gstIncluded: { type: Boolean, default: true },
  },
  duration: {
    type: String,
    required: true,
    default: "9",
  },
  features: {
    dailyActivities: [
      {
        name: { type: String, required: true },
        isAvailable: { type: Boolean, default: true },
      },
    ],
    familyHarmony: [
      {
        name: { type: String, required: true },
        isAvailable: { type: Boolean, default: true },
      },
    ],
    musicalPregnancy: [
      {
        name: { type: String, required: true },
        isAvailable: { type: Boolean, default: true },
      },
    ],
    yogaDiet: [
      {
        name: { type: String, required: true },
        isAvailable: { type: Boolean, default: true },
      },
    ],
    workshops: [
      {
        name: { type: String, required: true },
        isAvailable: { type: Boolean, default: true },
      },
    ],
    expertSessions: [
      {
        name: { type: String, required: true },
        isAvailable: { type: Boolean, default: true },
      },
    ],
    advancedMaterial: [
      {
        name: { type: String, required: true },
        isAvailable: { type: Boolean, default: true },
      },
    ],
    liveSessions: [
      {
        name: { type: String, required: true },
        isAvailable: { type: Boolean, default: true },
      },
    ],
    support: [
      {
        name: { type: String, required: true },
        isAvailable: { type: Boolean, default: true },
      },
    ],
  },
}, { timestamps: true });

module.exports = mongoose.model("DreamChildPlan", DreamChildPlanSchema);
