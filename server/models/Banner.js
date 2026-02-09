const mongoose = require("mongoose");
const { DEFAULT_IMAGES } = require("../constants");
const { categoryField } = require("./validObjectId");

const bannerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    categoryId: categoryField,
    image: { type: String, default: DEFAULT_IMAGES.BANNER },
    video: { type: String },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Banner", bannerSchema);
