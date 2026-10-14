const Joi = require("joi");
const moment = require("moment-timezone");
const { DASHBOARD_RANGES } = require("../constants");

/*
 * Plain YYYY-MM-DD strings, not Joi.date(): a Date would be read as UTC
 * midnight, and the window is cut in IST by `resolveRange`.
 */
const calendarDate = Joi.string()
  .trim()
  .custom((value, helpers) =>
    moment(value, "YYYY-MM-DD", true).isValid() ? value : helpers.error("any.invalid")
  )
  .messages({ "any.invalid": "Dates must be in YYYY-MM-DD format" });

exports.validateDashboardSummaryQuery = (payload) => {
  const schema = Joi.object({
    range: Joi.string()
      .valid(...Object.values(DASHBOARD_RANGES))
      .default(DASHBOARD_RANGES.MONTH),

    // Only a custom range takes dates; the presets are always relative to now.
    from: calendarDate.when("range", {
      is: DASHBOARD_RANGES.CUSTOM,
      then: Joi.required().messages({ "any.required": "Pick a start date" }),
      otherwise: Joi.forbidden(),
    }),
    to: calendarDate.when("range", {
      is: DASHBOARD_RANGES.CUSTOM,
      then: Joi.required().messages({ "any.required": "Pick an end date" }),
      otherwise: Joi.forbidden(),
    }),
  });

  return schema.validate(payload, { abortEarly: false, stripUnknown: true });
};
