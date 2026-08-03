const { asyncWrapper, sendSuccess } = require("../../utils");
const { getDoctorProfile } = require("../../services/doctors");

exports.getProfile = asyncWrapper(async (req, res) => {
  const userId = req.query?.doctorId ?? req.userId;
  const doctor = await getDoctorProfile(userId);
  return sendSuccess(res, 200, "Doctor profile fetched successfully", doctor);
});
