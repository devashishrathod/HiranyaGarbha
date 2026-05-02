const express = require("express");
const router = express.Router();

const { isAdmin } = require("../middlewares");
const {
  createSubscription,
  getAll,
  get,
  update,
  deleteSubscription,
} = require("../controllers/subscriptions");

router.post("/add", isAdmin, createSubscription);
router.get("/getAll", getAll);
router.get("/get/:id", get);
router.put("/update/:id", isAdmin, update);
router.delete("/delete/:id", isAdmin, deleteSubscription);

module.exports = router;
