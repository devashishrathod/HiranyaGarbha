const mongoose = require("mongoose");
const User = require("../../models/User");
const Patient = require("../../models/Patient");
const Doctor = require("../../models/Doctor");
const {
  ROLES,
  AUDIENCE_MODES,
  AUDIENCE_GROUPS,
  NOTIFICATION_AUDIENCE,
  NOTIFICATION_LIMITS,
} = require("../../constants");
const { throwError } = require("../../utils");

/** `User.role` -> which feed that person's notifications belong in. */
const AUDIENCE_BY_ROLE = Object.freeze({
  [ROLES.USER]: NOTIFICATION_AUDIENCE.PATIENT,
  [ROLES.DOCTOR]: NOTIFICATION_AUDIENCE.DOCTOR,
  [ROLES.STAFF]: NOTIFICATION_AUDIENCE.STAFF,
  [ROLES.ADMIN]: NOTIFICATION_AUDIENCE.ADMIN,
});

const ROLE_LABELS = Object.freeze({
  [ROLES.USER]: "patients",
  [ROLES.DOCTOR]: "doctors",
  [ROLES.STAFF]: "staff",
  [ROLES.ADMIN]: "admins",
});

const toObjectIds = (values = []) =>
  values
    .filter((value) => value && mongoose.Types.ObjectId.isValid(String(value)))
    .map((value) => new mongoose.Types.ObjectId(String(value)));

/** Indian mobiles are stored as 10-digit numbers; pasted ones often carry 91. */
const lastTenDigits = (value = "") => {
  const digits = String(value).replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
};

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ------------------------------------------------------------------ */
/* Per-mode user-id collection                                         */
/* ------------------------------------------------------------------ */

/**
 * SEGMENT mode runs against the **profile** collection, not `User`.
 *
 * ⚠️ That is on purpose and it is why the numbers can differ slightly from
 * ROLE mode. The admin filtered a patient list in the UI — on trimester, on
 * when they joined — and those fields live on `Patient`. A `User` with role
 * `user` and no `Patient` profile exists during onboarding; "all patients" and
 * "patients matching a filter" are genuinely different questions, and a
 * segment that silently included profile-less accounts would be answering the
 * wrong one.
 */
const segmentUserIds = async (segment = {}) => {
  const group = segment.group || AUDIENCE_GROUPS.PATIENTS;
  const Model = group === AUDIENCE_GROUPS.DOCTORS ? Doctor : Patient;

  const match = {};

  if (typeof segment.isActive === "boolean") match.isActive = segment.isActive;

  if (segment.search) {
    const regex = new RegExp(escapeRegex(String(segment.search).trim()), "i");
    match.$or = [{ fullName: regex }, { email: regex }, { phone: regex }];
  }

  if (segment.fromDate || segment.toDate) {
    match.createdAt = {};
    if (segment.fromDate) match.createdAt.$gte = new Date(segment.fromDate);
    if (segment.toDate) {
      const end = new Date(segment.toDate);
      end.setHours(23, 59, 59, 999);
      match.createdAt.$lte = end;
    }
  }

  const profiles = await Model.find(match).select("userId").lean();
  return profiles.map((profile) => String(profile.userId)).filter(Boolean);
};

/**
 * CSV mode: pasted emails and phone numbers matched back to accounts.
 *
 * Whatever matches gets the full treatment — an in-app row and a push.
 * Whatever does not is reported, and an unmatched *email* can still be mailed
 * (there is simply no account to write a row against), which is the only
 * reason `externalEmails` exists.
 */
