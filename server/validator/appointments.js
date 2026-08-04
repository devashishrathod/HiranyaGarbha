const Joi = require("joi");
const objectId = Joi.string().hex().length(24);

const createAppointmentSchema = Joi.object({
  patientId: objectId.required(),

  doctorId: objectId.required(),

  hospitalId: objectId.allow(null, ""),

  scheduledBy: Joi.string().valid("PATIENT", "ADMIN", "DOCTOR").required(),

  createdBy: objectId.allow(null, ""),

  createdByModel: Joi.string()
    .valid("Patient", "Admin", "Doctor")
    .allow(null, ""),

  appointmentDate: Joi.date().required(),

  startTime: Joi.date().required(),

  endTime: Joi.date().required(),

  duration: Joi.number().integer().positive().optional(),

  timezone: Joi.string().default("Asia/Kolkata"),

  appointmentType: Joi.string()
    .valid("VIDEO", "AUDIO", "CLINIC", "HOME_VISIT")
    .default("CLINIC"),

  consultationFee: Joi.number().min(0).optional(),

  symptoms: Joi.string().trim().max(2000).allow("", null),

  notes: Joi.string().trim().max(5000).allow("", null),
});

const cancelAppointmentSchema = Joi.object({
  cancelledBy: Joi.string().valid("PATIENT", "DOCTOR", "ADMIN").required(),

  cancellationReason: Joi.string().trim().max(500).required(),
});

const rescheduleAppointmentSchema = Joi.object({
  appointmentDate: Joi.date().required(),

  startTime: Joi.date().required(),

  endTime: Joi.date().required(),
});

const completeAppointmentSchema = Joi.object({
  notes: Joi.string().trim().max(5000).allow("", null),

  prescription: objectId.allow(null, ""),
});

const appointmentIdSchema = Joi.object({
  appointmentId: objectId.required(),
});

const doctorAppointmentQuerySchema = Joi.object({
  doctorId: objectId.required(),

  fromDate: Joi.date().optional(),

  toDate: Joi.date().optional(),

  status: Joi.string()
    .valid(
      "PENDING",
      "CONFIRMED",
      "CHECKED_IN",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
      "RESCHEDULED",
    )
    .optional(),

  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(100).default(10),
});

const patientAppointmentQuerySchema = Joi.object({
  patientId: objectId.required(),

  status: Joi.string()
    .valid(
      "PENDING",
      "CONFIRMED",
      "CHECKED_IN",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
      "RESCHEDULED",
    )
    .optional(),

  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(100).default(10),
});

const hospitalAppointmentQuerySchema = Joi.object({
  hospitalId: objectId.required(),

  status: Joi.string()
    .valid(
      "PENDING",
      "CONFIRMED",
      "CHECKED_IN",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
      "RESCHEDULED",
    )
    .optional(),

  doctorId: objectId.optional(),

  departmentId: objectId.optional(),

  fromDate: Joi.date().optional(),

  toDate: Joi.date().optional(),

  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(100).default(10),
});

module.exports = {
  createAppointmentSchema,
  cancelAppointmentSchema,
  rescheduleAppointmentSchema,
  completeAppointmentSchema,
  appointmentIdSchema,
  doctorAppointmentQuerySchema,
  patientAppointmentQuerySchema,
  hospitalAppointmentQuerySchema,
};
