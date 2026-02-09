const Banner = require("../../models/Banner");
const { throwError, validateObjectId } = require("../../utils");
const { DEFAULT_IMAGES } = require("../../constants");
const {
  uploadImage,
  uploadVideo,
  deleteImage,
  deleteAudioOrVideo,
} = require("../uploads");

exports.updateBanner = async (id, video, image, payload) => {
  validateObjectId(id, "Banner ID");
  const banner = await Banner.findOne({ _id: id, isDeleted: false });
  if (!banner) throwError(404, "Banner not found");
  let { name, description, categoryId, isActive, removeImage, removeVideo } =
    payload;
  if (typeof categoryId !== "undefined") {
    validateObjectId(categoryId, "Category ID");
    banner.categoryId = categoryId;
  }
  if (typeof name !== "undefined") {
    name = name?.toLowerCase();
    const exists = await Banner.findOne({
      _id: { $ne: banner._id },
      name,
      isDeleted: false,
    });
    if (exists) throwError(400, "Banner already exist with this name");
    banner.name = name;
  }
  if (typeof description !== "undefined") {
    banner.description = description?.toLowerCase();
  }
  if (typeof isActive !== "undefined") {
    banner.isActive = isActive;
  }

  if (removeVideo) {
    if (banner.video) await deleteAudioOrVideo(banner.video);
    banner.video = undefined;
  }

  if (removeImage) {
    if (banner.image) await deleteImage(banner.image);
    banner.image = DEFAULT_IMAGES.BANNER;
  }

  if (video) {
    if (banner.video) await deleteAudioOrVideo(banner.video);
    banner.video = await uploadVideo(video.tempFilePath);
  }
  if (image) {
    if (banner.image) await deleteImage(banner.image);
    banner.image = await uploadImage(image.tempFilePath);
  }
  return await banner.save();
};
