const Banner = require("../../models/Banner");
const { throwError, validateObjectId } = require("../../utils");
const { uploadImage, uploadVideo } = require("../uploads");

exports.createBanner = async (video, image, payload) => {
  let { name, description, subCategoryId, isActive } = payload;
  validateObjectId(subCategoryId, "SubCategory ID");
  name = name?.toLowerCase();
  // Description is kept as typed: links in it are case-sensitive, and a
  // lowercased YouTube video ID points at a different video or none.
  const existingBanner = await Banner.findOne({ name, isDeleted: false });
  if (existingBanner) {
    throwError(400, "Banner already exist with this name");
  }
  if (!video && !image) {
    throwError(422, "Either video or image is required");
  }
  let videoUrl;
  let imageUrl;
  if (video) videoUrl = await uploadVideo(video.tempFilePath);
  if (image) imageUrl = await uploadImage(image.tempFilePath);
  return await Banner.create({
    name,
    description,
    subCategoryId,
    image: imageUrl,
    video: videoUrl,
    isActive,
  });
};
