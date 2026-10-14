const Appointment = require("../../models/Appointment");
const ContactUs = require("../../models/ContactUs");
const Doctor = require("../../models/Doctor");
const DoctorAvailability = require("../../models/DoctorAvailability");
const PatientSubscription = require("../../models/PatientSubscription");
const SubscriptionPayment = require("../../models/SubscriptionPayment");
const {
  CHECKOUT_TIMEOUT_MINUTES,
  PAYMENT_ATTEMPT_STATUS,
  SUBSCRIPTION_KIND,
  SUBSCRIPTION_STATUS,
} = require("../../constants");

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const FAILED_PAYMENTS_WINDOW_MS = DAY_MS;
// Older abandoned checkouts are history, not something to chase today.
const ABANDONED_CHECKOUT_WINDOW_MS = 7 * DAY_MS;
const EXPIRING_SOON_MS = 7 * DAY_MS;

// Bookings still waiting on someone. Past their day, they should have been
// completed, cancelled or marked no-show.
const OPEN_APPOINTMENT_STATUSES = ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS"];

/*
 * A doctor patients can book: at least one available weekday with a shift.
 * An availability row with every day switched off books nobody either.
 */
const countDoctorsWithoutSchedule = async () => {
  const scheduled = await DoctorAvailability.distinct("doctorId", {
    weeklySchedule: {
      $elemMatch: { isAvailable: true, "shifts.0": { $exists: true } },
    },
  });

  return Doctor.countDocuments({
    isDeleted: false,
    isActive: true,
    _id: { $nin: scheduled },
  });
};

/**
 * Counts an admin should act on today. Always measured from now, whatever
 * range the dashboard is showing — a failed payment from last month is not
 * "needs attention".
 *
 * ⚠️ Abandoned checkouts are counted from `PENDING_PAYMENT` rows older than the
 * checkout timeout. Nothing closes those rows yet (the expiry sweep is
 * Phase 4 in docs/SUBSCRIPTIONS.md), so the count is capped to the last week
 * instead of growing forever.
 */
exports.getAttentionItems = async (range) => {
  const now = range.now.getTime();

  const [
    failedPayments,
    abandonedCheckouts,
    expiringPlans,
    doctorsWithoutSchedule,
    newEnquiries,
    unclosedAppointments,
  ] = await Promise.all([
    SubscriptionPayment.countDocuments({
      status: PAYMENT_ATTEMPT_STATUS.FAILED,
      updatedAt: { $gte: new Date(now - FAILED_PAYMENTS_WINDOW_MS) },
    }),
    PatientSubscription.countDocuments({
      isDeleted: false,
      status: SUBSCRIPTION_STATUS.PENDING_PAYMENT,
      createdAt: {
        $gte: new Date(now - ABANDONED_CHECKOUT_WINDOW_MS),
        $lte: new Date(now - CHECKOUT_TIMEOUT_MINUTES * 60 * 1000),
      },
    }),
    PatientSubscription.countDocuments({
      isDeleted: false,
      kind: SUBSCRIPTION_KIND.PACKAGE,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      endDate: { $gte: range.now, $lte: new Date(now + EXPIRING_SOON_MS) },
    }),
    countDoctorsWithoutSchedule(),
    ContactUs.countDocuments({
      isDeleted: false,
      createdAt: { $gte: range.today.start },
    }),
    Appointment.countDocuments({
      startTime: { $lt: range.today.start },
      status: { $in: OPEN_APPOINTMENT_STATUSES },
    }),
  ]);

  return {
    failedPayments,
    abandonedCheckouts,
    expiringPlans,
    doctorsWithoutSchedule,
    newEnquiries,
    unclosedAppointments,
  };
};
