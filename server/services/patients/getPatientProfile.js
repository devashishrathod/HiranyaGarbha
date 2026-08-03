const Patient = require("../../models/Patient");
const { throwError } = require("../../utils");

exports.getPatientProfile = async (userId) => {
  const patient = await Patient.findOne({ userId, isDeleted: false })
    .populate("userId", "name email mobile image currentScreen isSignUpCompleted")
    .populate("primaryDoctor");

  if (!patient) {
    throwError(404, "Patient profile not found");
  }

  return patient;
};
