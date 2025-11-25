// routes/videoRoutes.js
const express = require("express");
const router = express.Router();
const { createVideo, getVideosByCategory, updateVideo, deleteVideo, getAllVideo } = require("../controllers/videoController");

// Video Routes
router.post("/", createVideo);
router.get("/", getAllVideo);
router.get("/category/:categoryId", getVideosByCategory);
router.put("/:id", updateVideo);
router.delete("/:id", deleteVideo);

module.exports = router;
