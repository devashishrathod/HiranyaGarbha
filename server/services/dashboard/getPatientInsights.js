const Patient = require("../../models/Patient");
const Appointment = require("../../models/Appointment");
const SubscriptionPayment = require("../../models/SubscriptionPayment");
const { PAYMENT_ATTEMPT_STATUS } = require("../../constants");
const { TZ } = require("../../helpers/patientSubscriptions/period");

const DAY_MS = 24 * 60 * 60 * 1000;

/*
 * Days left to the due date at each trimester boundary. A pregnancy is 280
 * days (40 weeks), so week 14 starts 182 days before the EDD and week 28
 * starts 84 days before it.
 */
const SECOND_TRIMESTER_DAYS_LEFT = 182;
const THIRD_TRIMESTER_DAYS_LEFT = 84;
// Past the EDD by more than this, the baby has almost certainly arrived.
const OVERDUE_GRACE_DAYS = 14;
// An EDD further out than a whole pregnancy is a typo, not a first trimester.
const MAX_DAYS_LEFT = 294;
const DUE_SOON_DAYS = 30;

// What patients type when they mean "no condition".
const NO_CONDITION = ["", "none", "nil", "na", "n/a", "no"];

const distinctCount = async (Model, match, field) => {
  const [row] = await Model.aggregate([
    { $match: match },
    { $group: { _id: `$${field}` } },
    { $count: "count" },
  ]);
  return row?.count || 0;
};

/**
 * Trimester from the free-text `currentTrimester`, used only when there is no
 * usable EDD. The field holds whatever the client sent — "second", "First
 * Trimester", "2nd" — so it is matched loosely.
 */
const trimesterFromText = (expression) => ({
  $switch: {
    branches: [
      { case: { $regexMatch: { input: expression, regex: "third|3rd|^3$|trimester 3", options: "i" } }, then: "third" },
      { case: { $regexMatch: { input: expression, regex: "second|2nd|^2$|trimester 2", options: "i" } }, then: "second" },
      { case: { $regexMatch: { input: expression, regex: "first|1st|^1$|trimester 1", options: "i" } }, then: "first" },
    ],
    default: "unknown",
  },
});

/**
 * Where active patients are in their pregnancy today.
 *
 * ⚠️ Worked out from the EDD, not from `currentTrimester`. The trimester is
 * typed once when the profile is completed and never updated, so a patient who
 * said "first" in June is in her second trimester by September. The EDD does
 * not go stale. The text field is only the fallback for profiles without a
 * parseable EDD.
 */
const getPregnancyStages = async (range) => {
  const [row] = await Patient.aggregate([
    { $match: { isDeleted: false, isActive: true, isProfileCompleted: true } },
    {
      $project: {
        trimesterText: { $ifNull: ["$currentTrimester", ""] },
        hasCondition: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: { $ifNull: ["$medicalConditions", []] },
                  cond: {
                    $not: [{ $in: [{ $toLower: { $trim: { input: "$$this" } } }, NO_CONDITION] }],
                  },
                },
              },
            },
            0,
          ],
        },
        edd: {
          $dateFromString: {
            dateString: "$edd",
            timezone: TZ,
            onError: null,
            onNull: null,
          },
        },
      },
    },
    {
      $addFields: {
        daysLeft: {
          $cond: [
            { $eq: ["$edd", null] },
            null,
            { $divide: [{ $subtract: ["$edd", range.today.start] }, DAY_MS] },
          ],
        },
      },
    },
    {
      $addFields: {
        stage: {
          $cond: [
            { $eq: ["$daysLeft", null] },
            trimesterFromText("$trimesterText"),
            {
              $switch: {
                branches: [
                  { case: { $gt: ["$daysLeft", MAX_DAYS_LEFT] }, then: trimesterFromText("$trimesterText") },
                  { case: { $gt: ["$daysLeft", SECOND_TRIMESTER_DAYS_LEFT] }, then: "first" },
                  { case: { $gt: ["$daysLeft", THIRD_TRIMESTER_DAYS_LEFT] }, then: "second" },
                  { case: { $gte: ["$daysLeft", -OVERDUE_GRACE_DAYS] }, then: "third" },
                ],
                default: "delivered",
              },
            },
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        first: { $sum: { $cond: [{ $eq: ["$stage", "first"] }, 1, 0] } },
        second: { $sum: { $cond: [{ $eq: ["$stage", "second"] }, 1, 0] } },
        third: { $sum: { $cond: [{ $eq: ["$stage", "third"] }, 1, 0] } },
        delivered: { $sum: { $cond: [{ $eq: ["$stage", "delivered"] }, 1, 0] } },
        unknown: { $sum: { $cond: [{ $eq: ["$stage", "unknown"] }, 1, 0] } },
        dueSoon: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$daysLeft", null] },
                  { $gte: ["$daysLeft", 0] },
                  { $lte: ["$daysLeft", DUE_SOON_DAYS] },
                ],
              },
              1,
              0,
            ],
          },
        },
        withCondition: { $sum: { $cond: ["$hasCondition", 1, 0] } },
      },
    },
    { $project: { _id: 0 } },
  ]);

  return (
    row || {
      total: 0,
      first: 0,
      second: 0,
      third: 0,
      delivered: 0,
      unknown: 0,
      dueSoon: 0,
      withCondition: 0,
    }
  );
};

/**
 * New sign-ups for the window, the all-time journey from sign-up to a paid
 * plan, and where active patients are in their pregnancy.
 *
 * A Patient row is created at sign-up (`ensureRoleProfile`), so its
 * `createdAt` is the registration date and the row count is "registered".
 */
exports.getPatientInsights = async (range) => {
  const notDeleted = { isDeleted: false };

  const [
    newPatients,
    previousNewPatients,
    registered,
    profileCompleted,
    booked,
    paid,
    pregnancy,
  ] = await Promise.all([
    Patient.countDocuments({ ...notDeleted, createdAt: { $gte: range.start, $lte: range.end } }),
    Patient.countDocuments({
      ...notDeleted,
      createdAt: { $gte: range.previous.start, $lte: range.previous.end },
    }),
    Patient.countDocuments(notDeleted),
    Patient.countDocuments({ ...notDeleted, isProfileCompleted: true }),
    distinctCount(Appointment, { status: { $ne: "RESCHEDULED" } }, "patientId"),
    distinctCount(SubscriptionPayment, { status: PAYMENT_ATTEMPT_STATUS.CAPTURED }, "patientId"),
    getPregnancyStages(range),
  ]);

  return {
    newPatients,
    previousNewPatients,
    journey: [
      { key: "registered", count: registered },
      { key: "profileCompleted", count: profileCompleted },
      { key: "booked", count: booked },
      { key: "paid", count: paid },
    ],
    pregnancy,
  };
};
