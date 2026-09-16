const express = require("express");
const router = express.Router();

const { verifyJwtToken, isAdmin } = require("../middlewares");
const {
  completeProfile,
  getProfile,
  getAll,
  create,
  remove,
} = require("../controllers/patients");

router.post("/complete-profile", verifyJwtToken, completeProfile);
router.put("/update-profile", verifyJwtToken, completeProfile);
router.get("/profile", verifyJwtToken, getProfile);
router.get("/get-all", getAll);
router.post("/create", isAdmin, create);
router.delete("/delete/:id", isAdmin, remove);

module.exports = router;
