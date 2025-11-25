// models/Video.js
const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema(
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
      required: true,
      validate: {
        validator: function (v) {
          return /^(http|https):\/\/[^ "]+$/.test(v);
        },
        message: "Please provide a valid URL",
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VideoCategory", // Reference to the VideoCategory model
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", VideoSchema);
