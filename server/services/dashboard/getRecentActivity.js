const Appointment = require("../../models/Appointment");
const ContactUs = require("../../models/ContactUs");
const NotificationCampaign = require("../../models/NotificationCampaign");
const Patient = require("../../models/Patient");
const PatientSubscription = require("../../models/PatientSubscription");
const {
  CAMPAIGN_STATUS,
  PAYMENT_ATTEMPT_STATUS,
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_TIERS,
} = require("../../constants");
const { findPayments, toPaymentView } = require("./getRecentPayments");

const DEFAULT_LIMIT = 10;

const PAYMENT_EVENT = {
  [PAYMENT_ATTEMPT_STATUS.CAPTURED]: "PAYMENT_CAPTURED",
  [PAYMENT_ATTEMPT_STATUS.FAILED]: "PAYMENT_FAILED",
  [PAYMENT_ATTEMPT_STATUS.REFUNDED]: "PAYMENT_REFUNDED",
};

const personOf = (profile) =>
  profile ? { name: profile.fullName || null, userId: profile.userId || null } : null;

/**
 * A merged feed of what happened most recently across the platform.
 *
 * There is no activity log collection, so each source is read for its own
 * latest rows and the union is cut to `limit`. Reading `limit` rows from every
 * source guarantees the newest `limit` events overall are among them.
 */
exports.getRecentActivity = async (limit = DEFAULT_LIMIT) => {
  const [patients, payments, booked, cancelled, freePlans, campaigns, enquiries] =
    await Promise.all([
      Patient.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("fullName userId createdAt")
        .lean(),

      findPayments(
        { status: { $in: Object.keys(PAYMENT_EVENT) } },
        { updatedAt: -1 },
        limit
      ),

      Appointment.find({ status: { $ne: "RESCHEDULED" } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("patientId doctorId startTime createdAt")
        .populate("patientId", "fullName userId")
        .populate("doctorId", "fullName")
        .lean(),

      Appointment.find({ status: "CANCELLED" })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .select("patientId doctorId startTime cancelledBy updatedAt")
        .populate("patientId", "fullName userId")
        .populate("doctorId", "fullName")
        .lean(),

      // Paid plans already show up as captured payments; free Basic has no
      // payment row, so its activation is read from the subscription itself.
      PatientSubscription.find({
        isDeleted: false,
        tier: SUBSCRIPTION_TIERS.BASIC,
        status: { $ne: SUBSCRIPTION_STATUS.PENDING_PAYMENT },
        startDate: { $ne: null },
      })
        .sort({ startDate: -1 })
        .limit(limit)
        .select("patientId startDate snapshot.name")
        .populate("patientId", "fullName userId")
        .lean(),

      NotificationCampaign.find({
        isDeleted: false,
        status: {
          $in: [CAMPAIGN_STATUS.SENT, CAMPAIGN_STATUS.PARTIAL, CAMPAIGN_STATUS.FAILED],
        },
      })
        .sort({ completedAt: -1, updatedAt: -1 })
        .limit(limit)
        .select("title status stats completedAt updatedAt")
        .lean(),

      ContactUs.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("name city createdAt")
        .lean(),
    ]);

  const events = [
    ...patients.map((row) => ({
      id: `patient-${row._id}`,
      type: "PATIENT_REGISTERED",
      at: row.createdAt,
      patient: personOf(row),
    })),

    ...payments.map((row) => {
      const payment = toPaymentView(row);
      return {
        id: `payment-${row._id}`,
        type: PAYMENT_EVENT[row.status],
        at: payment.at,
        patient: payment.patient,
        amount: payment.amount,
        method: payment.method,
        tier: payment.tier,
        trimester: payment.trimester,
        planName: payment.planName,
      };
    }),

    ...booked.map((row) => ({
      id: `booked-${row._id}`,
      type: "APPOINTMENT_BOOKED",
      at: row.createdAt,
      patient: personOf(row.patientId),
      doctorName: row.doctorId?.fullName || null,
      startTime: row.startTime,
    })),

    ...cancelled.map((row) => ({
      id: `cancelled-${row._id}`,
      type: "APPOINTMENT_CANCELLED",
      at: row.updatedAt,
      patient: personOf(row.patientId),
      doctorName: row.doctorId?.fullName || null,
      startTime: row.startTime,
      cancelledBy: row.cancelledBy || null,
    })),

    ...freePlans.map((row) => ({
      id: `plan-${row._id}`,
      type: "FREE_PLAN_ACTIVATED",
      at: row.startDate,
      patient: personOf(row.patientId),
      planName: row.snapshot?.name || null,
    })),

    ...campaigns.map((row) => ({
      id: `campaign-${row._id}`,
      type: "CAMPAIGN_SENT",
      at: row.completedAt || row.updatedAt,
      title: row.title,
      status: row.status,
      delivered:
        (row.stats?.push?.sent || 0) + (row.stats?.email?.sent || 0),
    })),

    ...enquiries.map((row) => ({
      id: `enquiry-${row._id}`,
      type: "ENQUIRY_RECEIVED",
      at: row.createdAt,
      name: row.name,
      city: row.city,
    })),
  ];

  return events
    .filter((event) => event.at)
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, limit);
};
