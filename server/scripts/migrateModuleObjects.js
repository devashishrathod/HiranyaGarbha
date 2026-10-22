require("dotenv").config();

const mongoose = require("mongoose");
const { mongoDb } = require("../database/mongoDb");
const Subscription = require("../models/Subscription");
const PatientSubscription = require("../models/PatientSubscription");
const { normalizeModules } = require("../helpers/subscriptions");

/**
 * Turn string modules into { title } objects.
 *
 * Modules used to be plain strings; they now carry an optional description and
 * video link. The models already convert old records as they load, so nothing
 * breaks before this runs — but lean reads and the mobile app see whatever is
 * stored, so the stored data should match. Covers package records and the
 * snapshots copied into patient plans.
 *
 * Idempotent: only documents still holding a string module are touched.
 *
 *     npm run migrate:module-objects
 */

// Works on the raw collection: going through the model would convert the
// strings on load and then see nothing to save.
const migrate = async (collection, path) => {
  const docs = await collection
    .find({ [path]: { $type: "string" } })
    .project({ [path]: 1 })
    .toArray();

  if (!docs.length) return 0;

  const read = (doc) => path.split(".").reduce((value, key) => value?.[key], doc);

  const result = await collection.bulkWrite(
    docs.map((doc) => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { [path]: normalizeModules(read(doc)) } },
      },
    }))
  );

  return result.modifiedCount;
};

const run = async () => {
  if (!process.env.MONGO_URL) {
    console.error("MONGO_URL missing in env");
    process.exit(1);
  }

  await mongoDb();

  const packages = await migrate(Subscription.collection, "modules");
  const snapshots = await migrate(
    PatientSubscription.collection,
    "snapshot.modules"
  );

  console.log(`Packages converted       : ${packages}`);
  console.log(`Patient plans converted  : ${snapshots}`);

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error("Migration failed:", err);
  try {
    await mongoose.disconnect();
  } catch (e) {
    // ignore
  }
  process.exit(1);
});
