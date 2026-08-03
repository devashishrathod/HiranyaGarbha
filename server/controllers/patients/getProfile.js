const { asyncWrapper, sendSuccess } = require("../../utils");
const { getPatientProfile } = require("../../services/patients");

exports.getProfile = asyncWrapper(async (req, res) => {
  const userId = req.query?.userId ?? req.userId;
  const patient = await getPatientProfile(userId);
  return sendSuccess(res, 200, "Patient profile fetched successfully", patient);
});
