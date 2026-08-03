const DoctorAvailability = require("../../models/DoctorAvailability");
const { throwError } = require("../../utils");

exports.getDoctorAvailability = async (doctorId) => {
  const availability = await DoctorAvailability.findOne({ doctorId }).lean();
  if (!availability) throwError(404, "Doctor availability not found.");
  return availability;
};
