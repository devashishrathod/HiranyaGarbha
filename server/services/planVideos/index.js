const { createPlanVideo } = require("./createPlanVideo");
const { updatePlanVideo } = require("./updatePlanVideo");
const { deletePlanVideo } = require("./deletePlanVideo");
const { getPlanVideo } = require("./getPlanVideo");
const { getAllPlanVideos } = require("./getAllPlanVideos");
const {
  getPlanVideoFeed,
  getPlanVideoFeedItem,
} = require("./getPlanVideoFeed");

module.exports = {
  createPlanVideo,
  updatePlanVideo,
  deletePlanVideo,
  getPlanVideo,
  getAllPlanVideos,
  getPlanVideoFeed,
  getPlanVideoFeedItem,
};
