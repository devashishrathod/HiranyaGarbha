const PlanVideo = require("../../models/PlanVideo");
const { pagination } = require("../../utils");
const { buildFilters, buildPipeline, ADMIN_VIEW } = require("./pipeline");

exports.getAllPlanVideos = async (query = {}) => {
  const { page = 1, limit = 10, sortBy, sortOrder } = query;
  const { match, afterLookup } = buildFilters(query);
  const pipeline = buildPipeline({
    match,
    afterLookup,
    sortBy,
    sortOrder,
    ...ADMIN_VIEW,
  });
  return pagination(PlanVideo, pipeline, page, limit);
};
