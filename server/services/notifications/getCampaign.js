const NotificationCampaign = require("../../models/NotificationCampaign");
const { throwError } = require("../../utils");

/** One campaign with its full stats, for the history drill-down. */
exports.getCampaign = async (id) => {
  const campaign = await NotificationCampaign.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate("createdBy", "name email")
    .lean();

  if (!campaign) throwError(404, "Notification campaign not found");

  return campaign;
};
