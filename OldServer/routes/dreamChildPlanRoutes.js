const express = require("express");
const router = express.Router();
const { createPlan, getPlans, updatePlan, deletePlan, applySubscription, getSubscription, getAllSubscription, } = require("../controllers/dreamChildPlanController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Create DreamChild Plan
router.post("/", protect, authorize("admin"), createPlan);

router.put("/update/:id", protect, authorize("admin"), updatePlan);

// Get All Plans
router.get("/", getPlans);


router.delete('/delete/:id', protect, authorize("admin"), deletePlan);

router.get('/subscription-all', getAllSubscription)

// router.post('/subscription', authorize("customer"), applySubscription)
router.post('/subscription', protect, applySubscription)

router.get('/subscription/:id', protect, getSubscription)

module.exports = router;