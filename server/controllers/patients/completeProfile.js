const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { completeProfile } = require("../../services/patients");
const { validateCompletePatientProfile } = require("../../validator/patients");

exports.completeProfile = asyncWrapper(async (req, res) => {
  const userId = req.query?.patientId ?? req.userId;
  const { error, value } = validateCompletePatientProfile(req.body);
  if (error) throwError(422, cleanJoiError(error));
  const image = req.files?.image;
  const patient = await completeProfile(userId, value, image);
  return sendSuccess(
    res,
    200,
    "Patient profile completed successfully",
    patient,
  );
});
