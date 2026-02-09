require("dotenv").config();

const mongoose = require("mongoose");
const { mongoDb } = require("../database/mongoDb");
const Category = require("../models/Category");
const { CATEGORY_TYPES } = require("../constants");

const makeDocs = (type, count) => {
  const docs = [];
  for (let i = 1; i <= count; i += 1) {
    const name = `${type} category ${i}`.toLowerCase();
    docs.push({
      name,
      type,
      description: `seeded ${type} category ${i}`.toLowerCase(),
      isActive: true,
      isDeleted: false,
    });
  }
  return docs;
};

const seed = async () => {
  if (!process.env.MONGO_URL) {
    // eslint-disable-next-line no-console
    console.error("MONGO_URL missing in env");
    process.exit(1);
  }

  await mongoDb();

  const allDocs = [
    ...makeDocs(CATEGORY_TYPES.GALLERY, 30),
    ...makeDocs(CATEGORY_TYPES.PRODUCTS, 20),
  ];

  let inserted = 0;
  let skipped = 0;

  for (const doc of allDocs) {
    try {
      const exists = await Category.findOne({
        name: doc.name,
        type: doc.type,
        isDeleted: false,
      }).lean();

      if (exists) {
        skipped += 1;
        continue;
      }

      await Category.create(doc);
      inserted += 1;
    } catch (e) {
      skipped += 1;
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Seed complete. Inserted: ${inserted}, Skipped: ${skipped}`);

  await mongoose.disconnect();
};

seed().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error("Seed failed:", err);
  try {
    await mongoose.disconnect();
  } catch (e) {
    // ignore
  }
  process.exit(1);
});
