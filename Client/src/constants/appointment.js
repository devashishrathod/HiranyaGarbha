/**
 * Mirrors the enums declared on the server (models/Appointment.js).
 * Keep the keys in sync if the backend enum ever changes.
 */

export const APPOINTMENT_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CHECKED_IN: "CHECKED_IN",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW",
  RESCHEDULED: "RESCHEDULED",
};

export const STATUS_META = {
  PENDING: { label: "Pending", tone: "amber" },
  CONFIRMED: { label: "Confirmed", tone: "green" },
  CHECKED_IN: { label: "Checked In", tone: "teal" },
  IN_PROGRESS: { label: "In Progress", tone: "blue" },
  COMPLETED: { label: "Completed", tone: "purple" },
  CANCELLED: { label: "Cancelled", tone: "red" },
  NO_SHOW: { label: "No Show", tone: "red" },
  RESCHEDULED: { label: "Rescheduled", tone: "blue" },
};

export const STATUS_OPTIONS = Object.keys(STATUS_META).map((value) => ({
  value,
  label: STATUS_META[value].label,
}));

/** Statuses that still need someone to act on them */
export const OPEN_STATUSES = [
  APPOINTMENT_STATUS.PENDING,
  APPOINTMENT_STATUS.CONFIRMED,
  APPOINTMENT_STATUS.CHECKED_IN,
  APPOINTMENT_STATUS.IN_PROGRESS,
  APPOINTMENT_STATUS.RESCHEDULED,
];

export const APPOINTMENT_TYPES = [
  { value: "CLINIC", label: "Clinic Visit" },
  { value: "VIDEO", label: "Video Call" },
  { value: "AUDIO", label: "Audio Call" },
  { value: "HOME_VISIT", label: "Home Visit" },
];

export const PAYMENT_STATUS_META = {
  PENDING: { label: "Payment Pending", tone: "amber" },
  PAID: { label: "Paid", tone: "green" },
  FAILED: { label: "Payment Failed", tone: "red" },
  REFUNDED: { label: "Refunded", tone: "slate" },
};

export const CANCELLED_BY_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "PATIENT", label: "Patient" },
  { value: "DOCTOR", label: "Doctor" },
];

export const SLOT_DURATIONS = [10, 15, 20, 30, 45, 60];

export const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
];

export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

/** Common answers for the patient's profession. Free text is still accepted via "Other". */
export const PROFESSIONS = [
  "Housewife",
  "Service / Job",
  "Business",
  "Teacher",
  "Doctor",
  "Nurse",
  "Engineer",
  "Student",
  "Farmer",
  "Self Employed",
];

export const YES_NO = ["Yes", "No"];

export const TRIMESTERS = [
  "First Trimester",
  "Second Trimester",
  "Third Trimester",
  "Postpartum",
];

/**
 * Mirrors the transition guards in services/appointments/index.js so the UI only
 * offers actions the backend will actually accept. Keep both sides in sync.
 */
export const getAvailableActions = (appointment) => {
  if (!appointment?.status) return [];

  const { status, startTime } = appointment;
  const startsInFuture = startTime
    ? new Date(startTime).getTime() > Date.now()
    : false;

  const actions = [];

  if (status === "PENDING") actions.push("confirm");
  if (status === "PENDING" || status === "CONFIRMED") actions.push("checkIn");
  if (status === "CONFIRMED" || status === "CHECKED_IN") actions.push("start");
  if (status === "IN_PROGRESS") actions.push("complete");

  if (!["COMPLETED", "CANCELLED", "IN_PROGRESS"].includes(status)) {
    actions.push("reschedule");
  }

  if (!["COMPLETED", "CANCELLED", "NO_SHOW"].includes(status)) {
    actions.push("noShow");
  }

  // Backend also refuses to cancel an appointment that has already started
  if (!["COMPLETED", "CANCELLED"].includes(status) && startsInFuture) {
    actions.push("cancel");
  }

  return actions;
};
