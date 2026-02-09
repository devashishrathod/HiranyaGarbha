const Joi = require("joi");
const objectId = require("./validJoiObjectId");

exports.validateCreateBanner = (data) => {
  const createSchema = Joi.object({
    name: Joi.string().min(3).max(120).required().messages({
      "string.min": "Name has minimum {#limit} characters",
      "string.max": "Name cannot exceed {#limit} characters",
    }),
    description: Joi.string().allow("").max(300).messages({
      "string.max": "Description cannot exceed {#limit} characters",
    }),
    categoryId: objectId().required().messages({
      "any.invalid": "Invalid categoryId format",
    }),
    isActive: Joi.boolean().optional(),
  });
  return createSchema.validate(data, { abortEarly: false });
};

exports.validateUpdateBanner = (data) => {
  const updateSchema = Joi.object({
    name: Joi.string().min(3).max(120).optional().messages({
      "string.min": "Name has minimum {#limit} characters",
      "string.max": "Name cannot exceed {#limit} characters",
    }),
    description: Joi.string().allow("").max(300).optional().messages({
      "string.max": "Description cannot exceed {#limit} characters",
    }),
    categoryId: objectId().optional().messages({
      "any.invalid": "Invalid categoryId format",
    }),
    isActive: Joi.boolean().optional(),
    removeImage: Joi.boolean().optional(),
    removeVideo: Joi.boolean().optional(),
  });
  return updateSchema.validate(data, { abortEarly: false });
};

exports.validateGetAllBannersQuery = (payload) => {
  const getAllQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    search: Joi.string().optional(),
    name: Joi.string().optional(),
    categoryId: objectId().messages({
      "any.invalid": "Invalid categoryId format",
    }),
    isActive: Joi.alternatives().try(Joi.string(), Joi.boolean()).optional(),
    fromDate: Joi.date().iso().optional(),
    toDate: Joi.date().iso().optional(),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid("asc", "desc").optional(),
  });
  return getAllQuerySchema.validate(payload, { abortEarly: false });
};