const csvTargets = async (contacts = {}) => {
  const emails = [
    ...new Set((contacts.emails || []).map((value) => value.trim().toLowerCase()).filter(Boolean)),
  ];
  const phones = [
    ...new Set((contacts.phones || []).map(lastTenDigits).filter((value) => value.length === 10)),
  ];

  if (!emails.length && !phones.length) {
    return { userIds: [], externalEmails: [], unmatched: 0 };
  }

  const or = [];
  if (emails.length) or.push({ email: { $in: emails } });
  if (phones.length) {
    or.push({ mobile: { $in: phones.map(Number).filter(Number.isFinite) } });
  }

  const matched = await User.find({ $or: or, isDeleted: { $ne: true } })
    .select("_id email mobile")
    .lean();

  const matchedEmails = new Set(
    matched.map((user) => (user.email || "").toLowerCase()).filter(Boolean)
  );
  const matchedPhones = new Set(
    matched.map((user) => lastTenDigits(user.mobile)).filter(Boolean)
  );

  const externalEmails = emails.filter((email) => !matchedEmails.has(email));
  const unmatchedPhones = phones.filter((phone) => !matchedPhones.has(phone));

  return {
    userIds: matched.map((user) => String(user._id)),
    externalEmails,
    // Only the phones are truly unreachable: with no SMS channel in phase 1
    // and no account behind the number, there is nowhere to deliver.
    unmatched: unmatchedPhones.length,
  };
};

/* ------------------------------------------------------------------ */
/* Enrichment                                                          */
/* ------------------------------------------------------------------ */

/**
 * Attach the display name and the merge-tag values that live on the profile.
 *
 * Two queries regardless of audience size — one for patients, one for doctors.
 * Doing this per recipient inside the send loop is what turns a broadcast into
 * thousands of round trips.
 */
const enrich = async (users) => {
  const patientIds = users
    .filter((user) => user.role === ROLES.USER)
    .map((user) => user.userId);
  const doctorIds = users
    .filter((user) => user.role === ROLES.DOCTOR)
    .map((user) => user.userId);

  const [patients, doctors] = await Promise.all([
    patientIds.length
      ? Patient.find({ userId: { $in: toObjectIds(patientIds) } })
          .select("userId fullName email phone currentTrimester")
          .lean()
      : [],
    doctorIds.length
      ? Doctor.find({ userId: { $in: toObjectIds(doctorIds) } })
          .select("userId fullName email phone")
          .lean()
      : [],
  ]);

  const profiles = new Map();
  [...patients, ...doctors].forEach((profile) => {
    profiles.set(String(profile.userId), profile);
  });

  return users.map((user) => {
    const profile = profiles.get(String(user.userId));

    return {
      ...user,
      // The profile name is the one an admin recognises; the account name is
      // often just whatever was typed at signup.
      name: profile?.fullName || user.name || "",
      email: user.email || profile?.email || null,
      currentTrimester: profile?.currentTrimester || null,
    };
  });
};

/* ------------------------------------------------------------------ */
/* Labels                                                              */
/* ------------------------------------------------------------------ */

const buildLabel = (target, total) => {
  switch (target.mode) {
    case AUDIENCE_MODES.ROLE: {
      const roles = (target.roles || []).map(
        (role) => `All ${ROLE_LABELS[role] || role}`
      );
      return roles.length ? roles.join(", ") : "No one selected";
    }
    case AUDIENCE_MODES.SEGMENT: {
      const segment = target.segment || {};
      const group =
        segment.group === AUDIENCE_GROUPS.DOCTORS ? "doctors" : "patients";
      const status =
        segment.isActive === true
          ? "Active"
          : segment.isActive === false
            ? "Inactive"
            : "All";

      const parts = [`${status} ${group}`];
      if (segment.search) parts.push(`matching "${segment.search}"`);
      if (segment.fromDate || segment.toDate) parts.push("joined in a date range");
      return parts.join(", ");
    }
    case AUDIENCE_MODES.MANUAL:
      return `${total} hand-picked ${total === 1 ? "recipient" : "recipients"}`;
    case AUDIENCE_MODES.CSV:
      return `${total} pasted ${total === 1 ? "contact" : "contacts"}`;
    default:
      return "Custom audience";
  }
};

/* ------------------------------------------------------------------ */
/* Public                                                              */
/* ------------------------------------------------------------------ */

