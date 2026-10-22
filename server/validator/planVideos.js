const Joi = require("joi");
const objectId = require("./validJoiObjectId");
const { VIDEO_TRIMESTERS } = require("../constants");
const { extractYoutubeId } = require("../helpers/youtube");

// Mirrored in Client/src/constants/planVideo.js
const NAME_MIN = 3;
const NAME_MAX = 30;
const DESCRIPTION_MAX = 300;

const name = Joi.string().trim().min(NAME_MIN).max(NAME_MAX).messages({
  "string.empty": "Name is required",
  "string.min": "Name has minimum {#limit} characters",
  "string.max": "Name cannot exceed {#limit} characters",
});

const description = Joi.string().trim().max(DESCRIPTION_MAX).messages({
  "string.empty": "Description is required",
  "string.max": "Description cannot exceed {#limit} characters",
});

// "youtu.be/..." without a scheme is accepted, and stored with https:// so
// every "Open in YouTube" link is absolute.
const videoUrl = Joi.string()
  .trim()
  .max(500)
  .custom((value, helpers) => {
    if (!extractYoutubeId(value)) return helpers.error("any.invalid");
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  })
  .messages({
    "string.empty": "YouTube link is required",
    "any.invalid": "Paste a valid YouTube video link",
  });

const packageIds = Joi.array()
  .items(objectId().messages({ "any.invalid": "Invalid plan ID" }))
  .min(1)
  .unique()
  .messages({
    "array.min": "Pick at least one plan",
    "array.unique": "A plan is picked twice",
  });

const trimesters = Joi.array()
  .items(Joi.string().valid(...VIDEO_TRIMESTERS))
  .min(1)
  .unique()
  .messages({
    "array.min": "Pick at least one trimester",
    "array.unique": "A trimester is picked twice",
    "any.only": `Trimester must be one of ${VIDEO_TRIMESTERS.join(", ")}`,
  });

// Optional; null or "" clears it on update.
const subCategoryId = objectId()
  .allow(null, "")
  .messages({ "any.invalid": "Invalid subcategory ID" });

exports.validateCreatePlanVideo = (data) =>
  Joi.object({
    name: name.required(),
    description: description.required(),
    videoUrl: videoUrl.required(),
    packageIds: packageIds.required(),
    trimesters: trimesters.required(),
    subCategoryId: subCategoryId.optional(),
    isActive: Joi.boolean().optional(),
  }).validate(data, { abortEarly: false });

exports.validateUpdatePlanVideo = (data) =>
  Joi.object({
    name: name.optional(),
    description: description.optional(),
    videoUrl: videoUrl.optional(),
    packageIds: packageIds.optional(),
    trimesters: trimesters.optional(),
    subCategoryId: subCategoryId.optional(),
    isActive: Joi.boolean().optional(),
  })
    .min(1)
    .messages({ "object.min": "Nothing to update" })
    .validate(data, { abortEarly: false });

/* Filters both lists share. The feed is public, so the page size is capped. */
const listFilters = {
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().trim().max(100).allow("").optional(),
  categoryId: objectId().messages({ "any.invalid": "Invalid categoryId" }),
  subCategoryId: objectId().messages({ "any.invalid": "Invalid subCategoryId" }),
  trimester: Joi.string()
    .valid(...VIDEO_TRIMESTERS)
    .optional(),
  sortBy: Joi.string().valid("createdAt", "updatedAt", "name").optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
};

exports.validateGetAllPlanVideosQuery = (payload) =>
  Joi.object({
    ...listFilters,
    packageId: objectId().messages({ "any.invalid": "Invalid packageId" }),
    isActive: Joi.boolean().optional(),
    fromDate: Joi.date().iso().optional(),
    toDate: Joi.date().iso().optional(),
  }).validate(payload, { abortEarly: false });

exports.validatePlanVideoFeedQuery = (payload) =>
  Joi.object(listFilters).validate(payload, { abortEarly: false });
