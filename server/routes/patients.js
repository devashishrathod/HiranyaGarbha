const express = require("express");
const router = express.Router();

const { verifyJwtToken } = require("../middlewares");
const { completeProfile, getProfile } = require("../controllers/patients");

router.post("/complete-profile", verifyJwtToken, completeProfile);
router.put("/update-profile", verifyJwtToken, completeProfile);
router.get("/profile", verifyJwtToken, getProfile);

module.exports = router;
