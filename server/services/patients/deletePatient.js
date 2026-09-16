const mongoose = require("mongoose");

const Patient = require("../../models/Patient");
const User = require("../../models/User");
const { throwError } = require("../../utils");

/**
 * Soft delete a patient. `id` accepts either the Patient._id (what list rows carry)
 * or the linked User._id, so callers do not have to know which one they hold.
 */
exports.deletePatient = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throwError(422, "Invalid patient id");
  }

  const patient =
    (await Patient.findOne({ _id: id, isDeleted: false })) ||
    (await Patient.findOne({ userId: id, isDeleted: false }));

  if (!patient) throwError(404, "Patient not found");

  patient.isDeleted = true;
  patient.isActive = false;
  await patient.save();

  await User.findByIdAndUpdate(patient.userId, {
    isDeleted: true,
    isActive: false,
    isLoggedIn: false,
  });

  return patient;
};
