const Joi = require("joi");
const objectId = require("./validJoiObjectId");

exports.validateCompleteDoctorProfile = (data) => {
  const schema = Joi.object({
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
  });

  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};
