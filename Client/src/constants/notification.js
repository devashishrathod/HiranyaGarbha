/**
 * Notification centre enums.
 *
 * Nothing here is wired to the backend yet — once the notifications API lands,
 * these keys are what the client will post, so keep them in sync with whatever
 * enum the server ends up declaring (models/Notification.js).
 */

/* ------------------------------------------------------------------ */
/* Channels                                                            */
/* ------------------------------------------------------------------ */

export const CHANNELS = Object.freeze({
  PUSH: "PUSH",
  IN_APP: "IN_APP",
  EMAIL: "EMAIL",
  SMS: "SMS",
  WHATSAPP: "WHATSAPP",
});

/**
 * `requires` names the recipient field the channel cannot deliver without, so
 * the audience summary can warn about people who would silently be skipped.
 */
export const CHANNEL_META = {
  [CHANNELS.PUSH]: {
    label: "Push",
    tone: "blue",
    hint: "Mobile push notification via FCM",
    requires: "fcmToken",
    requiresLabel: "a registered device",
    titleLimit: 65,
    bodyLimit: 240,
  },
  [CHANNELS.IN_APP]: {
    label: "In-app",
    tone: "purple",
    hint: "Shows in the app's notification bell",
    requires: null,
    titleLimit: 80,
    bodyLimit: 400,
  },
  [CHANNELS.EMAIL]: {
    label: "Email",
    tone: "teal",
    hint: "Subject line plus a longer body",
    requires: "email",
    requiresLabel: "an email address",
    titleLimit: 120,
    bodyLimit: 5000,
  },
  [CHANNELS.SMS]: {
    label: "SMS",
    tone: "amber",
    hint: "Plain text, billed per 160-character part",
    requires: "phone",
    requiresLabel: "a mobile number",
    bodyLimit: 480,
  },
  [CHANNELS.WHATSAPP]: {
    label: "WhatsApp",
    tone: "green",
    hint: "Plain text, needs an approved template",
    requires: "whatsappNumber",
    requiresLabel: "a WhatsApp number",
    bodyLimit: 1024,
  },
};

export const CHANNEL_ORDER = [
  CHANNELS.PUSH,
  CHANNELS.IN_APP,
  CHANNELS.EMAIL,
  CHANNELS.SMS,
  CHANNELS.WHATSAPP,
];

/** Channels that share the title + body + media composer */
export const RICH_CHANNELS = [CHANNELS.PUSH, CHANNELS.IN_APP];

/** Channels that only carry plain text */
export const TEXT_CHANNELS = [CHANNELS.SMS, CHANNELS.WHATSAPP];

/* ------------------------------------------------------------------ */
/* Audience                                                            */
/* ------------------------------------------------------------------ */

export const AUDIENCE_MODES = Object.freeze({
  ROLE: "ROLE",
  SEGMENT: "SEGMENT",
  MANUAL: "MANUAL",
  CSV: "CSV",
});

export const AUDIENCE_MODE_META = {
  [AUDIENCE_MODES.ROLE]: {
    label: "By role",
    description: "Send to everyone in one or more roles",
  },
  [AUDIENCE_MODES.SEGMENT]: {
    label: "By filter",
    description: "Everyone matching a saved set of filters",
  },
  [AUDIENCE_MODES.MANUAL]: {
    label: "Pick from list",
    description: "Hand-pick individual recipients",
  },
  [AUDIENCE_MODES.CSV]: {
    label: "Paste list",
    description: "Paste numbers or emails from a sheet",
  },
};

/**
 * The four audiences an admin thinks in. `listable` marks the ones that already
 * have a `/get-all` endpoint — staff and admins can only be targeted in bulk
 * until a users list endpoint exists.
 */
export const AUDIENCE_GROUPS = [
  {
    key: "PATIENTS",
    label: "Patients",
    role: "user",
    tone: "pink",
    listable: true,
    description: "App customers — mothers and families",
  },
  {
    key: "DOCTORS",
    label: "Doctors",
    role: "doctor",
    tone: "teal",
    listable: true,
    description: "Onboarded doctors and consultants",
  },
  {
    key: "STAFF",
    label: "Staff",
    role: "staff",
    tone: "amber",
    listable: false,
    description: "Clinic and reception staff",
  },
  {
    key: "ADMINS",
    label: "Admins",
    role: "admin",
    tone: "purple",
    listable: false,
    description: "Panel administrators",
  },
];

