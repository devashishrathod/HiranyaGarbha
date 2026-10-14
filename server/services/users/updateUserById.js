const User = require("../../models/User");
const { throwError } = require("../../utils");
const { uploadImage, deleteImage } = require("../uploads");
const { isAdult } = require("../../helpers/users");
const { getUserById } = require("./getUserById");

/**
 * Applies a validated profile update.
 *
 * A field left out of `payload` is left alone; an empty `address` or `dob`
 * clears it. Name and address are stored lower-case, the same as at sign-up.
 *
 * `image` is an express-fileupload file that the controller has already
 * checked; `payload.removeImage` drops the current photo instead.
 */
exports.updateUserById = async (userId, payload = {}, image) => {
  const user = await User.findById(userId);
  if (!user || user?.isDeleted) throwError(404, "User not found");

  const { name, email, mobile, dob, address, removeImage } = payload;

  if (name !== undefined) user.name = name.toLowerCase();
  if (address !== undefined) user.address = address.toLowerCase();

  if (dob !== undefined) {
    if (dob && !isAdult(dob)) throwError(400, "User must be at least 18 years old");
    user.dob = dob || undefined;
  }

  if (email && email !== user.email) {
    const emailExists = await User.exists({
      email,
      role: user.role,
      _id: { $ne: userId },
      isDeleted: false,
    });
    if (emailExists) throwError(400, "Email already exists with another user");
    user.email = email;
    user.isEmailVerified = false;
  }

  // Joi has already turned the multipart string into a number, so this is a
  // real comparison — a string here would re-flag the mobile as unverified on
  // every save.
  if (mobile !== undefined && mobile !== user.mobile) {
    const mobileExists = await User.exists({
      mobile,
      role: user.role,
      _id: { $ne: userId },
      isDeleted: false,
    });
    if (mobileExists) throwError(400, "Mobile number already exists with another user");
    user.mobile = mobile;
    user.isMobileVerified = false;
  }

  const previousImage = user.image;
  let uploadedImage = null;

  if (image) {
    uploadedImage = await uploadImage(image.tempFilePath);
    user.image = uploadedImage;
  } else if (removeImage) {
    user.image = undefined;
  }

  try {
    await user.save();
  } catch (error) {
    // The new photo is already on Cloudinary; don't leave it orphaned.
    if (uploadedImage) await deleteImage(uploadedImage);
    throw error;
  }

  /*
   * ⚠️ The old photo goes only after the new state is saved. Deleting it first
   * — as this used to — left the account with a dead image URL whenever the
   * upload or the save failed.
   */
  if ((image || removeImage) && previousImage && previousImage !== user.image) {
    await deleteImage(previousImage);
  }

  // Same shape as GET /users/get, so the client can drop it straight in.
  return getUserById(user._id);
};
