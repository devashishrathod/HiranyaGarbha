const { asyncWrapper, sendSuccess } = require("../../utils");
const { deletePatient } = require("../../services/patients");

exports.remove = asyncWrapper(async (req, res) => {
  await deletePatient(req.params?.id);
  return sendSuccess(res, 200, "Patient deleted successfully");
});
