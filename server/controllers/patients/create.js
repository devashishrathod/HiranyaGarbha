const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { createPatient } = require("../../services/patients");
const { validateCreatePatient } = require("../../validator/patients");

exports.create = asyncWrapper(async (req, res) => {
  const { error, value } = validateCreatePatient(req.body);
  if (error) throwError(422, cleanJoiError(error));
  const image = req.files?.image;
  const result = await createPatient(value, image);
  return sendSuccess(res, 201, "Patient created successfully", result);
});
