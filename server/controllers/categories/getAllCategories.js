const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { getAllCategories } = require("../../services/categories");
const { validateGetAllCategoriesQuery } = require("../../validator/categories");

exports.getAllCategories = asyncWrapper(async (req, res) => {
  const { error, value } = validateGetAllCategoriesQuery(req.query);
  if (error) throwError(422, cleanJoiError(error));
  const result = await getAllCategories(value);
  return sendSuccess(res, 200, "Categories fetched successfully", result);
});
