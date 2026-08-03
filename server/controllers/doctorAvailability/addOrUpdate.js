const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const {
  upsertDoctorAvailability,
} = require("../../services/doctorAvailability");
const {
  validateDoctorAvailability,
} = require("../../validator/doctorAvailability");

exports.addOrUpdate = asyncWrapper(async (req, res) => {
  const { error, value } = validateDoctorAvailability(req.body);
  if (error) throwError(422, cleanJoiError(error));
  const result = await upsertDoctorAvailability(value);
  return sendSuccess(
    res,
    200,
    "Doctor availability updated successfully.",
    result,
  );
});
