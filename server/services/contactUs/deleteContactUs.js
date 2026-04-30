const ContactUs = require("../../models/ContactUs");
const { throwError, validateObjectId } = require("../../utils");

exports.deleteContactUs = async (id) => {
  validateObjectId(id, "ContactUs Id");
  const result = await ContactUs.findById(id);
  if (!result || result.isDeleted) throwError(404, "ContactUs not found");

  result.isDeleted = true;
  result.updatedAt = new Date();
  await result.save();
  return;
};
