const PlanVideo = require("../../models/PlanVideo");
const { pagination, throwError, validateObjectId } = require("../../utils");
const { toId, buildFilters, buildPipeline, FEED_VIEW } = require("./pipeline");
const { resolveViewerAccess } = require("./access");

/**
 * The patient app's list. Public: without a patient the viewer gets Basic
 * videos only. `access` tells the app which tier and trimesters it was given.
 */
exports.getPlanVideoFeed = async (query = {}, patientId) => {
  const { page = 1, limit = 10, sortBy, sortOrder } = query;
  const { match, afterLookup } = buildFilters(query);
  const { filter, access } = await resolveViewerAccess(patientId);

  const pipeline = buildPipeline({
    match: { ...match, isActive: true, $and: [filter] },
    afterLookup,
    sortBy,
    sortOrder,
    ...FEED_VIEW,
  });
  const result = await pagination(PlanVideo, pipeline, page, limit);
  return { ...result, access };
};

exports.getPlanVideoFeedItem = async (id, patientId) => {
  validateObjectId(id, "Video ID");
  const { filter } = await resolveViewerAccess(patientId);
  const [video] = await PlanVideo.aggregate(
    buildPipeline({
      match: { _id: toId(id), isDeleted: false, isActive: true, $and: [filter] },
      ...FEED_VIEW,
    }),
  );
  // One answer for "no such video" and "not on your plan": the feed never
  // confirms that a locked video exists.
  if (!video) throwError(404, "Video not found");
  return video;
};
