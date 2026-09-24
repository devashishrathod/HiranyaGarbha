const express = require("express");
const router = express.Router();

const { verifyJwtToken } = require("../middlewares");
const {
  preview,
  checkout,
  verify,
  mine,
  history,
  entitlement,
} = require("../controllers/patientSubscriptions");

/*
 * Patient-facing subscription routes.
 *
 * ⚠️ Every one of these reads `req.patientId` from the JWT. None of them takes
 * a patient id or an amount from the request — see docs/SUBSCRIPTIONS.md §3.
 *
 * Admin routes (grant, adjust, refund) land in phase 3 behind `isAdmin`.
 */

// Static paths stay above anything with a parameter
router.get("/my", verifyJwtToken, mine);
router.get("/my/history", verifyJwtToken, history);
router.get("/my/entitlement", verifyJwtToken, entitlement);

router.post("/preview", verifyJwtToken, preview);
router.post("/checkout", verifyJwtToken, checkout);
router.post("/verify", verifyJwtToken, verify);

module.exports = { router, routePrefix: "/patient-subscriptions" };