/**
 * Turn a declarative audience into the people to notify.
 *
 * This is what keeps the notification layer role-agnostic: callers describe
 * *who* and never assemble user ids themselves. Adding a role later needs no
 * change here beyond it existing in `ROLES`.
 *
 * ```js
 * resolveAudience({ mode: "ROLE",    roles: ["user", "doctor"] })
 * resolveAudience({ mode: "SEGMENT", segment: { group: "PATIENTS", isActive: true } })
 * resolveAudience({ mode: "MANUAL",  userIds: [...] })
 * resolveAudience({ mode: "CSV",     contacts: { emails: [...], phones: [...] } })
 * ```
 *
 * ⚠️ Over the recipient cap it returns `truncated: true` with the real `total`
 * and an **empty** `users` array, rather than loading tens of thousands of
 * documents to then refuse them. The count endpoint reports the number; the
 * campaign service turns it into a 422. Neither has to guess.
 *
 * @param {object}  target
 * @param {object} [options]
 * @param {boolean}[options.countOnly]  skip fetching and enriching the users
 */
exports.resolveAudience = async (target = {}, { countOnly = false } = {}) => {
  const mode = target.mode;

  if (!Object.values(AUDIENCE_MODES).includes(mode)) {
    throwError(422, "An audience mode is required: ROLE, SEGMENT, MANUAL or CSV.");
  }

  let userIds = [];
  let externalEmails = [];
  let unmatched = 0;
  /**
   * Whether the ids below already came out of a `User` query that excluded
   * deleted accounts.
   *
   * ROLE and CSV collect their ids *from* `User`, so they are clean by
   * construction. SEGMENT reads the profile collections and MANUAL takes the
   * ids the admin picked — both can name an account that has since been
   * deleted, and counting those would put a number on the confirm dialog that
   * the send cannot match.
   */
  let verified = false;

  if (mode === AUDIENCE_MODES.ROLE) {
    const roles = (target.roles || []).filter((role) =>
      Object.values(ROLES).includes(role)
    );
    if (!roles.length) throwError(422, "Pick at least one role to send to.");

    const rows = await User.find({
      role: { $in: roles },
      isActive: true,
      isDeleted: { $ne: true },
    })
      .select("_id")
      .lean();
    userIds = rows.map((row) => String(row._id));
    verified = true;
  } else if (mode === AUDIENCE_MODES.SEGMENT) {
    userIds = await segmentUserIds(target.segment);
  } else if (mode === AUDIENCE_MODES.MANUAL) {
    if (!target.userIds?.length) {
      throwError(422, "Pick at least one recipient.");
    }
    userIds = target.userIds.map(String);
  } else {
    const csv = await csvTargets(target.contacts);
    userIds = csv.userIds;
    externalEmails = csv.externalEmails;
    unmatched = csv.unmatched;
    verified = true;
  }

  userIds = [...new Set(userIds.filter(Boolean))];

  /**
   * ⚠️ Narrowed to live accounts **before** the total is computed.
   *
   * It used to happen after, on the full fetch below — so a `countOnly` call
   * reported whatever the admin had picked, including ids for accounts that
   * had since been deleted. The confirm dialog would promise 200 recipients
   * and the campaign would record 197, with nothing anywhere saying why.
   */
  if (!verified && userIds.length) {
    const live = await User.find({
      _id: { $in: toObjectIds(userIds) },
      isDeleted: { $ne: true },
    })
      .select("_id")
      .lean();

    userIds = live.map((row) => String(row._id));
  }

  const total = userIds.length + externalEmails.length;
  const cap = NOTIFICATION_LIMITS.MAX_RECIPIENTS_PER_DISPATCH;
  const truncated = total > cap;

  const base = {
    total,
    truncated,
    cap,
    externalEmails,
    unmatched,
    label: buildLabel(target, total),
  };

  if (!total || truncated || countOnly) {
    return { ...base, users: [] };
  }

  const rows = await User.find({
    _id: { $in: toObjectIds(userIds) },
    isDeleted: { $ne: true },
  })
    .select("_id name email mobile role fcmToken")
    .lean();

  const users = rows.map((row) => ({
    userId: String(row._id),
    role: row.role,
    audience: AUDIENCE_BY_ROLE[row.role] || NOTIFICATION_AUDIENCE.PATIENT,
    name: row.name || "",
    email: row.email || null,
    mobile: row.mobile || null,
    fcmToken: row.fcmToken || null,
  }));

  return { ...base, users: await enrich(users) };
};

exports.AUDIENCE_BY_ROLE = AUDIENCE_BY_ROLE;
