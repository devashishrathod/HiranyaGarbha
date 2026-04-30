const Joi = require("joi");

exports.validateCreateContactUs = (data) => {
  const createSchema = Joi.object({
    name: Joi.string().min(2).max(120).required().messages({
      "string.min": "Name must be at least {#limit} characters",
      "string.max": "Name cannot exceed {#limit} characters",
      "any.required": "Name is required",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Email must be a valid email address",
      "any.required": "Email is required",
    }),
    mobile: Joi.alternatives()
      .try(Joi.number(), Joi.string())
      .required()
      .messages({
        "any.required": "Mobile is required",
      }),
    city: Joi.string().min(2).max(120).required().messages({
      "string.min": "City must be at least {#limit} characters",
      "string.max": "City cannot exceed {#limit} characters",
      "any.required": "City is required",
    }),
    message: Joi.string().min(2).max(2000).required().messages({
      "string.max": "Message cannot exceed {#limit} characters",
      "any.required": "Message is required",
    }),
    isPermissionGiven: Joi.boolean().required().messages({
      "any.required":
        "Permission is required! Please agree to share your information.",
    }),
  });
  return createSchema.validate(data, { abortEarly: false });
};

exports.validateUpdateContactUs = (payload) => {
  const updateSchema = Joi.object({
    name: Joi.string().min(2).max(120).messages({
      "string.min": "Name has minimum {#limit} characters",
      "string.max": "Name cannot exceed {#limit} characters",
    }),
    email: Joi.string().email().messages({
      "string.email": "Email must be a valid email address",
    }),
    mobile: Joi.alternatives().try(Joi.number(), Joi.string()),
    city: Joi.string().min(2).max(120).messages({
      "string.min": "City has minimum {#limit} characters",
      "string.max": "City cannot exceed {#limit} characters",
    }),
    message: Joi.string().min(2).max(2000).messages({
      "string.max": "Message cannot exceed {#limit} characters",
    }),
  });
  return updateSchema.validate(payload, { abortEarly: false });
};

exports.validateGetAllContactUsQuery = (payload) => {
  const getAllQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    search: Joi.string().optional(),
    name: Joi.string().optional(),
    email: Joi.string().optional(),
    city: Joi.string().optional(),
    isPermissionGiven: Joi.alternatives()
      .try(Joi.string(), Joi.boolean())
      .optional(),
    fromDate: Joi.date().iso().optional(),
    toDate: Joi.date().iso().optional(),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid("asc", "desc").optional(),
  });
  return getAllQuerySchema.validate(payload, { abortEarly: false });
};
