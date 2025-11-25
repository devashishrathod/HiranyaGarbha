// models/VideoCategory.js
const mongoose = require("mongoose");

const VideoCategorySchema = new mongoose.Schema(
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
      required: true, // URL for the video
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

module.exports = mongoose.model("VideoCategory", VideoCategorySchema);
