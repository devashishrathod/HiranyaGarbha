require("dotenv").config();

const mongoose = require("mongoose");
const { mongoDb } = require("../database/mongoDb");
const Patient = require("../models/Patient");
const { grantFreeBasic } = require("../services/patientSubscriptions");

/**
 * Give every existing patient the free Basic package.
 *
 * `completeProfile` grants it from now on; this is the one-off for everyone
 * who signed up before that existed. Idempotent — `grantFreeBasic` skips a
 * patient who already holds a package, so re-running is free.
 *
 * ⚠️ Runs with notifications off. These plans are backdated bookkeeping, not
 * something that just happened to the patient; announcing them would mail
 * every existing patient at once.
 *
 *     npm run backfill:free-basic
 */
const backfill = async () => {
  if (!process.env.MONGO_URL) {
    console.error("MONGO_URL missing in env");
    process.exit(1);
  }

  await mongoDb();

  const patients = await Patient.find({
    isDeleted: false,
    isProfileCompleted: true,
  })
    .select("_id fullName")
    .lean();

  let granted = 0;
  const skipped = {};

  for (const patient of patients) {
    const result = await grantFreeBasic(patient._id, { notify: false });

    if (result.granted) {
      granted += 1;
    } else {
      skipped[result.reason] = (skipped[result.reason] || 0) + 1;
    }
  }

  console.log(`Patients checked : ${patients.length}`);
  console.log(`Basic granted    : ${granted}`);
  Object.entries(skipped).forEach(([reason, count]) =>
    console.log(`Skipped (${reason}): ${count}`)
  );

  await mongoose.disconnect();
};

backfill().catch(async (err) => {
  console.error("Backfill failed:", err);
  try {
    await mongoose.disconnect();
  } catch (e) {
    // ignore
  }
  process.exit(1);
});
