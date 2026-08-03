const { asyncWrapper, sendSuccess } = require("../../utils");
const { getDoctorAvailability } = require("../../services/doctorAvailability");

exports.get = asyncWrapper(async (req, res) => {
  const doctorId = req.params.doctorId;
  const result = await getDoctorAvailability(doctorId);
  return sendSuccess(
    res,
    200,
    "Doctor availability fetched successfully.",
    result,
  );
});
