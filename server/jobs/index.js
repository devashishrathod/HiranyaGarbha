const {
  startScheduledCampaigns,
  sweepScheduledCampaigns,
} = require("./scheduledCampaigns");

/**
 * Background jobs, started once from index.js after the database connects.
 *
 * ⚠️ Started **after** the connection, not at require time: a sweep that runs
 * before mongoose is connected buffers its query and then times out, which
 * looks like a broken scheduler rather than a boot-order problem.
 */
exports.startJobs = () => {
  startScheduledCampaigns();
};

exports.sweepScheduledCampaigns = sweepScheduledCampaigns;
