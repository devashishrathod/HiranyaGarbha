const mongoose = require("mongoose");

const Doctor = require("../../models/Doctor");
const User = require("../../models/User");
const { throwError } = require("../../utils");

/**
 * Soft delete a doctor. `id` accepts either the Doctor._id (what list rows carry)
 * or the linked User._id, so callers do not have to know which one they hold.
 */
exports.deleteDoctor = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throwError(422, "Invalid doctor id");
  }

  const doctor =
    (await Doctor.findOne({ _id: id, isDeleted: false })) ||
    (await Doctor.findOne({ userId: id, isDeleted: false }));

  if (!doctor) throwError(404, "Doctor not found");

  doctor.isDeleted = true;
  doctor.isActive = false;
  doctor.status = "Inactive";
  await doctor.save();

  await User.findByIdAndUpdate(doctor.userId, {
    isDeleted: true,
    isActive: false,
    isLoggedIn: false,
  });

  return doctor;
};
