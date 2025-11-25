// models/ImageCategory.js
const mongoose = require("mongoose");

const ImageCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true, // URL for the image
      validate: {
        validator: function (v) {
          return /^(http|https):\/\/[^ "]+$/.test(v);
        },
        message: "Please provide a valid URL",
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MainCategory",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ImageCategory", ImageCategorySchema);
