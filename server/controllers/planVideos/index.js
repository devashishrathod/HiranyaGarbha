const { create } = require("./create");
const { getAll } = require("./getAll");
const { get } = require("./get");
const { update } = require("./update");
const { deletePlanVideo } = require("./deletePlanVideo");
const { feed, feedItem } = require("./feed");

module.exports = {
  create,
  getAll,
  get,
  update,
  deletePlanVideo,
  feed,
  feedItem,
};
