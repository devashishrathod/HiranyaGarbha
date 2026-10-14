const Appointment = require("../../models/Appointment");
const Doctor = require("../../models/Doctor");
const { bucketKey, fillSeries } = require("../../helpers/dashboard");

/*
 * Outcome groups. RESCHEDULED is left out everywhere: rescheduling closes the
 * old row and books a new one (`rescheduledFrom`), so counting both would put
 * one consultation on the chart twice.
 */
const COMPLETED = "COMPLETED";
const MISSED = ["CANCELLED", "NO_SHOW"];
const SUPERSEDED = "RESCHEDULED";

const inWindow = (start, end) => ({
  startTime: { $gte: start, $lte: end },
  status: { $ne: SUPERSEDED },
});

const countWhere = (condition) => ({ $sum: { $cond: [condition, 1, 0] } });

const OUTCOME_COUNTS = {
  total: { $sum: 1 },
  completed: countWhere({ $eq: ["$status", COMPLETED] }),
  missed: countWhere({ $in: ["$status", MISSED] }),
};

const TODAY_LIMIT = 8;
const TOP_DOCTORS_LIMIT = 5;

/**
 * Everything the dashboard shows about consultations for one window.
 *
 * Bucketed on `startTime` — when the consultation happens — rather than on
 * `createdAt`, so "Today" means today's clinic, not today's bookings.
 */
exports.getAppointmentOverview = async (range) => {
  const [rows, [previous], types, todayItems, todayTotal, topDoctors] =
    await Promise.all([
      Appointment.aggregate([
        { $match: inWindow(range.start, range.end) },
        {
          $group: {
            _id: bucketKey("$startTime", range.bucket),
            ...OUTCOME_COUNTS,
          },
        },
      ]),

      Appointment.aggregate([
        { $match: inWindow(range.previous.start, range.previous.end) },
        { $group: { _id: null, ...OUTCOME_COUNTS } },
      ]),

      Appointment.aggregate([
        { $match: inWindow(range.start, range.end) },
        { $group: { _id: "$appointmentType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      Appointment.find(inWindow(range.today.start, range.today.end))
        .sort({ startTime: 1 })
        .limit(TODAY_LIMIT)
        .select("appointmentNumber patientId doctorId startTime endTime appointmentType status")
        .populate("patientId", "fullName currentTrimester userId image")
        .populate("doctorId", "fullName specialization userId")
        .lean(),

      Appointment.countDocuments(inWindow(range.today.start, range.today.end)),

      Appointment.aggregate([
        {
          $match: {
            startTime: { $gte: range.start, $lte: range.end },
            status: { $in: [COMPLETED, ...MISSED] },
          },
        },
        {
          $group: {
            _id: "$doctorId",
            completed: countWhere({ $eq: ["$status", COMPLETED] }),
            settled: { $sum: 1 },
          },
        },
        { $match: { completed: { $gt: 0 } } },
        { $sort: { completed: -1 } },
        { $limit: TOP_DOCTORS_LIMIT },
        {
          $lookup: {
            from: Doctor.collection.name,
            localField: "_id",
            foreignField: "_id",
            as: "doctor",
          },
        },
        { $unwind: "$doctor" },
        {
          $project: {
            _id: 0,
            doctorId: "$_id",
            userId: "$doctor.userId",
            name: "$doctor.fullName",
            specialization: "$doctor.specialization",
            rating: "$doctor.rating",
            image: "$doctor.image",
            completed: 1,
            settled: 1,
          },
        },
      ]),
    ]);

  // Pending, confirmed, checked in or in progress — neither done nor missed.
  // On a past day that is a booking nobody closed, hence "open".
  const series = fillSeries(range, rows, { total: 0, completed: 0, missed: 0 }).map(
    (point) => ({ ...point, open: point.total - point.completed - point.missed })
  );

  const sum = (field) => series.reduce((total, point) => total + point[field], 0);

  return {
    total: sum("total"),
    completed: sum("completed"),
    missed: sum("missed"),
    previous: {
      total: previous?.total || 0,
      completed: previous?.completed || 0,
      missed: previous?.missed || 0,
    },
    series,
    types: types.map(({ _id, count }) => ({ type: _id || "CLINIC", count })),
    today: {
      total: todayTotal,
      items: todayItems.map((item) => ({
        id: item._id,
        appointmentNumber: item.appointmentNumber,
        startTime: item.startTime,
        endTime: item.endTime,
        type: item.appointmentType,
        status: item.status,
        patient: item.patientId
          ? {
              name: item.patientId.fullName,
              userId: item.patientId.userId,
              trimester: item.patientId.currentTrimester,
              image: item.patientId.image,
            }
          : null,
        doctor: item.doctorId
          ? {
              name: item.doctorId.fullName,
              userId: item.doctorId.userId,
              specialization: item.doctorId.specialization,
            }
          : null,
      })),
    },
    topDoctors,
  };
};
