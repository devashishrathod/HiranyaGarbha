const range = require("./range");

/**
 * Date-window arithmetic for the admin dashboard. No database access here —
 * the services build their aggregations from these pieces.
 */
module.exports = {
  ...range,
};
