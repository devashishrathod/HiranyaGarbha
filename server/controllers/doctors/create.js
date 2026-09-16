const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { createDoctor } = require("../../services/doctors");
const { validateCreateDoctor } = require("../../validator/doctors");

exports.create = asyncWrapper(async (req, res) => {
  const { error, value } = validateCreateDoctor(req.body);
  if (error) throwError(422, cleanJoiError(error));
  const image = req.files?.image;
  const result = await createDoctor(value, image);
  return sendSuccess(res, 201, "Doctor created successfully", result);
});
