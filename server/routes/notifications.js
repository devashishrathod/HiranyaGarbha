const express = require("express");
const router = express.Router();

const { isAdmin, verifyJwtToken } = require("../middlewares");
const {
  campaigns,
  feed,
  devices,
  templates,
} = require("../controllers/notifications");

/**
 * Notification routes. Mounted at `/hiranyagarbha/notifications` by the
 * auto-loader in routes/index.js.
 *
 * Three groups, and the middleware is what separates them:
 *
 *  - `/campaigns`, `/templates`, `/audience` — admin only. Composing a
 *    broadcast is not something a patient or a doctor may do.
 *  - `/my/*` — any logged-in user, scoped to their own token.
 *  - `/device/*` — any logged-in user, registering their own device.
 */

/* ---------------- admin: broadcast ---------------- */

router.post("/audience/count", isAdmin, campaigns.audienceCount);

router.post("/campaigns", isAdmin, campaigns.create);
router.get("/campaigns", isAdmin, campaigns.getAll);
// Declared before `/campaigns/:id` so "stats" is not read as an id.
router.get("/campaigns/stats", isAdmin, campaigns.stats);
router.get("/campaigns/:id", isAdmin, campaigns.get);
router.patch("/campaigns/:id/cancel", isAdmin, campaigns.cancel);

/* ---------------- admin: templates ---------------- */

router.get("/templates", isAdmin, templates.getAll);
router.post("/templates", isAdmin, templates.create);
router.put("/templates/:id", isAdmin, templates.update);
router.delete("/templates/:id", isAdmin, templates.remove);

/* ---------------- admin: health ---------------- */

router.get("/health", isAdmin, devices.health);

/* ---------------- any logged-in user: their feed ---------------- */

router.get("/my", verifyJwtToken, feed.list);
router.get("/my/unread-count", verifyJwtToken, feed.unreadCount);
// Before `/my/:id/read`, so "read-all" is not parsed as a notification id.
router.patch("/my/read-all", verifyJwtToken, feed.readAll);
router.patch("/my/:id/read", verifyJwtToken, feed.read);
router.delete("/my/:id", verifyJwtToken, feed.remove);

/* ---------------- any logged-in user: push registration ---------------- */

router.post("/device/register", verifyJwtToken, devices.register);
// What the app calls on logout — see docs/NOTIFICATIONS.md §9.2.
router.post("/device/unregister", verifyJwtToken, devices.unregister);

module.exports = router;
