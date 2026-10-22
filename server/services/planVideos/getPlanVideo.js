const PlanVideo = require("../../models/PlanVideo");
const { throwError, validateObjectId } = require("../../utils");
const { toId, buildPipeline, ADMIN_VIEW } = require("./pipeline");

exports.getPlanVideo = async (id) => {
  validateObjectId(id, "Plan video ID");
  const [video] = await PlanVideo.aggregate(
    buildPipeline({ match: { _id: toId(id), isDeleted: false }, ...ADMIN_VIEW }),
  );
  if (!video) throwError(404, "Plan video not found");
  return video;
};
