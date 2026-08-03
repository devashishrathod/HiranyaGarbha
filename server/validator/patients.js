const Joi = require("joi");
const objectId = require("./validJoiObjectId");

exports.validateCompletePatientProfile = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().trim().optional().allow(""),
    dateOfBirth: Joi.string().optional().allow(""),
    age: Joi.number().optional(),
    bloodGroup: Joi.string().optional().allow(""),
    height: Joi.string().optional().allow(""),
    weight: Joi.string().optional().allow(""),
    email: Joi.string().email().optional().allow(""),
    phone: Joi.string().optional().allow(""),
    address: Joi.string().optional().allow(""),

    personalDetails: Joi.object({
      fullName: Joi.string().optional().allow(""),
      dateOfBirth: Joi.string().optional().allow(""),
      age: Joi.number().optional(),
      bloodGroup: Joi.string().optional().allow(""),
      height: Joi.string().optional().allow(""),
      weight: Joi.string().optional().allow(""),
      email: Joi.string().email().optional().allow(""),
      phone: Joi.string().optional().allow(""),
      address: Joi.string().optional().allow(""),
    }).optional(),

    lmp: Joi.string().optional().allow(""),
    edd: Joi.string().optional().allow(""),
    currentTrimester: Joi.string().optional().allow(""),
    gravida: Joi.number().optional(),
    para: Joi.number().optional(),
    abortions: Joi.number().optional(),
    previousDeliveries: Joi.array()
      .items(
        Joi.object({
          year: Joi.number().optional(),
          type: Joi.string().optional().allow(""),
          babyWeight: Joi.string().optional().allow(""),
          complications: Joi.string().optional().allow(""),
        })
      )
      .optional(),

    obstetricHistory: Joi.object({
      lmp: Joi.string().optional().allow(""),
      edd: Joi.string().optional().allow(""),
      currentTrimester: Joi.string().optional().allow(""),
      gravida: Joi.number().optional(),
      para: Joi.number().optional(),
      abortions: Joi.number().optional(),
      previousDeliveries: Joi.array().optional(),
    }).optional(),

    medicalConditions: Joi.array().items(Joi.string()).optional(),
    medications: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().optional().allow(""),
          dosage: Joi.string().optional().allow(""),
          frequency: Joi.string().optional().allow(""),
        })
      )
      .optional(),

    primaryDoctor: objectId().optional().allow(null, ""),
    doctorDetails: Joi.object({
      doctorName: Joi.string().optional().allow(""),
      specialization: Joi.string().optional().allow(""),
      hospital: Joi.string().optional().allow(""),
      phone: Joi.string().optional().allow(""),
      email: Joi.string().optional().allow(""),
    }).optional(),

    preferredLanguage: Joi.string().optional().allow(""),
    emergencyContact: Joi.object({
      name: Joi.string().optional().allow(""),
      relationship: Joi.string().optional().allow(""),
      phone: Joi.string().optional().allow(""),
      address: Joi.string().optional().allow(""),
    }).optional(),
  });

  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};
