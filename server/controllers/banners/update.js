const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
} = require("../../utils");
const { updateBanner } = require("../../services/banners");
const { validateUpdateBanner } = require("../../validator/banners");

exports.update = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { error, value } = validateUpdateBanner(req.body);
  if (error) throwError(422, cleanJoiError(error));
  const image = req.files?.image;
  const video = req.files?.video;
  const result = await updateBanner(id, video, image, value);
  return sendSuccess(res, 200, "Banner updated successfully", result);
});
