// controllers/mediaController.js
const ImageCategory = require("../models/ImageCategory");
const VideoCategory = require("../models/VideoCategory");

// CRUD for ImageCategory
exports.createImageCategory = async (req, res) => {
  try {
    const { title, description, url } = req.body;
    const imageCategory = await ImageCategory.create({ title, description, url });
    res.status(201).json({ success: true, message: "Image category created successfully", data: imageCategory, });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getImageCategories = async (req, res) => {
  try {
    const imageCategories = await ImageCategory.find();
    res.status(200).json({ success: true, data: imageCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateImageCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCategory = await ImageCategory.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: "Image category not found" });
    }
    res.status(200).json({
      success: true,
      message: "Image category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteImageCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await ImageCategory.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ success: false, message: "Image category not found" });
    }
    res.status(200).json({ success: true, message: "Image category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CRUD for VideoCategory
exports.createVideoCategory = async (req, res) => {
  try {
    const { title, description, url } = req.body;
    const videoCategory = await VideoCategory.create({ title, description, url });
    res.status(201).json({ success: true, message: "Video category created successfully", data: videoCategory, });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getVideoCategories = async (req, res) => {
  try {
    const videoCategories = await VideoCategory.find();
    res.status(200).json({ success: true, data: videoCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateVideoCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCategory = await VideoCategory.findByIdAndUpdate(id, req.body, { new: true, runValidators: true, });
    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: "Video category not found" });
    }
    res.status(200).json({ success: true, message: "Video category updated successfully", data: updatedCategory, });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteVideoCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await VideoCategory.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ success: false, message: "Video category not found" });
    }
    res.status(200).json({ success: true, message: "Video category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
