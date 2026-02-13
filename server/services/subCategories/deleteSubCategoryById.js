const SubCategory = require("../../models/SubCategory");
const Banner = require("../../models/Banner");
const Product = require("../../models/Product");
const { throwError, validateObjectId } = require("../../utils");
const { deleteAudioOrVideo, deleteImage } = require("../uploads");

exports.deleteSubCategoryById = async (id) => {
  validateObjectId(id, "SubCategory Id");
  const subCategory = await SubCategory.findById(id);
  if (!subCategory || subCategory.isDeleted) {
    throwError(404, "subCategory not found");
  }

  const banners = await Banner.find({
    subCategoryId: subCategory._id,
    isDeleted: false,
  });
  for (const b of banners) {
    await deleteAudioOrVideo(b?.video);
    await deleteImage(b?.image);
    b.isDeleted = true;
    b.isActive = false;
    b.image = null;
    b.video = null;
    b.updatedAt = new Date();
    await b.save();
  }

  const products = await Product.find({
    subCategoryId: subCategory._id,
    isDeleted: false,
  });
  for (const p of products) {
    await deleteImage(p?.image);
    p.image = null;
    p.isDeleted = true;
    p.isActive = false;
    p.updatedAt = new Date();
    await p.save();
  }

  await deleteImage(subCategory?.image);
  subCategory.image = null;
  subCategory.isDeleted = true;
  subCategory.isActive = false;
  subCategory.updatedAt = new Date();
  await subCategory.save();
  return;
};
