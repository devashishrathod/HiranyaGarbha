const ContactUs = require("../../models/ContactUs");
const { throwError, validateObjectId } = require("../../utils");

exports.updateContactUs = async (id, payload = {}) => {
  validateObjectId(id, "ContactUs Id");
  const result = await ContactUs.findById(id);
  if (!result || result.isDeleted) throwError(404, "ContactUs not found");

  const { name, email, mobile, city, message } = payload;

  if (typeof name !== "undefined") result.name = name?.trim();
  if (typeof email !== "undefined") result.email = email?.toLowerCase()?.trim();
  if (typeof mobile !== "undefined") result.mobile = mobile;
  if (typeof city !== "undefined") result.city = city?.trim();
  if (typeof message !== "undefined") result.message = message;

  result.updatedAt = new Date();
  await result.save();
  return result;
};
