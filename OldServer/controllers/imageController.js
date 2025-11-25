// controllers/imageController.js
const Image = require("../models/Image");
const ImageCategory = require("../models/ImageCategory");

// Create an image for a category
exports.createImage = async (req, res) => {
  try {
    const { title, description, url, categoryId } = req.body;

    // Check if the category exists
    const category = await ImageCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Create a new image related to the category
    const image = await Image.create({ title, description, url, category: categoryId });

    res.status(201).json({ success: true, message: "Image created successfully", data: image, });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllCategory = async (req, res) => {
  try {
    const categories = await Image.find();
    if (!categories || categories.length === 0) {
      return res.status(404).json({ success: false, message: "No categories found" });
    }

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get all images for a specific category
exports.getImagesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const images = await Image.find({ category: categoryId });

    if (!images || images.length === 0) {
      return res.status(404).json({ success: false, message: "No images found for this category" });
    }

    res.status(200).json({ success: true, data: images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update an image
exports.updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, url, categoryId } = req.body;

    // Check if the category exists
    const category = await ImageCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Find and update the image
    const updatedImage = await Image.findByIdAndUpdate(id, { title, description, url, category: categoryId }, { new: true, runValidators: true });
    if (!updatedImage) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    res.status(200).json({
      success: true,
      message: "Image updated successfully",
      data: updatedImage,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete an image
exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedImage = await Image.findByIdAndDelete(id);
    if (!deletedImage) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    res.status(200).json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
