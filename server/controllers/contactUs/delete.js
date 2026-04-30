const { asyncWrapper, sendSuccess } = require("../../utils");
const { deleteContactUs } = require("../../services/contactUs");

exports.deleteContactUs = asyncWrapper(async (req, res) => {
  await deleteContactUs(req.params?.id);
  return sendSuccess(res, 200, "Contact request deleted successfully");
});
