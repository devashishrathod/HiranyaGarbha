const Category = require("../../models/Category");
const SubCategory = require("../../models/SubCategory");
const Banner = require("../../models/Banner");
const Product = require("../../models/Product");
const { throwError, validateObjectId } = require("../../utils");
const { deleteAudioOrVideo, deleteImage } = require("../uploads");

exports.deleteCategoryById = async (id) => {
  validateObjectId(id, "Category Id");
  const category = await Category.findById(id);
  if (!category || category.isDeleted) throwError(404, "Category not found");

  const subCategories = await SubCategory.find({
    categoryId: category._id,
    isDeleted: false,
  });
  const subCategoryIds = subCategories.map((s) => s._id);

  if (subCategoryIds.length) {
    const banners = await Banner.find({
      subCategoryId: { $in: subCategoryIds },
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
      subCategoryId: { $in: subCategoryIds },
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

    for (const sub of subCategories) {
      await deleteImage(sub?.image);
      sub.image = "";
      sub.isDeleted = true;
      sub.isActive = false;
      sub.updatedAt = new Date();
      await sub.save();
    }
  }

  const productsByCategory = await Product.find({
    categoryId: category._id,
    isDeleted: false,
  });
  for (const p of productsByCategory) {
    await deleteImage(p?.image);
    p.image = null;
    p.isDeleted = true;
    p.isActive = false;
    p.updatedAt = new Date();
    await p.save();
  }

  await deleteImage(category?.image);
  category.image = null;
  category.isDeleted = true;
  category.isActive = false;
  category.updatedAt = new Date();
  await category.save();
  return;
};
