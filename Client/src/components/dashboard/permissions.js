export const PERMISSIONS = Object.freeze({
  DASHBOARD_VIEW: "dashboard.view",
  DASHBOARD_ALL: "dashboard.all",
  USERS_VIEW: "users.view",
  USERS_MANAGE: "users.manage",
  APPOINTMENTS_VIEW: "appointments.view",
  APPOINTMENTS_MANAGE: "appointments.manage",
  SESSIONS_VIEW: "sessions.view",
  SESSIONS_MANAGE: "sessions.manage",
  CONTENT_VIEW: "content.view",
  CONTENT_MANAGE: "content.manage",
  PRODUCTS_VIEW: "products.view",
  PRODUCTS_MANAGE: "products.manage",
  ENQUIRIES_VIEW: "enquiries.view",
  ENQUIRIES_MANAGE: "enquiries.manage",
  ANALYTICS_VIEW: "analytics.view",
});

const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

export const getUserRole = (user) => {
  const role = user?.role;
  if (!role || typeof role !== "string") return "";
  return role.toLowerCase();
};

export const hasPermission = (user, permission) => {
  const role = getUserRole(user);

  if (role === "admin") return true;

  const permissions = normalizeList(user?.permissions);
  const access = normalizeList(user?.access);
  const merged = new Set([...permissions, ...access]);

  if (role === "subadmin") {
    if (merged.size > 0) return merged.has(permission);
    return permission !== PERMISSIONS.USERS_MANAGE;
  }

  if (merged.size > 0) return merged.has(permission);

  return false;
};
