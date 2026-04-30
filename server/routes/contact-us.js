const express = require("express");
const router = express.Router();

const { isAdmin } = require("../middlewares");
const {
  create,
  getAll,
  get,
  update,
  deleteContactUs,
} = require("../controllers/contactUs");

router.post("/create", create);
router.get("/getAll", isAdmin, getAll);
router.get("/get/:id", isAdmin, get);
router.put("/update/:id", isAdmin, update);
router.delete("/delete/:id", isAdmin, deleteContactUs);

module.exports = router;
