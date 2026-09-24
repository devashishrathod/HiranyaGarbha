const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    PROFILE: "/users/get",
  },
  USER: {
    GET_PROFILE: "/users/get",
    UPDATE_PROFILE: "/users/update",
  },
  DASHBOARD: {
    GET_DASHBOARD: "/dashboard",
  },
  CATEGORIES: {
    CREATE: "/categories/create",
    UPDATE: "/categories/update/:id",
    DELETE: "/categories/delete/:id",
    GET_ALL: "/categories/getAll",
    GET_ONE: "/categories/get/:id",
  },
  SUBCATEGORIES: {
    CREATE: "/subCategories/:categoryId/create",
    UPDATE: "/subCategories/update/:id",
    DELETE: "/subCategories/delete/:id",
    GET_ALL: "/subCategories/getAll",
    GET_ONE: "/subCategories/get/:id",
  },
  BANNERS: {
    CREATE: "/banners/create",
    UPDATE: "/banners/update/:id",
    DELETE: "/banners/delete",
    GET_ALL: "/banners/getAll",
    GET_ONE: "/banners/get/:id",
  },
  CONTACT_US: {
    GET_ALL: "/contact-us/getAll",
    GET_ONE: "/contact-us/get/:id",
    UPDATE: "/contact-us/update/:id",
    DELETE: "/contact-us/delete/:id",
  },
  PRENATAL_CARES: {
    CREATE: "/prenatal-cares/create",
    GET_ALL: "/prenatal-cares/getAll",
    GET_ONE: "/prenatal-cares/get/:id",
    UPDATE: "/prenatal-cares/update/:id",
    DELETE: "/prenatal-cares/delete/:id",
  },
  TERMS_AND_CONDITIONS: {
    CREATE: "/terms-and-conditions/create",
    GET_ALL: "/terms-and-conditions/getAll",
    GET_ONE: "/terms-and-conditions/get/:id",
    UPDATE: "/terms-and-conditions/update/:id",
    DELETE: "/terms-and-conditions/delete/:id",
  },
  PRIVACY_AND_POLICIES: {
    CREATE: "/privacy-and-policies/create",
    GET_ALL: "/privacy-and-policies/getAll",
    GET_ONE: "/privacy-and-policies/get/:id",
    UPDATE: "/privacy-and-policies/update/:id",
    DELETE: "/privacy-and-policies/delete/:id",
  },
  SUBSCRIPTIONS: {
    CREATE: "/subscriptions/add",
    GET_ALL: "/subscriptions/getAll",
    GET_PACKAGES: "/subscriptions/packages",
    GET_ONE: "/subscriptions/get/:id",
    UPDATE: "/subscriptions/update/:id",
    DELETE: "/subscriptions/delete/:id",
  },

  /*
   * Heads up on the id these take:
   *  - GET_PROFILE / UPDATE_PROFILE expect the linked User._id
   *  - DELETE accepts either the Patient._id or the User._id
   *  - appointment endpoints expect the Patient._id / Doctor._id
   */
  PATIENTS: {
    GET_ALL: "/patients/get-all",
    GET_PROFILE: "/patients/profile", // ?userId=<User._id>
    UPDATE_PROFILE: "/patients/update-profile", // ?patientId=<User._id>
    CREATE: "/patients/create",
    DELETE: "/patients/delete/:id",
  },

  DOCTORS: {
    GET_ALL: "/doctors/get-all",
    GET_PROFILE: "/doctors/profile", // ?doctorId=<User._id>
    UPDATE_PROFILE: "/doctors/update-profile", // ?doctorId=<User._id>
    CREATE: "/doctors/create",
    DELETE: "/doctors/delete/:id",
  },

  DOCTOR_AVAILABILITY: {
    GET: "/doctorAvailability/get/:doctorId", // Doctor._id
    ADD_OR_UPDATE: "/doctorAvailability/add-or-update",
  },

  /*
   * See server/docs/NOTIFICATIONS.md.
   *
   * AUDIENCE_COUNT is a POST because a pasted-contacts audience carries a list
   * of email addresses, which does not belong in a query string. CREATE
   * answers 202: the campaign row exists but delivery is still running in the
   * background, which is why the history list re-polls while anything is in
   * the SENDING state.
   */
  NOTIFICATIONS: {
    AUDIENCE_COUNT: "/notifications/audience/count",
    CREATE: "/notifications/campaigns",
    GET_ALL: "/notifications/campaigns",
    STATS: "/notifications/campaigns/stats",
    GET_ONE: "/notifications/campaigns/:id",
    CANCEL: "/notifications/campaigns/:id/cancel",
    HEALTH: "/notifications/health",

    TEMPLATES: {
      GET_ALL: "/notifications/templates",
      CREATE: "/notifications/templates",
      UPDATE: "/notifications/templates/:id",
      DELETE: "/notifications/templates/:id",
    },

    // The logged-in user's own bell feed.
    MY: {
      LIST: "/notifications/my",
      UNREAD_COUNT: "/notifications/my/unread-count",
      READ: "/notifications/my/:id/read",
      READ_ALL: "/notifications/my/read-all",
      DELETE: "/notifications/my/:id",
    },

    // Called by the mobile app after login / on token refresh, and on logout.
    DEVICE: {
      REGISTER: "/notifications/device/register",
      UNREGISTER: "/notifications/device/unregister",
    },
  },

  APPOINTMENTS: {
    GET_ALL: "/appointments/get-all",
    STATS: "/appointments/stats",
    BOOK: "/appointments/book",
    SLOTS: "/appointments/slots", // ?doctorId=<Doctor._id>&appointmentDate=
    GET_ONE: "/appointments/:appointmentId",
    CONFIRM: "/appointments/:appointmentId/confirm",
    CANCEL: "/appointments/:appointmentId/cancel",
    RESCHEDULE: "/appointments/:appointmentId/reschedule",
    CHECK_IN: "/appointments/:appointmentId/check-in",
    START: "/appointments/:appointmentId/start",
    COMPLETE: "/appointments/:appointmentId/complete",
    NO_SHOW: "/appointments/:appointmentId/no-show",
    BY_DOCTOR: "/appointments/doctor/:doctorId",
    DOCTOR_TODAY: "/appointments/doctor/:doctorId/today",
    BY_PATIENT: "/appointments/patient/:patientId",
  },
};

export default API_ENDPOINTS;
