const express = require("express");
const router = express.Router();

const { verifyJwtToken } = require("../middlewares");
const { addOrUpdate, get } = require("../controllers/doctorAvailability");

router.post("/add-or-update", verifyJwtToken, addOrUpdate);
router.get("/get/:doctorId", verifyJwtToken, get);

module.exports = router;
