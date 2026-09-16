const Joi = require("joi");

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

exports.validateDoctorLeave = (body) => {
  const schema = Joi.object({
    leaveType: Joi.string().valid("FULL_DAY", "HALF_DAY", "CUSTOM").required(),
    leaveDate: Joi.date().required(),
    startTime: Joi.when("leaveType", {
      is: Joi.valid("HALF_DAY", "CUSTOM"),
      then: Joi.string().pattern(timeRegex).required(),
      otherwise: Joi.any().allow(null, ""),
    }),
    endTime: Joi.when("leaveType", {
      is: Joi.valid("HALF_DAY", "CUSTOM"),
      then: Joi.string().pattern(timeRegex).required(),
      otherwise: Joi.any().allow(null, ""),
    }),
    reason: Joi.string().trim().max(500).allow("").optional(),
  });
  return schema.validate(body, {
    abortEarly: false,
  });
};
