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
 *
 * `available: false` marks a channel the server cannot deliver on yet. It is
 * still listed rather than hidden, because an admin who expects SMS should see
 * that it is coming and why it is off — a missing option only prompts "where
 * did SMS go". The server enforces this too (`ACTIVE_NOTIFICATION_CHANNELS`),
 * so a hand-crafted request cannot slip past the greyed-out button.
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
    available: true,
  },
  [CHANNELS.IN_APP]: {
    label: "In-app",
    tone: "purple",
    hint: "Shows in the app's notification bell",
    requires: null,
    titleLimit: 80,
    bodyLimit: 400,
    available: true,
  },
  [CHANNELS.EMAIL]: {
    label: "Email",
    tone: "teal",
    hint: "Subject line plus a longer body",
    requires: "email",
    requiresLabel: "an email address",
    titleLimit: 120,
    bodyLimit: 5000,
    available: true,
  },
  [CHANNELS.SMS]: {
    label: "SMS",
    tone: "amber",
    hint: "Needs a DLT-approved sender ID",
    requires: "phone",
    requiresLabel: "a mobile number",
    bodyLimit: 480,
    available: false,
    unavailableNote: "Coming with the SMS provider setup",
  },
  [CHANNELS.WHATSAPP]: {
    label: "WhatsApp",
    tone: "green",
    hint: "Needs an approved Meta template",
    requires: "whatsappNumber",
    requiresLabel: "a WhatsApp number",
    bodyLimit: 1024,
    available: false,
    unavailableNote: "Coming with the WhatsApp Business setup",
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

    // Each class excludes "." so the parts cannot overlap and backtrack.
    if (/^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$/.test(token)) {
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

/**
 * Turn the compose screen's audience state into the declarative target the
 * server expects (`server/helpers/notifications/resolveAudience.js`).
 *
 * ⚠️ Only the keys for the active mode are sent. The server validates the
 * audience per mode and **forbids** the others, so shipping an empty `roles`
 * array alongside a MANUAL send is a 422 rather than a harmless extra field.
 */
export const buildAudienceTarget = (state) => {
  switch (state.mode) {
    case AUDIENCE_MODES.ROLE:
      return {
        mode: state.mode,
        roles: state.groups.map((key) => getAudienceGroup(key).role),
      };

    case AUDIENCE_MODES.SEGMENT:
      return {
        mode: state.mode,
        segment: {
          group: state.segmentGroup,
          // "" means "active and inactive" — the key is omitted entirely so
          // the server does not filter on it.
          ...(state.segment.status !== ""
            ? { isActive: state.segment.status === "true" }
            : {}),
          ...(state.segment.search ? { search: state.segment.search } : {}),
          ...(state.segment.fromDate ? { fromDate: state.segment.fromDate } : {}),
          ...(state.segment.toDate ? { toDate: state.segment.toDate } : {}),
        },
      };

    case AUDIENCE_MODES.MANUAL:
      return {
        mode: state.mode,
        /**
         * The picker lists profile rows, so `_id` is a Patient or Doctor id.
         * Notifications are addressed to the **account**, which is `userId` —
         * sending the profile id would resolve to nobody and the campaign
         * would report an empty audience with no obvious cause.
         */
        userIds: state.selected.map((person) => person.userId).filter(Boolean),
      };

    case AUDIENCE_MODES.CSV: {
      const parsed = parseRecipientList(state.csv);
      return {
        mode: state.mode,
        contacts: { emails: parsed.emails, phones: parsed.phones },
      };
    }

    default:
      return { mode: state.mode };
  }
};

/** True when the audience state has enough in it to be worth asking about. */
export const hasAudienceInput = (state) => {
  switch (state.mode) {
    case AUDIENCE_MODES.ROLE:
      return state.groups.length > 0;
    case AUDIENCE_MODES.SEGMENT:
      return Boolean(state.segmentGroup);
    case AUDIENCE_MODES.MANUAL:
      return state.selected.some((person) => person.userId);
    case AUDIENCE_MODES.CSV:
      return parseRecipientList(state.csv).total > 0;
    default:
      return false;
  }
};

/** Placeholders the backend substitutes per recipient */
export const MERGE_TAGS = [
  { tag: "{{name}}", label: "Recipient name" },
  { tag: "{{firstName}}", label: "First name" },
  { tag: "{{trimester}}", label: "Current trimester" },
  { tag: "{{doctor}}", label: "Primary doctor" },
];
