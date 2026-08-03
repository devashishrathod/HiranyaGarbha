const Doctor = require("../../models/Doctor");
const { throwError } = require("../../utils");

exports.getDoctorProfile = async (userId) => {
  const doctor = await Doctor.findOne({ userId, isDeleted: false })
    .populate("userId", "name email mobile role image currentScreen isSignUpCompleted")
    .populate("hospital");

  if (!doctor) {
    throwError(404, "Doctor profile not found");
  }

  return doctor;
};
