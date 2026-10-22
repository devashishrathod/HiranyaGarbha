const mongoose = require("mongoose");
const { VIDEO_TRIMESTERS } = require("../constants");
const { subCategoryField } = require("./validObjectId");

const atLeastOne = (label) => ({
  validator: (list) => Array.isArray(list) && list.length > 0,
  message: `Pick at least one ${label}`,
});

/*
 * A YouTube video shown to patients by plan and trimester.
 * See docs/PLAN_VIDEOS.md.
 *
 * Not a Banner: gallery banners are public media served without a login,
 * while these are gated, so keeping them apart means no gallery query can
 * ever leak a plan video.
 *
 * Plans are referenced by id and read live, so renaming a package shows
 * everywhere and a deleted package drops out on its own.
 */
const planVideoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // Kept as typed: links in it are case-sensitive.
    description: { type: String, required: true, trim: true },
    // As pasted (https:// added if missing), for "Open in YouTube". Players
    // and thumbnails use youtubeId.
    videoUrl: { type: String, required: true, trim: true },
    youtubeId: { type: String, required: true },
    packageIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subscription" }],
      validate: atLeastOne("plan"),
    },
    trimesters: {
      type: [{ type: String, enum: VIDEO_TRIMESTERS }],
      validate: atLeastOne("trimester"),
    },
    // Optional, and always one of the Gallery category's subcategories.
    subCategoryId: subCategoryField,
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

planVideoSchema.index({ isDeleted: 1, isActive: 1, packageIds: 1 });
planVideoSchema.index({ createdAt: -1 });

module.exports = mongoose.model("PlanVideo", planVideoSchema);
