// routes/imageRoutes.js
const express = require("express");
const router = express.Router();
const { createImage, getImagesByCategory, updateImage, deleteImage, getAllCategory } = require("../controllers/imageController");

// Image Routes
router.post("/", createImage);
router.get("/", getAllCategory);
router.get("/category/:categoryId", getImagesByCategory);
router.put("/:id", updateImage);
router.delete("/:id", deleteImage);

module.exports = router;
