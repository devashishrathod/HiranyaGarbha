const Joi = require("joi");
const objectId = require("./validJoiObjectId");

const shiftSchema = Joi.object({
  startTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required(),
  endTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required(),
  slotDuration: Joi.number().valid(10, 15, 20, 30, 45, 60).required(),
  breakStart: Joi.string().allow(null, "").optional(),
  breakEnd: Joi.string().allow(null, "").optional(),
});

const weeklySchema = Joi.object({
  dayOfWeek: Joi.number().valid(0, 1, 2, 3, 4, 5, 6).required(),
  isAvailable: Joi.boolean().required(),
  shifts: Joi.array().items(shiftSchema).required(),
});

exports.validateDoctorAvailability = (body) => {
  const schema = Joi.object({
    timezone: Joi.string().default("Asia/Kolkata"),
    doctorId: objectId().required(),
    weeklySchedule: Joi.array().items(weeklySchema).min(7).max(7).required(),
  });
  return schema.validate(body, { abortEarly: false });
};