export const LISTABLE_GROUPS = AUDIENCE_GROUPS.filter((group) => group.listable);

export const getAudienceGroup = (key) =>
  AUDIENCE_GROUPS.find((group) => group.key === key) || AUDIENCE_GROUPS[0];

/**
 * The list endpoints validate their query with Joi and reject unknown keys, so
 * the segment builder stays inside the params they actually accept.
 */
export const SEGMENT_STATUS_OPTIONS = [
  { value: "", label: "Active and inactive" },
  { value: "true", label: "Active only" },
  { value: "false", label: "Inactive only" },
];

export const DEFAULT_SEGMENT = {
  status: "true",
  search: "",
  fromDate: "",
  toDate: "",
};

/** Starting state for the audience builder */
export const EMPTY_AUDIENCE = {
  mode: AUDIENCE_MODES.ROLE,
  groups: ["PATIENTS"],
  segmentGroup: "PATIENTS",
  segment: DEFAULT_SEGMENT,
  manualGroup: "PATIENTS",
  selected: [],
  csv: "",
};

/* ------------------------------------------------------------------ */
/* Scheduling                                                          */
/* ------------------------------------------------------------------ */

export const SCHEDULE_MODES = Object.freeze({
  NOW: "NOW",
  LATER: "LATER",
});

/* ------------------------------------------------------------------ */
/* Delivery status                                                     */
/* ------------------------------------------------------------------ */

export const DELIVERY_STATUS = Object.freeze({
  SCHEDULED: "SCHEDULED",
  SENDING: "SENDING",
  SENT: "SENT",
  PARTIAL: "PARTIAL",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
});

export const DELIVERY_STATUS_META = {
  [DELIVERY_STATUS.SCHEDULED]: { label: "Scheduled", tone: "blue" },
  [DELIVERY_STATUS.SENDING]: { label: "Sending", tone: "amber" },
  [DELIVERY_STATUS.SENT]: { label: "Sent", tone: "green" },
  [DELIVERY_STATUS.PARTIAL]: { label: "Partly delivered", tone: "amber" },
  [DELIVERY_STATUS.FAILED]: { label: "Failed", tone: "red" },
  [DELIVERY_STATUS.CANCELLED]: { label: "Cancelled", tone: "slate" },
};

export const DELIVERY_STATUS_OPTIONS = Object.entries(DELIVERY_STATUS_META).map(
  ([value, meta]) => ({ value, label: meta.label }),
);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Carriers bill SMS in 160-character parts (153 once a message is split) */
export const smsParts = (text = "") => {
  const length = text.length;
  if (!length) return 0;
  return length <= 160 ? 1 : Math.ceil(length / 153);
};

/**
 * Splits pasted text on commas, semicolons, spaces and newlines, then sorts the
 * entries into e-mails, phone numbers and whatever could not be read.
 */
export const parseRecipientList = (raw = "") => {
  const tokens = raw
    .split(/[\s,;]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const emails = [];
  const phones = [];
  const invalid = [];
  const seen = new Set();

  tokens.forEach((token) => {
    const key = token.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(token)) {
      emails.push(token.toLowerCase());
      return;
    }

    const digits = token.replace(/[^\d]/g, "");
    if (digits.length >= 10 && digits.length <= 15) {
      phones.push(digits);
      return;
    }

    invalid.push(token);
  });

  return { emails, phones, invalid, total: emails.length + phones.length };
};

/** Placeholders the backend is expected to substitute per recipient */
export const MERGE_TAGS = [
  { tag: "{{name}}", label: "Recipient name" },
  { tag: "{{firstName}}", label: "First name" },
  { tag: "{{trimester}}", label: "Current trimester" },
  { tag: "{{doctor}}", label: "Primary doctor" },
];
