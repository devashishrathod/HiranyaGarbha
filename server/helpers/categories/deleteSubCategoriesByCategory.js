const SubCategory = require("../../models/SubCategory");
const { deleteImage } = require("../../services/uploads");

exports.deleteSubCategoriesByCategory = async (categoryId) => {
  const subCategories = await SubCategory.find({
    categoryId: categoryId,
    isDeleted: false,
  });
  if (!subCategories.length) return;
  for (const sub of subCategories) {
    await deleteImage(sub?.image);
    sub.image = "";
    sub.isDeleted = true;
    sub.isActive = false;
    sub.updatedAt = new Date();
    await sub.save();
  }
};
