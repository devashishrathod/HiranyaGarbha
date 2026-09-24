module.exports = {
  ROLES: Object.freeze({
    ADMIN: "admin",
    STAFF: "staff",
    USER: "user",
    DOCTOR: "doctor"
  }),

  LOGIN_TYPES: Object.freeze({
    EMAIL: "email",
    MOBILE: "mobile",
    GOOGLE: "google",
    PASSWORD: "password",
    OTHER: "other",
  }),

  PLATFORMS: Object.freeze({
    WEB: "web",
    ANDROID: "android",
    IOS: "ios",
  }),

  CATEGORY_TYPES: Object.freeze({
    PRODUCTS: "product",
    GALLERY: "gallery",
  }),

  SUBSCRIPTION_TYPES: Object.freeze({
    WEEKLY: "weekly",
    MONTHLY: "monthly",
    QUATERLY: "quarterly",
    HALF_YEARLY: "half_yearly",
    YEARLY: "yearly",
  }),

  DURATION_MAP: Object.freeze({
    weekly: 7,
    monthly: 30,
    quarterly: 90,
    half_yearly: 180,
    yearly: 365,
  }),

  SUBSCRIPTION_PLANS: Object.freeze({
    FREE: "free",
    BASIC: "basic",
    PREMIUM: "premium",
    Family: "family",
  }),

  SUBSCRIPTION_TIERS: Object.freeze({
    BASIC: "basic",
    PRO: "pro",
    ELITE: "elite",
    BONUS: "bonus",
  }),

  // Only one live package may exist per core tier; bonus add-ons are many.
  CORE_SUBSCRIPTION_TIERS: Object.freeze(["basic", "pro", "elite"]),

  PLAN_TRIMESTERS: Object.freeze({
    ALL: "all",
    FIRST: "first",
    SECOND: "second",
    THIRD: "third",
  }),

  TRIMESTER_LABELS: Object.freeze({
    all: "All Trimesters",
    first: "First Trimester",
    second: "Second Trimester",
    third: "Third Trimester",
  }),

  // Days of the journey still left when a mother joins in that trimester,
  // which is what a trimester plan actually covers.
  TRIMESTER_DURATION_DAYS: Object.freeze({
    all: 90,
    first: 270,
    second: 180,
    third: 90,
  }),

  PRODUCT_TYPES: Object.freeze({
    GROCERY: "grocery",
    ELECTRONICS: "electronics",
    CLOTHING: "clothing",
  }),

  ZIP_CODE_REGEX_MAP: Object.freeze({
    IN: /^[1-9][0-9]{5}$/, // India (6 digits)
    US: /^\d{5}(-\d{4})?$/, // USA (ZIP or ZIP+4)
    CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, // Canada (A1A 1A1)
    UK: /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i, // United Kingdom (SW1A 1AA)
    AU: /^\d{4}$/, // Australia (4 digits)
    DE: /^\d{5}$/, // Germany
    FR: /^\d{5}$/, // France
    IT: /^\d{5}$/, // Italy
    ES: /^\d{5}$/, // Spain
    BR: /^\d{5}-?\d{3}$/, // Brazil (12345-678 or 12345678)
    RU: /^\d{6}$/, // Russia
  }),

  COUNTRY_NAME_TO_ISO: Object.freeze({
    india: "IN",
    unitedstates: "US",
    usa: "US",
    canada: "CA",
    uk: "UK",
    unitedkingdom: "UK",
    australia: "AU",
    germany: "DE",
    france: "FR",
    italy: "IT",
    spain: "ES",
    brazil: "BR",
    russia: "RU",
  }),

  DEFAULT_IMAGES: Object.freeze({
    PRENATAL_CARE:
      "https://res.cloudinary.com/drvdnqydw/image/upload/f_auto,q_auto/v1/Images/hrhc8iwbjl2qnnqu9kaq?_a=BAMAK+Jw0",
    CATEGORY:
      "https://res.cloudinary.com/drvdnqydw/image/upload/f_auto,q_auto/v1/Images/hrhc8iwbjl2qnnqu9kaq?_a=BAMAK+Jw0",
    SUBCATEGORY:
      "https://res.cloudinary.com/drvdnqydw/image/upload/f_auto,q_auto/v1/Images/zsbowllown6ddeb4jnw0?_a=BAMAK+Jw0",
    PRODUCT:
      "https://res.cloudinary.com/drvdnqydw/image/upload/f_auto,q_auto/v1/Images/zsbowllown6ddeb4jnw0?_a=BAMAK+Jw0",
    BANNER:
      "https://media.istockphoto.com/id/1370679896/photo/the-concept-of-protecting-and-supporting-the-human-fetus.jpg?s=2048x2048&w=is&k=20&c=lWel8Fu0yuIjT20iIYUbdA0WneA26PUfUE-Dp9hpBbs=",
  }),

  /* ------------------------------------------------------------------ */
  /* Notifications — see docs/NOTIFICATIONS.md                           */
  /* ------------------------------------------------------------------ */

  /**
   * Which feed a notification belongs in. Derived from the recipient's
   * `User.role`, so the patient app and the doctor app each query their own
   * feed without the sender having to split a mixed audience.
   */
  NOTIFICATION_AUDIENCE: Object.freeze({
    PATIENT: "PATIENT",
    DOCTOR: "DOCTOR",
    STAFF: "STAFF",
    ADMIN: "ADMIN",
  }),

  NOTIFICATION_CHANNELS: Object.freeze({
    IN_APP: "IN_APP",
    PUSH: "PUSH",
    EMAIL: "EMAIL",
    SMS: "SMS",
    WHATSAPP: "WHATSAPP",
  }),

  /** Channels phase 1 can actually deliver on. SMS/WhatsApp land in phase 4. */
  ACTIVE_NOTIFICATION_CHANNELS: Object.freeze(["IN_APP", "PUSH", "EMAIL"]),

  /**
   * Every kind of notification the platform can send.
   *
   * The appointment and subscription entries are declared now although only
   * `ANNOUNCEMENT` is used in phase 1: the enum is what the `Notification`
   * model validates against, and a type added later without a migration would
   * fail to save on a live database.
   */
  NOTIFICATION_TYPES: Object.freeze({
    // Admin-composed broadcast. Deliberately generic — not tied to any domain,
    // so the same path serves patients, doctors and any role added later.
    ANNOUNCEMENT: "ANNOUNCEMENT",

    // ---- appointments (phase 2), sent to both patient and doctor ----
    APPOINTMENT_BOOKED: "APPOINTMENT_BOOKED",
    APPOINTMENT_CONFIRMED: "APPOINTMENT_CONFIRMED",
    APPOINTMENT_RESCHEDULED: "APPOINTMENT_RESCHEDULED",
    APPOINTMENT_CANCELLED: "APPOINTMENT_CANCELLED",
    APPOINTMENT_REMINDER: "APPOINTMENT_REMINDER",
    APPOINTMENT_COMPLETED: "APPOINTMENT_COMPLETED",
    APPOINTMENT_NO_SHOW: "APPOINTMENT_NO_SHOW",

    // ---- subscriptions (phase 3) ----
    SUBSCRIPTION_ACTIVATED: "SUBSCRIPTION_ACTIVATED",
    SUBSCRIPTION_RENEWED: "SUBSCRIPTION_RENEWED",
    SUBSCRIPTION_EXPIRING: "SUBSCRIPTION_EXPIRING",
    SUBSCRIPTION_EXPIRED: "SUBSCRIPTION_EXPIRED",
    SUBSCRIPTION_CANCELLED: "SUBSCRIPTION_CANCELLED",

    // ---- misc ----
    REPORT_UPLOADED: "REPORT_UPLOADED",
    SYSTEM: "SYSTEM",
  }),

  NOTIFICATION_SEVERITY: Object.freeze({
    INFO: "INFO",
    SUCCESS: "SUCCESS",
    WARNING: "WARNING",
    CRITICAL: "CRITICAL",
  }),

  /** Lifecycle of an admin broadcast. */
  CAMPAIGN_STATUS: Object.freeze({
    SCHEDULED: "SCHEDULED",
    SENDING: "SENDING",
    SENT: "SENT",
    PARTIAL: "PARTIAL",
    FAILED: "FAILED",
    CANCELLED: "CANCELLED",
  }),

  /** How an admin described the audience. Mirrors the compose screen. */
  AUDIENCE_MODES: Object.freeze({
    ROLE: "ROLE",
    SEGMENT: "SEGMENT",
    MANUAL: "MANUAL",
    CSV: "CSV",
  }),

  /** Which profile collection a SEGMENT filter runs against. */
  AUDIENCE_GROUPS: Object.freeze({
    PATIENTS: "PATIENTS",
    DOCTORS: "DOCTORS",
  }),

  NOTIFICATION_LIMITS: Object.freeze({
    /**
     * A broadcast larger than this is almost always a mistargeted filter, so
     * it is refused with the resolved count rather than silently sent.
     */
    MAX_RECIPIENTS_PER_DISPATCH: 10000,
    // FCM HTTP v1 has no multicast endpoint — one request per token — so a
    // broadcast to thousands of devices must not open thousands of sockets.
    PUSH_CONCURRENCY: 25,
    // Gmail SMTP drops connections above roughly this.
    EMAIL_CONCURRENCY: 5,
    // insertMany chunk size, keeps a single write well under the 16MB BSON cap.
    INSERT_BATCH_SIZE: 1000,
    // How often the scheduler sweeps for due campaigns.
    SCHEDULER_INTERVAL_MS: 60000,
  }),

  NOTIFICATION_DEFAULTS: Object.freeze({
    maxTitleLength: 150,
    maxBodyLength: 2000,
  }),
};
