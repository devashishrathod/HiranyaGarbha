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
   * Not built on the server yet — the notification centre runs on mock data
   * (components/notifications/notificationsMock.js) until these exist. Paths
   * are written the way the rest of the API names things so wiring them up is
   * a one-line swap per call.
   */
  NOTIFICATIONS: {
    SEND: "/notifications/send",
    GET_ALL: "/notifications/get-all",
    GET_ONE: "/notifications/get/:id",
    CANCEL_SCHEDULED: "/notifications/cancel/:id",
    AUDIENCE_COUNT: "/notifications/audience-count",
    TEMPLATES: {
      GET_ALL: "/notifications/templates/getAll",
      CREATE: "/notifications/templates/create",
      UPDATE: "/notifications/templates/update/:id",
      DELETE: "/notifications/templates/delete/:id",
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
