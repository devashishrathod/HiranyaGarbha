const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
  validateObjectId,
} = require("../../utils");
const {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require("../../services/notifications");
const {
  validateCreateTemplate,
  validateUpdateTemplate,
} = require("../../validator/notifications");

exports.getAll = asyncWrapper(async (req, res) => {
  const result = await getAllTemplates(req.query);
  return sendSuccess(res, 200, "Notification templates fetched", result);
});

exports.create = asyncWrapper(async (req, res) => {
  const { error, value } = validateCreateTemplate(req.body);
  if (error) throwError(422, cleanJoiError(error));

  const result = await createTemplate(value, req.userId);
  return sendSuccess(res, 201, "Notification template created", result);
});

exports.update = asyncWrapper(async (req, res) => {
  validateObjectId(req.params.id);

  const { error, value } = validateUpdateTemplate(req.body);
  if (error) throwError(422, cleanJoiError(error));

  const result = await updateTemplate(req.params.id, value);
  return sendSuccess(res, 200, "Notification template updated", result);
});

exports.remove = asyncWrapper(async (req, res) => {
  validateObjectId(req.params.id);
  const result = await deleteTemplate(req.params.id);
  return sendSuccess(res, 200, "Notification template deleted", result);
});
