require("dotenv").config();

const mongoose = require("mongoose");
const { mongoDb } = require("../database/mongoDb");
const PrenatalCare = require("../models/PrenatalCare");
const {
  createPrenatalCare,
} = require("../services/prenatalCares/createPrenatalCare");
const { spreadTimestamps, applyTimestamps } = require("./lib/seedTimestamps");

// These services were listed on the site through the season, not in one sitting
const CREATED_FROM = "2026-07-08";
const CREATED_TO = "2026-09-02";
const EDITED_UNTIL = "2026-09-16T21:00:00";

/*
 * The services Hiranyagarbha offers through pregnancy and the weeks after it.
 * Names and descriptions go in as typed; createPrenatalCare lowercases them
 * the same way the admin panel does, and the panel title-cases on display.
 * No image is passed, so each record picks up DEFAULT_IMAGES.PRENATAL_CARE.
 */
const PRENATAL_CARES = [
  {
    name: "Antenatal Check-up",
    description:
      "Routine month-wise check-up covering weight, blood pressure, fundal height and fetal heartbeat, with a written summary after every visit.",
  },
  {
    name: "First Trimester Screening",
    description:
      "Early blood work and dating scan between week 8 and week 13 to confirm the due date and rule out early risks.",
  },
  {
    name: "NT Scan",
    description:
      "Nuchal translucency scan done between week 11 and week 14 to assess chromosomal risk along with the double marker test.",
  },
  {
    name: "Anomaly Scan",
    description:
      "Detailed level 2 ultrasound around week 20 that checks the baby organ by organ, with a consultant explaining every finding.",
  },
  {
    name: "Growth Scan and Doppler Study",
    description:
      "Third trimester scan tracking fetal growth, amniotic fluid and blood flow through the umbilical cord and placenta.",
  },
  {
    name: "Fetal Echocardiography",
    description:
      "Specialised scan of the baby heart, advised for mothers with diabetes, a family history of heart defects or an abnormal anomaly scan.",
  },
  {
    name: "Gestational Diabetes Screening",
    description:
      "Glucose tolerance testing with a follow-up diet and monitoring plan for mothers who test positive.",
  },
  {
    name: "Preeclampsia and Blood Pressure Monitoring",
    description:
      "Regular blood pressure and urine protein checks with home monitoring guidance for mothers at risk of preeclampsia.",
  },
  {
    name: "Anaemia and Haemoglobin Care",
    description:
      "Haemoglobin tracking through all three trimesters with iron supplementation, diet correction and infusion support when needed.",
  },
  {
    name: "Thyroid Monitoring in Pregnancy",
    description:
      "Trimester-wise TSH testing and dose adjustment for mothers on thyroid medication, coordinated with the treating physician.",
  },
  {
    name: "Prenatal Yoga Sessions",
    description:
      "Trimester-safe yoga led by a prenatal instructor to ease back pain, improve stamina and prepare the body for labour.",
  },
  {
    name: "Garbha Sanskar Meditation",
    description:
      "Guided meditation, mantra chanting and garbha samvad practices that build the bond between mother and baby.",
  },
  {
    name: "Pregnancy Nutrition Counselling",
    description:
      "Personalised diet charts built around the trimester, weight gain target, food preferences and any medical condition.",
  },
  {
    name: "Ayurvedic Prenatal Massage",
    description:
      "Gentle abhyanga with medicated oils by trained therapists to relieve swelling, cramps and sleeplessness.",
  },
  {
    name: "Breathing and Relaxation Therapy",
    description:
      "Pranayama and relaxation techniques that lower stress in pregnancy and help with pain management during labour.",
  },
  {
    name: "Prenatal Physiotherapy",
    description:
      "Physiotherapist-led exercises for back pain, sciatica, posture correction and safe movement in the later months.",
  },
  {
    name: "Pelvic Floor Strengthening",
    description:
      "Targeted pelvic floor programme that supports delivery and reduces the risk of postpartum incontinence.",
  },
  {
    name: "Birth Plan Counselling",
    description:
      "A sit-down with the obstetrician to write your birth preferences, pain relief choices and hospital plan.",
  },
  {
    name: "Labour Preparation Workshop",
    description:
      "Hands-on session on stages of labour, breathing through contractions, birthing positions and when to leave for the hospital.",
  },
  {
    name: "Normal Delivery Preparation",
    description:
      "Structured programme of movement, perineal care and mental preparation aimed at an unassisted vaginal delivery.",
  },
  {
    name: "C-Section Counselling and Recovery",
    description:
      "Preparation for a planned caesarean plus wound care, mobility and pain management guidance for the weeks after.",
  },
  {
    name: "Breastfeeding Preparation",
    description:
      "Antenatal class on latching, feeding positions, milk supply and what to expect in the first week after birth.",
  },
  {
    name: "Newborn Care Training",
    description:
      "Practical training in bathing, cord care, nappy changes, swaddling and reading newborn cues before the baby arrives.",
  },
  {
    name: "Postpartum Recovery Care",
    description:
      "Six-week recovery plan covering healing, nutrition, gentle exercise and follow-up checks for the mother.",
  },
  {
    name: "Lactation Consultation",
    description:
      "One-on-one support from a lactation consultant for latch trouble, low supply, engorgement and pumping schedules.",
  },
  {
    name: "Couple Bonding and Counselling",
    description:
      "Joint sessions that prepare both partners for the emotional and practical shifts of pregnancy and parenthood.",
  },
  {
    name: "Antenatal Mental Wellness Support",
    description:
      "Confidential counselling for anxiety, mood changes and sleep difficulty during pregnancy and after delivery.",
  },
  {
    name: "High-Risk Pregnancy Monitoring",
    description:
      "Closer follow-up for mothers with hypertension, diabetes, a previous loss or other risk factors, led by a maternal-fetal specialist.",
  },
  {
    name: "Twin Pregnancy Care",
    description:
      "Dedicated monitoring plan for twin and multiple pregnancies, with more frequent scans and an early delivery plan.",
  },
  {
    name: "Pregnancy Vaccination Schedule",
    description:
      "Tetanus, influenza and other recommended vaccines given on schedule, with reminders sent before each dose.",
  },
];

const seed = async () => {
  if (!process.env.MONGO_URL) {
    console.error("MONGO_URL missing in env");
    process.exit(1);
  }

  await mongoDb();

  let created = 0;
  let skipped = 0;
  const ids = [];

  for (const care of PRENATAL_CARES) {
    const name = care.name.toLowerCase();
    const exists = await PrenatalCare.findOne({ name, isDeleted: false }).lean();

    if (exists) {
      ids.push(exists._id);
      skipped += 1;
      continue;
    }

    const record = await createPrenatalCare({ ...care, isActive: true });
    ids.push(record._id);
    created += 1;
  }

  // Runs for skipped rows too, so the dates survive a re-run
  await applyTimestamps(
    PrenatalCare,
    ids,
    spreadTimestamps({
      count: ids.length,
      from: CREATED_FROM,
      to: CREATED_TO,
      until: EDITED_UNTIL,
      salt: "prenatal-care",
    })
  );

  const live = await PrenatalCare.countDocuments({ isDeleted: false });
  console.log(
    `Seed complete. Created: ${created}, Skipped (already present): ${skipped}, Live total: ${live}`
  );
  console.log(`Backdated ${ids.length} records: ${CREATED_FROM} to ${CREATED_TO}`);

  await mongoose.disconnect();
};

seed().catch(async (err) => {
  console.error("Seed failed:", err);
  try {
    await mongoose.disconnect();
  } catch (e) {
    // ignore
  }
  process.exit(1);
});
