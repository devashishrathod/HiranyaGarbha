const { asyncWrapper, sendSuccess } = require("../../utils");
const { deleteDoctor } = require("../../services/doctors");

exports.remove = asyncWrapper(async (req, res) => {
  await deleteDoctor(req.params?.id);
  return sendSuccess(res, 200, "Doctor deleted successfully");
});
