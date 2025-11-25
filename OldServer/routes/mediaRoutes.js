// routes/mediaRoutes.js
const express = require("express");
const router = express.Router();

const { createImageCategory, getImageCategories, updateImageCategory, deleteImageCategory, createVideoCategory, getVideoCategories, updateVideoCategory, deleteVideoCategory, } = require("../controllers/mediaController");

// ImageCategory routes
router.post("/images", createImageCategory);
router.get("/images", getImageCategories);
router.put("/images/:id", updateImageCategory);
router.delete("/images/:id", deleteImageCategory);

// VideoCategory routes
router.post("/videos", createVideoCategory);
router.get("/videos", getVideoCategories);
router.put("/videos/:id", updateVideoCategory);
router.delete("/videos/:id", deleteVideoCategory);

module.exports = router;