const Joi = require("joi");
const {
  SUBSCRIPTION_TYPES,
  SUBSCRIPTION_TIERS,
  PLAN_TRIMESTERS,
} = require("../constants");

const planSchema = Joi.object({
  trimester: Joi.string()
    .valid(...Object.values(PLAN_TRIMESTERS))
    .required()
    .messages({ "any.required": "Each plan needs a trimester" }),
  label: Joi.string().trim().max(60).allow("").optional(),
  price: Joi.number().min(0).required().messages({
    "any.required": "Each plan needs a price",
    "number.min": "Plan price cannot be negative",
  }),
  originalPrice: Joi.number().min(0).allow(null, "").optional(),
  durationInDays: Joi.number().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

const stringList = (max = 60) =>
  Joi.array().items(Joi.string().trim().max(200)).max(max);

const premiumFeaturesSchema = Joi.object({
  medicalCare: stringList().optional(),
  holisticWellness: stringList().optional(),
  birthPreparation: stringList().optional(),
  afterDelivery: stringList().optional(),
  premiumSupport: stringList().optional(),
});

const themeSchema = Joi.object({
  color: Joi.string().trim().max(120).allow("").optional(),
  borderColor: Joi.string().trim().max(120).allow("").optional(),
});

// Fields a package shares between create and update
const packageFields = {
  subtitle: Joi.string().trim().max(160).allow("").optional(),
  description: Joi.string().trim().max(500).allow("").optional().messages({
    "string.max": "Description cannot exceed {#limit} characters",
  }),
  duration: Joi.string().trim().max(120).allow("").optional(),
  idealFor: Joi.string().trim().max(160).allow("").optional(),
  badge: Joi.string().trim().max(60).allow("").optional(),
  theme: themeSchema.optional(),
  isPopular: Joi.boolean().optional(),
  isFree: Joi.boolean().optional(),
  displayOrder: Joi.number().integer().min(0).optional(),
  modules: stringList().optional(),
  includes: stringList().optional(),
  exclusiveBenefits: stringList().optional(),
  premiumFeatures: premiumFeaturesSchema.optional(),
  // Legacy fields, still accepted so older records stay editable
  type: Joi.string()
    .valid(...Object.values(SUBSCRIPTION_TYPES))
    .optional(),
  benefits: stringList().optional(),
  limitations: stringList().optional(),
  isActive: Joi.boolean().optional(),
};

exports.validateCreateSubscription = (data) => {
  const createSchema = Joi.object({
    name: Joi.string().trim().min(3).max(120).required().messages({
      "string.min": "Name has minimum {#limit} characters",
      "string.max": "Name cannot exceed {#limit} characters",
      "any.required": "Name is required",
    }),
    tier: Joi.string()
      .valid(...Object.values(SUBSCRIPTION_TIERS))
      .required()
      .messages({ "any.required": "Tier is required" }),
    plans: Joi.array().items(planSchema).min(1).max(4).required().messages({
      "any.required": "At least one trimester plan is required",
      "array.min": "At least one trimester plan is required",
    }),
    // Derived from the cheapest plan, accepted but not needed from the client
    price: Joi.number().min(0).optional(),
    originalPrice: Joi.number().min(0).allow(null, "").optional(),
    durationInDays: Joi.number().min(0).optional(),
    ...packageFields,
  });
  return createSchema.validate(data, { abortEarly: false });
};

exports.validateUpdateSubscription = (payload) => {
  const updateSchema = Joi.object({
    name: Joi.string().trim().min(3).max(120).messages({
      "string.min": "Name has minimum {#limit} characters",
      "string.max": "Name cannot exceed {#limit} characters",
    }),
    tier: Joi.string()
      .valid(...Object.values(SUBSCRIPTION_TIERS))
      .optional(),
    plans: Joi.array().items(planSchema).min(1).max(4).optional(),
    price: Joi.number().min(0).optional(),
    originalPrice: Joi.number().min(0).allow(null, "").optional(),
    durationInDays: Joi.number().min(0).optional(),
    ...packageFields,
  })
    .min(1)
    .messages({ "object.min": "Nothing to update" });
  return updateSchema.validate(payload, { abortEarly: false });
};

exports.validateGetAllSubscriptionsQuery = (payload) => {
  const getAllQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    search: Joi.string().optional(),
    name: Joi.string().optional(),
    tier: Joi.string()
      .valid(...Object.values(SUBSCRIPTION_TIERS))
      .optional(),
    trimester: Joi.string()
      .valid(...Object.values(PLAN_TRIMESTERS))
      .optional(),
    type: Joi.string()
      .valid(...Object.values(SUBSCRIPTION_TYPES))
      .optional(),
    isActive: Joi.alternatives().try(Joi.string(), Joi.boolean()).optional(),
    fromDate: Joi.date().iso().optional(),
    toDate: Joi.date().iso().optional(),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid("asc", "desc").optional(),
  });
  return getAllQuerySchema.validate(payload, { abortEarly: false });
};

exports.validateGetPackagesQuery = (payload) => {
  const getPackagesQuerySchema = Joi.object({
    trimester: Joi.string()
      .valid(...Object.values(PLAN_TRIMESTERS))
      .optional(),
    tier: Joi.string()
      .valid(...Object.values(SUBSCRIPTION_TIERS))
      .optional(),
    includeInactive: Joi.alternatives()
      .try(Joi.string(), Joi.boolean())
      .optional(),
  });
  return getPackagesQuerySchema.validate(payload, { abortEarly: false });
};
