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
    GET_ONE: "/subscriptions/get/:id",
    UPDATE: "/subscriptions/update/:id",
    DELETE: "/subscriptions/delete/:id",
  },
};

export default API_ENDPOINTS;
