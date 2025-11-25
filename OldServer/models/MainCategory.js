// models/MainCategory.js
const mongoose = require("mongoose");

const MainCategorySchema = new mongoose.Schema(
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
    image: {
      type: String,
      required: true, // URL for the main category image
      validate: {
        validator: function (v) {
          return /^(http|https):\/\/[^ "]+$/.test(v);
        },
        message: "Please provide a valid URL for the image",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MainCategory", MainCategorySchema);
