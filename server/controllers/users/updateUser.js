const {
  asyncWrapper,
  sendSuccess,
  throwError,
  cleanJoiError,
  validateObjectId,
} = require("../../utils");
const { ROLES, PROFILE_IMAGE } = require("../../constants");
const { updateUserById } = require("../../services/users");
const { validateUpdateUser } = require("../../validator/users");
const { validateImage, removeTempFile } = require("../../helpers/uploads");

exports.updateUser = asyncWrapper(async (req, res) => {
  const image = req.files?.image;

  try {
    /*
     * ⚠️ Only an admin may edit another account through `?userId=`. Taking the
     * query param from anyone would let a patient rewrite another patient's
     * email or mobile — and with it, their login.
     */
    const requested = req.query?.userId;
    let userId = req.userId;
    if (requested && String(requested) !== String(req.userId)) {
      if (req.role !== ROLES.ADMIN) {
        throwError(403, "You can only update your own profile");
      }
      validateObjectId(requested, "user id");
      userId = requested;
    }

    const { error, value } = validateUpdateUser(req.body);
    if (error) throwError(422, cleanJoiError(error));

    if (image) {
      validateImage(image, {
        maxBytes: PROFILE_IMAGE.MAX_BYTES,
        mimeTypes: PROFILE_IMAGE.MIME_TYPES,
      });
    }

    const updatedUser = await updateUserById(userId, value, image);
    return sendSuccess(res, 200, "User profile updated successfully", updatedUser);
  } finally {
    // express-fileupload leaves its temp file behind whether we used it or not.
    removeTempFile(image);
  }
});
