// controllers/videoController.js
const Video = require("../models/Video");
const VideoCategory = require("../models/VideoCategory");

// Create a video for a category
exports.createVideo = async (req, res) => {
  try {
    const { title, description, url, categoryId } = req.body;

    // Check if the category exists
    const category = await VideoCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Create a new video related to the category
    const video = await Video.create({ title, description, url, category: categoryId });

    res.status(201).json({ success: true, message: "Video created successfully", data: video, });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllVideo = async (req, res) => {
  try {
    const videoCategories = await Video.find();

    if (!videoCategories || videoCategories.length === 0) {
      return res.status(404).json({ success: false, message: "No video categories found" });
    }

    res.status(200).json({ success: true, data: videoCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get all videos for a specific category
exports.getVideosByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const videos = await Video.find({ category: categoryId });

    if (!videos || videos.length === 0) {
      return res.status(404).json({ success: false, message: "No videos found for this category" });
    }

    res.status(200).json({ success: true, data: videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a video
exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, url, categoryId } = req.body;

    // Check if the category exists
    const category = await VideoCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Find and update the video
    const updatedVideo = await Video.findByIdAndUpdate(id, { title, description, url, category: categoryId }, { new: true, runValidators: true });
    if (!updatedVideo) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }

    res.status(200).json({
      success: true,
      message: "Video updated successfully",
      data: updatedVideo,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a video
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVideo = await Video.findByIdAndDelete(id);
    if (!deletedVideo) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }

    res.status(200).json({ success: true, message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
