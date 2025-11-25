// controllers/mainCategoryController.js
const MainCategory = require("../models/MainCategory");

// Create a main category
exports.createMainCategory = async (req, res) => {
  try {
    const { title, description, image } = req.body;

    // Create the main category
    const mainCategory = await MainCategory.create({ title, description, image });

    res.status(201).json({ success: true, message: "Main category created successfully", data: mainCategory, });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all main categories
exports.getMainCategories = async (req, res) => {
  try {
    const mainCategories = await MainCategory.find();

    res.status(200).json({ success: true, data: mainCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMainCategorieSingle = async (req, res) => {
  const id = req.params?.id;
  try {

    const mainCategories = await MainCategory.findById(id);

    res.status(200).json({ success: true, data: mainCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a main category
exports.updateMainCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image } = req.body;

    // Find and update the main category
    const updatedCategory = await MainCategory.findByIdAndUpdate(id, { title, description, image }, { new: true, runValidators: true });

    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: "Main category not found" });
    }

    res.status(200).json({
      success: true,
      message: "Main category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a main category
exports.deleteMainCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the main category
    const deletedCategory = await MainCategory.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ success: false, message: "Main category not found" });
    }

    res.status(200).json({ success: true, message: "Main category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
