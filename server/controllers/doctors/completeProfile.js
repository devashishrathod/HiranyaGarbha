const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { completeProfile } = require("../../services/doctors");
const { validateCompleteDoctorProfile } = require("../../validator/doctors");

exports.completeProfile = asyncWrapper(async (req, res) => {
  const userId = req.query?.doctorId ?? req.userId;
  const { error, value } = validateCompleteDoctorProfile(req.body);
  if (error) throwError(422, cleanJoiError(error));

  const image = req.files?.image;
  const doctor = await completeProfile(userId, value, image);
  return sendSuccess(res, 200, "Doctor profile completed successfully", doctor);
});
