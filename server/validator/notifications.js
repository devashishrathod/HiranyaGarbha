const Joi = require("joi");
const {
  ROLES,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_TYPES,
  CAMPAIGN_STATUS,
  AUDIENCE_MODES,
  AUDIENCE_GROUPS,
  NOTIFICATION_DEFAULTS,
} = require("../constants");

const objectId = Joi.string().hex().length(24);

/**
 * The declarative audience.
 *
 * ⚠️ Validated per mode with `when`, not as a bag of optional keys. A `MANUAL`
 * send with no `userIds` and a `ROLE` send with no `roles` both resolve to
 * nobody, and catching that here means the admin sees "pick at least one
 * recipient" instead of a campaign row that quietly failed.
 */
const audienceSchema = Joi.object({
  mode: Joi.string()
    .valid(...Object.values(AUDIENCE_MODES))
    .required(),

  roles: Joi.array()
    .items(Joi.string().valid(...Object.values(ROLES)))
    .when("mode", {
      is: AUDIENCE_MODES.ROLE,
      then: Joi.array().min(1).required().messages({
        "array.min": "Pick at least one role to send to",
      }),
      otherwise: Joi.forbidden(),
    }),

  userIds: Joi.array()
    .items(objectId)
    .when("mode", {
      is: AUDIENCE_MODES.MANUAL,
      then: Joi.array().min(1).required().messages({
        "array.min": "Pick at least one recipient",
      }),
      otherwise: Joi.forbidden(),
    }),

  segment: Joi.object({
    group: Joi.string()
      .valid(...Object.values(AUDIENCE_GROUPS))
      .required(),
    isActive: Joi.boolean().optional(),
    search: Joi.string().trim().allow("").optional(),
    fromDate: Joi.date().iso().optional(),
    toDate: Joi.date().iso().optional(),
  }).when("mode", {
    is: AUDIENCE_MODES.SEGMENT,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),

  contacts: Joi.object({
    emails: Joi.array().items(Joi.string().trim().lowercase()).default([]),
    phones: Joi.array().items(Joi.string().trim()).default([]),
  })
    .or("emails", "phones")
    .when("mode", {
      is: AUDIENCE_MODES.CSV,
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
});

exports.validateCreateCampaign = (payload) => {
  const schema = Joi.object({
    channels: Joi.array()
      .items(Joi.string().valid(...Object.values(NOTIFICATION_CHANNELS)))
      .min(1)
      .required()
      .messages({ "array.min": "Pick at least one channel" }),

    audience: audienceSchema.required(),

    title: Joi.string()
      .trim()
      .max(NOTIFICATION_DEFAULTS.maxTitleLength)
      .required()
      .messages({ "any.required": "A title is required" }),
    body: Joi.string()
      .trim()
      .max(NOTIFICATION_DEFAULTS.maxBodyLength)
      .required()
      .messages({ "any.required": "A message is required" }),
    imageUrl: Joi.string().trim().uri().allow("").optional(),
    deepLink: Joi.string().trim().max(300).allow("").optional(),

    /**
     * Required only when the campaign actually uses email, so a push-only send
     * is not made to invent a subject line it will never use.
     */
    subject: Joi.string()
      .trim()
      .max(200)
      .when("channels", {
        is: Joi.array().has(NOTIFICATION_CHANNELS.EMAIL),
        then: Joi.required().messages({
          "any.required": "Email needs a subject",
        }),
        otherwise: Joi.allow("").optional(),
      }),
    emailBody: Joi.string()
      .trim()
      .max(20000)
      .when("channels", {
        is: Joi.array().has(NOTIFICATION_CHANNELS.EMAIL),
        then: Joi.required().messages({
          "any.required": "Email needs a body",
        }),
        otherwise: Joi.allow("").optional(),
      }),

    // Absent or null means send now.
    scheduledAt: Joi.date().iso().greater("now").allow(null).optional().messages({
      "date.greater": "The scheduled time has already passed",
    }),
  });

  return schema.validate(payload, { abortEarly: false, stripUnknown: true });
};

exports.validateAudienceTarget = (payload) =>
  audienceSchema.validate(payload, { abortEarly: false, stripUnknown: true });

exports.validateGetAllCampaignsQuery = (payload) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    status: Joi.string()
      .valid(...Object.values(CAMPAIGN_STATUS))
      .optional(),
    channel: Joi.string()
      .valid(...Object.values(NOTIFICATION_CHANNELS))
      .optional(),
    search: Joi.string().trim().allow("").optional(),
    fromDate: Joi.date().iso().optional(),
    toDate: Joi.date().iso().optional(),
  });

  return schema.validate(payload, { abortEarly: false });
};

exports.validateMyNotificationsQuery = (payload) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    isRead: Joi.alternatives().try(Joi.boolean(), Joi.string()).optional(),
    type: Joi.string()
      .valid(...Object.values(NOTIFICATION_TYPES))
      .optional(),
  });

  return schema.validate(payload, { abortEarly: false });
};

exports.validateRegisterDevice = (payload) => {
  const schema = Joi.object({
    fcmToken: Joi.string().trim().min(10).required().messages({
      "any.required": "fcmToken is required",
      "string.min": "That does not look like a valid FCM token",
    }),
    platform: Joi.string().valid("android", "ios", "web").optional(),
    deviceId: Joi.string().trim().optional(),
  });

  return schema.validate(payload, { abortEarly: false, stripUnknown: true });
};

exports.validateUnregisterDevice = (payload) => {
  const schema = Joi.object({ fcmToken: Joi.string().trim().optional() });
  return schema.validate(payload, { abortEarly: false, stripUnknown: true });
};

const templateFields = {
  name: Joi.string().trim().max(120),
  description: Joi.string().trim().max(300).allow(""),
  channels: Joi.array().items(
    Joi.string().valid(...Object.values(NOTIFICATION_CHANNELS))
  ),
  title: Joi.string().trim().max(NOTIFICATION_DEFAULTS.maxTitleLength).allow(""),
  body: Joi.string().trim().max(NOTIFICATION_DEFAULTS.maxBodyLength).allow(""),
  subject: Joi.string().trim().max(200).allow(""),
  emailBody: Joi.string().trim().max(20000).allow(""),
  audienceHint: Joi.string().trim().max(200).allow(""),
};

exports.validateCreateTemplate = (payload) =>
  Joi.object({ ...templateFields, name: templateFields.name.required() }).validate(
    payload,
    { abortEarly: false, stripUnknown: true }
  );

exports.validateUpdateTemplate = (payload) =>
  Joi.object(templateFields)
    .min(1)
    .validate(payload, { abortEarly: false, stripUnknown: true });
