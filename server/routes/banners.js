const express = require("express");
const router = express.Router();

const { isAdmin } = require("../middlewares");
const {
  create,
  getAll,
  get,
  update,
  deleteBanner,
} = require("../controllers/banners");

router.post("/create", isAdmin, create);
router.get("/getAll", getAll);
router.get("/get/:id", get);
router.put("/update/:id", isAdmin, update);
router.delete("/delete/:id", isAdmin, deleteBanner);

module.exports = router;
