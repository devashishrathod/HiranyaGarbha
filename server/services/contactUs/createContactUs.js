const ContactUs = require("../../models/ContactUs");
const { throwError } = require("../../utils");

exports.createContactUs = async (payload) => {
  const { name, email, mobile, city, message, isPermissionGiven } = payload;
  if (!isPermissionGiven) {
    throwError(422, "Please give permission to continue");
  }

  return await ContactUs.create({
    name: name?.trim(),
    email: email?.toLowerCase()?.trim(),
    mobile,
    city: city?.trim(),
    message,
    isPermissionGiven,
  });
};
