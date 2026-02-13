const mongoose = require("mongoose");
const { DEFAULT_IMAGES } = require("../constants");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: { type: String, trim: true },
    image: { type: String, default: DEFAULT_IMAGES.CATEGORY },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

categorySchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

module.exports = mongoose.model("Category", categorySchema);
