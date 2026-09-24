const { createCampaign } = require("./createCampaign");
const { runCampaign } = require("./runCampaign");
const { getAllCampaigns } = require("./getAllCampaigns");
const { getCampaign } = require("./getCampaign");
const { cancelCampaign } = require("./cancelCampaign");
const { getCampaignStats } = require("./getCampaignStats");
const { countAudience } = require("./countAudience");

const { getMyNotifications } = require("./getMyNotifications");
const { getUnreadCount } = require("./getUnreadCount");
const { markAsRead } = require("./markAsRead");
const { markAllAsRead } = require("./markAllAsRead");
const { deleteMyNotification } = require("./deleteMyNotification");

const { registerDevice } = require("./registerDevice");
const { unregisterDevice } = require("./unregisterDevice");

const {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require("./templates");

module.exports = {
  // Admin broadcast lifecycle.
  createCampaign,
  runCampaign,
  getAllCampaigns,
  getCampaign,
  cancelCampaign,
  getCampaignStats,
  countAudience,
  // The recipient's own feed.
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteMyNotification,
  // Push registration. `unregisterDevice` is what a logout must call.
  registerDevice,
  unregisterDevice,
  // Reusable copy.
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
