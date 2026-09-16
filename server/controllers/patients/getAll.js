const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { validateGetAllPatientsQuery } = require("../../validator/patients");
const { getAllPatients } = require("../../services/patients");

exports.getAll = asyncWrapper(async (req, res) => {
  const { error, value } = validateGetAllPatientsQuery(req.query);
  if (error) throwError(422, cleanJoiError(error));
  const result = await getAllPatients(value);
  return sendSuccess(res, 200, "Patients fetched successfully", result);
});
