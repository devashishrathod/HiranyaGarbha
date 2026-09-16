require("dotenv").config();

const mongoose = require("mongoose");
const { mongoDb } = require("../database/mongoDb");
const Subscription = require("../models/Subscription");
const { SUBSCRIPTION_TIERS, PLAN_TRIMESTERS } = require("../constants");
const {
  CASE_INSENSITIVE,
  normalizePlans,
  applyPlanDerivedFields,
} = require("../helpers/subscriptions");
const { spreadTimestamps, applyTimestamps } = require("./lib/seedTimestamps");

// Packages went live over a few weeks, bonus courses added along the way
const CREATED_FROM = "2026-07-05";
const CREATED_TO = "2026-08-12";
const EDITED_UNTIL = "2026-09-16T21:00:00";

const packages = [
  {
    name: "BASIC PACKAGE",
    tier: SUBSCRIPTION_TIERS.BASIC,
    subtitle: "Foundation",
    description:
      "Free foundation course covering the essentials of a healthy, conscious pregnancy.",
    duration: "3 Months",
    idealFor: "First-time expecting mothers",
    badge: "Popular",
    theme: {
      color: "from-blue-500 to-blue-600",
      borderColor: "border-blue-500",
    },
    isFree: true,
    displayOrder: 1,
    modules: [
      "Introduction to Hiranyagarbha",
      "Pregnancy Month-wise Baby Development",
      "Healthy Pregnancy Lifestyle",
      "Nutrition & Diet Basics",
      "Pregnancy Yoga (Beginner)",
      "Breathing & Relaxation",
      "Meditation for Mother & Baby",
      "Garbha Samvad (Talking to Baby)",
      "Positive Affirmations",
      "Music Therapy",
      "Emotional Wellness",
      "Husband's Role in Pregnancy",
    ],
    includes: [
      "12 Recorded Video Modules",
      "Weekly Live Session",
      "Diet Charts",
      "Daily Affirmations",
      "Mobile App Access",
      "WhatsApp Support",
      "Pregnancy Journal (Digital)",
    ],
    // Free in every trimester, so a single "all trimesters" plan
    plans: [{ trimester: PLAN_TRIMESTERS.ALL, price: 0, originalPrice: 7999 }],
  },
  {
    name: "PRO PACKAGE",
    tier: SUBSCRIPTION_TIERS.PRO,
    subtitle: "Holistic Pregnancy Transformation",
    description:
      "Comprehensive trimester-wise care covering yoga, ayurveda, nutrition and doctor support.",
    duration: "Entire Pregnancy",
    idealFor: "Mothers seeking comprehensive care",
    badge: "Best Value",
    theme: {
      color: "from-purple-500 to-purple-600",
      borderColor: "border-purple-500",
    },
    isPopular: true,
    displayOrder: 2,
    modules: [
      "Trimester-wise Masterclasses",
      "Advanced Pregnancy Yoga",
      "Ayurvedic Pregnancy Care",
      "Stress & Anxiety Management",
      "Couple Bonding Sessions",
      "Fetal Brain Development Activities",
      "Sanskrit Mantras & Meaning",
      "Mindfulness & Visualization",
      "Garbha Meditation Series",
      "Labour Preparation",
      "Breastfeeding Preparation",
      "Newborn Care Basics",
      "Parenting Psychology",
      "Family Counselling",
      "Nutrition Masterclass",
    ],
    includes: [
      "Everything in Basic Package",
      "Weekly Live Q&A",
      "Monthly Doctor Consultation",
      "Dietician Consultation",
      "Personalized Pregnancy Tracker",
      "Monthly Baby Growth Report",
      "Exclusive Community Access",
    ],
    exclusiveBenefits: [
      "Weekly Live Q&A Sessions",
      "Monthly Doctor Consultation",
      "Personal Dietician Consultation",
      "Personalized Pregnancy Tracker",
      "Monthly Baby Growth Reports",
      "Exclusive Community Access",
    ],
    // Joining earlier costs more because more of the journey is covered
    plans: [
      { trimester: PLAN_TRIMESTERS.FIRST, price: 15000, originalPrice: 22499 },
      { trimester: PLAN_TRIMESTERS.SECOND, price: 9999, originalPrice: 14999 },
      { trimester: PLAN_TRIMESTERS.THIRD, price: 5999, originalPrice: 8999 },
    ],
  },
  {
    name: "ELITE PACKAGE",
    tier: SUBSCRIPTION_TIERS.ELITE,
    subtitle: "Complete Conscious Parenting Program",
    description:
      "End-to-end pregnancy and postpartum programme with 1:1 medical, wellness and parenting support.",
    duration: "Entire Pregnancy + Postpartum",
    idealFor: "Complete pregnancy & parenting journey",
    badge: "Premium",
    theme: {
      color: "from-amber-500 to-orange-500",
      borderColor: "border-amber-500",
    },
    displayOrder: 3,
    modules: [
      "Everything in Pro Package",
      "Chakra Healing Meditation",
      "Sound Healing",
      "Advanced Yoga",
      "Couple Meditation",
      "Parenting Coaching",
      "Birth Plan Creation",
      "Normal Delivery Preparation",
      "Labour Breathing Workshop",
      "Hospital Bag Checklist",
      "Emergency Preparedness",
      "Breastfeeding Coaching",
      "Postpartum Recovery",
      "Baby Massage Guidance",
      "Infant Development (0-6 Months)",
    ],
    includes: [
      "Everything in Pro Package",
      "Personalized Obstetric Consultation",
      "Nutrition Review",
      "Physiotherapy Guidance",
      "Mental Wellness Counselling",
      "High-Risk Pregnancy Guidance",
      "1:1 Mentor Support",
      "Priority WhatsApp Support",
      "Lifetime App Access",
      "Completion Certificate",
    ],
    premiumFeatures: {
      medicalCare: [
        "Personalized Obstetric Consultation",
        "Nutrition Review",
        "Physiotherapy Guidance",
        "Mental Wellness Counselling",
        "High-Risk Pregnancy Guidance (where appropriate)",
      ],
      holisticWellness: [
        "Chakra Healing Meditation",
        "Sound Healing",
        "Advanced Yoga",
        "Couple Meditation",
        "Parenting Coaching",
      ],
      birthPreparation: [
        "Birth Plan Creation",
        "Normal Delivery Preparation",
        "Labour Breathing Workshop",
        "Hospital Bag Checklist",
        "Emergency Preparedness",
      ],
      afterDelivery: [
        "Breastfeeding Coaching",
        "Postpartum Recovery",
        "Baby Massage Guidance",
        "Infant Development (0-6 Months)",
        "Parenting Masterclass",
        "Mother's Mental Health",
      ],
      premiumSupport: [
        "1:1 Mentor",
        "Priority WhatsApp Support",
        "Monthly Expert Panel",
        "Lifetime App Access",
        "Recorded Session Library",
        "E-books & Printable Resources",
        "Completion Certificate",
      ],
    },
    plans: [
      { trimester: PLAN_TRIMESTERS.FIRST, price: 30000, originalPrice: 44999 },
      { trimester: PLAN_TRIMESTERS.SECOND, price: 17999, originalPrice: 26999 },
      { trimester: PLAN_TRIMESTERS.THIRD, price: 11999, originalPrice: 17999 },
    ],
  },
];

