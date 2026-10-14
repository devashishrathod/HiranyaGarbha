const express = require("express");
const router = express.Router();

const { isAdmin } = require("../middlewares");
const { list, stats, get } = require("../controllers/patientSubscriptions/admin");

/*
 * Admin plan history — read-only. Mounted at
 * `/hiranyagarbha/admin/patient-subscriptions` by the auto-loader.
 *
 * Filters (both list and stats): search, state, tier, kind, trimester,
 * paymentStatus, source, patientId, packageId, fromDate, toDate.
 * See docs/SUBSCRIPTIONS.md, "Admin — Phase 3".
 */

// Static paths stay above /:id
router.get("/", isAdmin, list);
router.get("/stats", isAdmin, stats);
router.get("/:id", isAdmin, get);

module.exports = { router, routePrefix: "/admin/patient-subscriptions" };
