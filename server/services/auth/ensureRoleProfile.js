const Patient = require("../../models/Patient");
const Doctor = require("../../models/Doctor");
const { ROLES } = require("../../constants");

/**
 * Ensures Patient or Doctor collection document exists for the user role upon signup.
 * @param {Object} user - User document from DB
 * @param {Boolean} isSignup - Indicates whether this invocation is for a new signup/registration
 */
exports.ensureRoleProfile = async (user, isSignup = false) => {
  if (!user || !user._id) return null;
  const role = user.role?.toLowerCase();

  const isPatientRole = role === ROLES.USER || role === "patient";
  const isDoctorRole = role === ROLES.DOCTOR;

  if (isPatientRole) {
    let patient = await Patient.findOne({ userId: user._id, isDeleted: false });
    if (!patient && isSignup) {
      patient = await Patient.create({
        userId: user._id,
        fullName: user.name || "",
        email: user.email || "",
        phone: user.mobile ? String(user.mobile) : "",
      });
    }
    return patient;
  } else if (isDoctorRole) {
    let doctor = await Doctor.findOne({ userId: user._id, isDeleted: false });
    if (!doctor && isSignup) {
      doctor = await Doctor.create({
        userId: user._id,
        fullName: user.name || "",
        email: user.email || "",
        phone: user.mobile ? String(user.mobile) : "",
      });
    }
    return doctor;
  }

  return null;
};
