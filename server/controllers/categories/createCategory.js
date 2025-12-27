const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { createCategory } = require("../../services/categories");
const { validateCreateCategory } = require("../../validator/categories");

exports.createCategory = asyncWrapper(async (req, res) => {
  const { error } = validateCreateCategory(req.body);
  if (error) throwError(422, cleanJoiError(error));
  const image = req.files?.image;
  const category = await createCategory(req.body, image);
  return sendSuccess(res, 201, "Category created", category);
});
