const Joi = require("joi");
const { PLAN_TRIMESTERS } = require("../constants");

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
