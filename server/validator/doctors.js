const Joi = require("joi");
const objectId = require("./validJoiObjectId");

const doctorProfileKeys = {
  fullName: Joi.string().trim().optional().allow(""),
  dateOfBirth: Joi.string().optional().allow(""),
  gender: Joi.string().optional().allow(""),
  bloodGroup: Joi.string().optional().allow(""),
  email: Joi.string().email().optional().allow(""),
  phone: Joi.string().optional().allow(""),
  address: Joi.string().optional().allow(""),
  image: Joi.string().optional().allow(""),

  personalDetails: Joi.object({
    fullName: Joi.string().optional().allow(""),
    dateOfBirth: Joi.string().optional().allow(""),
    gender: Joi.string().optional().allow(""),
    bloodGroup: Joi.string().optional().allow(""),
    email: Joi.string().email().optional().allow(""),
    phone: Joi.string().optional().allow(""),
    address: Joi.string().optional().allow(""),
  }).optional(),

  specialization: Joi.string().optional().allow(""),
  qualifications: Joi.string().optional().allow(""),
  experience: Joi.string().optional().allow(""),
  licenseNumber: Joi.string().optional().allow(""),
  hospital: objectId().optional().allow(null, ""),
  department: Joi.string().optional().allow(""),
  consultationFee: Joi.string().optional().allow(""),
  availableDays: Joi.string().optional().allow(""),
  availableTime: Joi.string().optional().allow(""),

  professionalDetails: Joi.object({
    specialization: Joi.string().optional().allow(""),
    qualifications: Joi.string().optional().allow(""),
    experience: Joi.string().optional().allow(""),
    licenseNumber: Joi.string().optional().allow(""),
    hospital: objectId().optional().allow(null, ""),
    department: Joi.string().optional().allow(""),
    consultationFee: Joi.string().optional().allow(""),
    availableDays: Joi.string().optional().allow(""),
    availableTime: Joi.string().optional().allow(""),
  }).optional(),

  expertise: Joi.array().items(Joi.string()).optional(),
  languages: Joi.array().items(Joi.string()).optional(),
};

exports.validateCompleteDoctorProfile = (data) => {
  const schema = Joi.object(doctorProfileKeys);

  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

exports.validateCreateDoctor = (data) => {
  const schema = Joi.object(doctorProfileKeys).keys({
    name: Joi.string().trim().optional().allow(""),
    email: Joi.string().email().optional().allow("", null),
    mobile: Joi.alternatives()
      .try(Joi.number(), Joi.string())
      .optional()
      .allow("", null),
    password: Joi.string().min(6).optional().allow(""),
  });

  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

exports.validateGetAllDoctorsQuery = (payload) => {
  const getAllQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    search: Joi.string().optional(),
    fullName: Joi.string().optional(),
    isActive: Joi.alternatives().try(Joi.string(), Joi.boolean()).optional(),
    fromDate: Joi.date().iso().optional(),
    toDate: Joi.date().iso().optional(),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid("asc", "desc").optional(),
  });
  return getAllQuerySchema.validate(payload, { abortEarly: false });
};
