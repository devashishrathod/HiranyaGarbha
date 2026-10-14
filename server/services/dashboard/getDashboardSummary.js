const { resolveRange, percentChange } = require("../../helpers/dashboard");
const { getRevenue } = require("./getRevenue");
const { getPlanMix } = require("./getPlanMix");
const { getAppointmentOverview } = require("./getAppointmentOverview");
const { getPatientInsights } = require("./getPatientInsights");
const { getAttentionItems } = require("./getAttentionItems");
const { getRecentActivity } = require("./getRecentActivity");
const { getRecentPayments } = require("./getRecentPayments");
const { getLastCampaign } = require("./getLastCampaign");

/* Completed out of everything that reached an outcome, as a percentage. */
const attendanceRate = ({ completed, missed }) => {
  const settled = completed + missed;
  return settled ? Math.round((completed / settled) * 1000) / 10 : null;
};

/**
 * Everything the admin dashboard renders, for one date window, in one call.
 *
 * One request rather than one per panel: the panel loads as a whole, a range
 * change refetches once, and every number on screen is cut from the same
 * instant instead of from a dozen requests that landed seconds apart.
 */
exports.getDashboardSummary = async (query) => {
  const range = resolveRange(query);

  const [revenue, plans, appointments, patients, attention, activity, payments, lastCampaign] =
    await Promise.all([
      getRevenue(range),
      getPlanMix(range),
      getAppointmentOverview(range),
      getPatientInsights(range),
      getAttentionItems(range),
      getRecentActivity(),
      getRecentPayments(),
      getLastCampaign(),
    ]);

  const currentAttendance = attendanceRate(appointments);
  const previousAttendance = attendanceRate(appointments.previous);

  return {
    range: {
      key: range.key,
      label: range.label,
      bucket: range.bucket,
      start: range.start,
      end: range.end,
      previous: range.previous,
    },
    generatedAt: range.now,

    kpis: {
      revenue: {
        value: revenue.total,
        previous: revenue.previousTotal,
        change: percentChange(revenue.total, revenue.previousTotal),
        payments: revenue.payments,
      },
      subscribers: {
        value: plans.total,
        paid: plans.paid,
        activatedInRange: plans.activatedInRange,
      },
      newPatients: {
        value: patients.newPatients,
        previous: patients.previousNewPatients,
        change: percentChange(patients.newPatients, patients.previousNewPatients),
      },
      appointments: {
        value: appointments.total,
        previous: appointments.previous.total,
        change: percentChange(appointments.total, appointments.previous.total),
        today: appointments.today.total,
      },
      attendance: {
        value: currentAttendance,
        previous: previousAttendance,
        // Percentage points, not percent: 90% → 92% is +2 points.
        change:
          currentAttendance !== null && previousAttendance !== null
            ? Math.round((currentAttendance - previousAttendance) * 10) / 10
            : null,
        completed: appointments.completed,
        missed: appointments.missed,
      },
    },

    revenue: revenue.series,
    plans: { total: plans.total, paid: plans.paid, bonus: plans.bonus, tiers: plans.tiers },
    appointments: {
      series: appointments.series,
      types: appointments.types,
      completed: appointments.completed,
      missed: appointments.missed,
      total: appointments.total,
    },
    journey: patients.journey,
    pregnancy: patients.pregnancy,
    attention,
    today: appointments.today,
    activity,
    payments,
    topDoctors: appointments.topDoctors,
    lastCampaign,
  };
};
