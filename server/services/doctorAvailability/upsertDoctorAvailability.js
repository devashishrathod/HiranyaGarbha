const DoctorAvailability = require("../../models/DoctorAvailability");
const Doctor = require("../../models/Doctor");
const { throwError } = require("../../utils");
const { validateAvailability } = require("../../helpers/DoctorAvailability");

exports.upsertDoctorAvailability = async (payload) => {
  validateAvailability(payload);
  const doctor = await Doctor.findById(payload.doctorId);
  if (!doctor) throwError(404, "Doctor not found.");
  const availability = await DoctorAvailability.findOneAndUpdate(
    { doctorId: payload.doctorId },
    {
      $set: {
        timezone: payload.timezone || "Asia/Kolkata",
        weeklySchedule: payload.weeklySchedule,
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  ).lean();
  doctor.availabilityId = availability._id;
  await doctor.save();
  return availability;
};
