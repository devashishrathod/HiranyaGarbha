const Joi = require("joi");
const moment = require("moment-timezone");

/*
 * Kept as the string that was sent — `dob` is a String on the model, and a
 * Joi.date() would hand the service a Date that saves as "Mon Jan 01 2001…".
 */
const isoDateString = Joi.string()
  .trim()
  .custom((value, helpers) =>
    moment(value, moment.ISO_8601, true).isValid() ? value : helpers.error("any.invalid")
  );

/**
 * Fields a user may change on their own account.
 *
 * Unknown keys are stripped rather than refused, so a client that echoes back
 * the whole user object (image URL, role, timestamps) saves the editable part
 * instead of failing with "image is not allowed".
 */
exports.validateUpdateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(100).messages({
      "string.empty": "Name cannot be empty",
      "string.min": "Name should have at least {#limit} characters",
      "string.max": "Name should not exceed {#limit} characters",
    }),
    // An empty string clears the address.
    address: Joi.string().trim().allow("").max(300).messages({
      "string.max": "Address cannot exceed {#limit} characters",
    }),
    // An empty string clears the date of birth.
    dob: isoDateString.allow("").messages({
      "any.invalid": "Date of birth must be a valid date (YYYY-MM-DD)",
    }),
    email: Joi.string().trim().lowercase().email().messages({
      "string.email": "Please enter a valid email address",
    }),
    mobile: Joi.number().integer().min(1000000000).max(9999999999).messages({
      "number.base": "Mobile number must be numeric",
      "number.min": "Mobile number must be 10 digits",
      "number.max": "Mobile number must be 10 digits",
    }),
    // Multipart sends "true"/"false"; Joi converts both.
    removeImage: Joi.boolean(),
  });

  return schema.validate(data, { abortEarly: false, stripUnknown: true });
};
