const express = require("express");
const router = express.Router();

const { isAdmin } = require("../middlewares");
const dashboard = require("../controllers/dashboard");

/**
 * Admin dashboard. Mounted at `/hiranyagarbha/dashboard` by the auto-loader
 * in routes/index.js.
 *
 * `GET /summary?range=today|7d|30d|12m` or
 * `GET /summary?range=custom&from=YYYY-MM-DD&to=YYYY-MM-DD`.
 * Revenue and patient data — admin only.
 */
router.get("/summary", isAdmin, dashboard.summary);

module.exports = router;
