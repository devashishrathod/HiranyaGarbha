const express = require("express");
const router = express.Router();

const { createMainCategory, getMainCategories, updateMainCategory, deleteMainCategory, getMainCategorieSingle, } = require("../controllers/mainCategoryController");

// MainCategory routes
router.post("/", createMainCategory);
router.get("/", getMainCategories);

router.get("/:id", getMainCategorieSingle);

router.put("/:id", updateMainCategory);
router.delete("/:id", deleteMainCategory);



module.exports = router;
