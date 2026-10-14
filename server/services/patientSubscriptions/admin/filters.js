const mongoose = require("mongoose");
const moment = require("moment-timezone");
const Patient = require("../../../models/Patient");
const {
  CHECKOUT_TIMEOUT_MINUTES,
  SUBSCRIPTION_STATUS,
} = require("../../../constants");
const { TZ, lapsedExpression } = require("../../../helpers/patientSubscriptions");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/*
 * Patients whose name, phone or email match the search. Capped: a one-letter
 * search should narrow the list, not pull every patient id into a query.
 */
const SEARCH_PATIENT_LIMIT = 500;

/**
 * The plan's state as an admin should read it, as an aggregation expression.
 *
 * ⚠️ Computed, not stored. The expiry sweep runs hourly, so for up to an hour
 * a lapsed plan is still stored ACTIVE; and nothing closes a stale checkout
 * yet, so a PENDING_PAYMENT older than the checkout timeout is an abandoned
 * one. The listing, its filter and the stats all read this one expression, so
 * the count on a status tab always matches the rows under it.
 */
const stateExpression = (now) => {
  const checkoutCutoff = new Date(now.getTime() - CHECKOUT_TIMEOUT_MINUTES * 60 * 1000);

  return {
    $switch: {
      branches: [
        {
          case: {
            $and: [
              { $eq: ["$status", SUBSCRIPTION_STATUS.PENDING_PAYMENT] },
              { $lt: ["$createdAt", checkoutCutoff] },
            ],
          },
          then: "ABANDONED",
        },
        // The expiry sweep's own rule (grace included), so between hourly
        // sweeps a lapsed plan already reads EXPIRED and a plan inside its
        // grace days still reads ACTIVE — exactly what the sweep will do.
        { case: lapsedExpression(now), then: "EXPIRED" },
      ],
      default: "$status",
    },
  };
};

/**
 * The `$match` for every filter except the state, which is applied after the
 * state is computed. Listing and stats share it, so a filter narrows the
 * status counts exactly as it narrows the rows.
 *
 * Dates are calendar days in IST, the same as everywhere else in the panel.
 */
const buildBaseMatch = async (query = {}) => {
  const and = [{ isDeleted: false }];

  ["tier", "kind", "trimester", "paymentStatus", "source"].forEach((field) => {
    if (query[field]) and.push({ [field]: query[field] });
  });

  // Aggregations do not cast, so ids must already be ObjectIds here.
  if (query.patientId) and.push({ patientId: new mongoose.Types.ObjectId(query.patientId) });
  if (query.packageId) and.push({ packageId: new mongoose.Types.ObjectId(query.packageId) });

  if (query.fromDate || query.toDate) {
    const createdAt = {};
    if (query.fromDate) {
      createdAt.$gte = moment.tz(query.fromDate, "YYYY-MM-DD", TZ).startOf("day").toDate();
    }
    if (query.toDate) {
      createdAt.$lte = moment.tz(query.toDate, "YYYY-MM-DD", TZ).endOf("day").toDate();
    }
    and.push({ createdAt });
  }

  const search = query.search?.trim();
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    const patients = await Patient.find({
      $or: [
        { fullName: pattern },
        { phone: pattern },
        { whatsappNumber: pattern },
        { email: pattern },
      ],
    })
      .select("_id")
      .limit(SEARCH_PATIENT_LIMIT)
      .lean();

    and.push({
      $or: [
        { subscriptionNumber: pattern },
        { "snapshot.name": pattern },
        { patientId: { $in: patients.map((patient) => patient._id) } },
      ],
    });
  }

  return { $and: and };
};

module.exports = { stateExpression, buildBaseMatch };
