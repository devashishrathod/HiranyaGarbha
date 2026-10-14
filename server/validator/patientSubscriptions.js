const Joi = require("joi");
const {
  PLAN_TRIMESTERS,
  SUBSCRIPTION_STATES,
  SUBSCRIPTION_TIERS,
  SUBSCRIPTION_KIND,
  SUBSCRIPTION_PAYMENT_STATUS,
  SUBSCRIPTION_SOURCE,
} = require("../constants");

const objectId = Joi.string().hex().length(24);

/*
 * ⚠️ No schema here accepts an amount, a price or a patient id.
 *
 * The price is computed server-side from the catalogue, and the patient comes
 * from the JWT (`req.patientId`). Accepting either from the body is how a
 * payments API gets a patient onto Elite for ₹1.
 */

const purchaseBody = {
  packageId: objectId.required().messages({
    "any.required": "Package is required",
    "string.hex": "Invalid package id",
    "string.length": "Invalid package id",
  }),
  trimester: Joi.string()
    .valid(...Object.values(PLAN_TRIMESTERS))
    .required()
    .messages({ "any.required": "Trimester is required" }),
};

const calendarDate = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .messages({ "string.pattern.base": "Dates must be in YYYY-MM-DD format" });

/** Admin plan history: GET /admin/patient-subscriptions (and /stats). */
exports.validateAdminListQuery = (data) =>
  Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    search: Joi.string().trim().allow("").max(100),
    state: Joi.string().valid(...SUBSCRIPTION_STATES),
    tier: Joi.string().valid(...Object.values(SUBSCRIPTION_TIERS)),
    kind: Joi.string().valid(...Object.values(SUBSCRIPTION_KIND)),
    trimester: Joi.string().valid(...Object.values(PLAN_TRIMESTERS)),
    paymentStatus: Joi.string().valid(...Object.values(SUBSCRIPTION_PAYMENT_STATUS)),
    source: Joi.string().valid(...Object.values(SUBSCRIPTION_SOURCE)),
    patientId: objectId.messages({ "string.hex": "Invalid patient id", "string.length": "Invalid patient id" }),
    packageId: objectId.messages({ "string.hex": "Invalid package id", "string.length": "Invalid package id" }),
    fromDate: calendarDate,
    toDate: calendarDate,
    sortBy: Joi.string().valid("createdAt", "startDate", "endDate", "amountPaid"),
    sortOrder: Joi.string().valid("asc", "desc"),
  }).validate(data, { abortEarly: false });

exports.validatePreviewCheckout = (data) =>
  Joi.object(purchaseBody).validate(data, { abortEarly: false });

exports.validateCreateCheckout = (data) =>
  Joi.object(purchaseBody).validate(data, { abortEarly: false });

exports.validateVerifyPayment = (data) =>
  Joi.object({
    razorpayOrderId: Joi.string().trim().required(),
    razorpayPaymentId: Joi.string().trim().required(),
    razorpaySignature: Joi.string().trim().required(),
  })
    .messages({ "any.required": "{#label} is required" })
    .validate(data, { abortEarly: false });

exports.validateHistoryQuery = (data) =>
  Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    status: Joi.string().optional(),
    kind: Joi.string().valid("PACKAGE", "BONUS").optional(),
  }).validate(data, { abortEarly: false });
