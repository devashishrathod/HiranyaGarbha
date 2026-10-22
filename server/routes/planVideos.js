const express = require("express");
const router = express.Router();

const { isAdmin, optionalJwtToken } = require("../middlewares");
const {
  create,
  getAll,
  get,
  update,
  deletePlanVideo,
  feed,
  feedItem,
} = require("../controllers/planVideos");

/*
 * Plan videos — see docs/PLAN_VIDEOS.md.
 *
 * Everything but the feed needs an admin token. The feed is public: with no
 * token it serves Basic videos, and a patient token adds what their plan
 * covers.
 */
router.post("/create", isAdmin, create);
router.get("/getAll", isAdmin, getAll);
router.get("/get/:id", isAdmin, get);
router.put("/update/:id", isAdmin, update);
router.delete("/delete/:id", isAdmin, deletePlanVideo);

router.get("/feed", optionalJwtToken, feed);
router.get("/feed/:id", optionalJwtToken, feedItem);

module.exports = { router, routePrefix: "/plan-videos" };