// Optional add-ons, priced the same whichever trimester the mother is in
const bonusCourses = [
  { name: "Pregnancy after IVF", price: 1999 },
  { name: "Gestational Diabetes Management", price: 1499 },
  { name: "High-Risk Pregnancy Support", price: 2499 },
  { name: "Fertility Preparation (Pre-Conception)", price: 1999 },
  { name: "Father-to-Be Masterclass", price: 999 },
  { name: "Grandparents' Orientation", price: 799 },
  { name: "Infant CPR & First Aid", price: 1499 },
  { name: "Early Brain Development (0-2 Years)", price: 1999 },
  { name: "Conscious Parenting Bootcamp", price: 2499 },
].map((course, index) => ({
  name: course.name,
  tier: SUBSCRIPTION_TIERS.BONUS,
  subtitle: "Bonus Course",
  duration: "Self-paced",
  idealFor: "Optional add-on to any package",
  theme: {
    color: "from-green-500 to-blue-500",
    borderColor: "border-green-500",
  },
  displayOrder: index + 1,
  plans: [{ trimester: PLAN_TRIMESTERS.ALL, price: course.price }],
}));

const buildDoc = (input) => {
  const doc = { ...input, isActive: true, isDeleted: false };
  doc.plans = normalizePlans(input.plans);
  applyPlanDerivedFields(doc, doc.plans);
  return doc;
};

const seed = async () => {
  if (!process.env.MONGO_URL) {
    console.error("MONGO_URL missing in env");
    process.exit(1);
  }

  await mongoDb();

  const docs = [...packages, ...bonusCourses].map(buildDoc);
  const seededNames = docs.map((doc) => doc.name);

  // Anything outside this list is retired, never destroyed
  const retired = await Subscription.updateMany(
    { isDeleted: false, name: { $nin: seededNames } },
    { $set: { isDeleted: true, isActive: false, updatedAt: new Date() } }
  ).collation(CASE_INSENSITIVE);

  let created = 0;
  let updated = 0;
  const ids = [];

  for (const doc of docs) {
    const existing = await Subscription.findOne({ name: doc.name })
      .collation(CASE_INSENSITIVE)
      .select("_id");

    if (existing) {
      await Subscription.updateOne({ _id: existing._id }, { $set: doc });
      ids.push(existing._id);
      updated += 1;
    } else {
      const record = await Subscription.create(doc);
      ids.push(record._id);
      created += 1;
    }
  }

  await applyTimestamps(
    Subscription,
    ids,
    spreadTimestamps({
      count: ids.length,
      from: CREATED_FROM,
      to: CREATED_TO,
      until: EDITED_UNTIL,
      salt: "subscription",
    })
  );

  console.log(
    `Seed complete. Created: ${created}, Updated: ${updated}, Retired: ${retired.modifiedCount}`
  );
  console.log(`Backdated ${ids.length} packages: ${CREATED_FROM} to ${CREATED_TO}`);

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
