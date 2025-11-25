import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  restoreSession,
} from "./authSlice";
import axiosInstance from "../../api/axiosInstance";
import API_ENDPOINTS from "../../api/apiEndpoint";

// Login action
export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const response = await axiosInstance.post(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    const { token, user } = response.data.data;
    // Set token in axios headers for subsequent requests
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    dispatch(loginSuccess({ token, user }));
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Login failed";
    dispatch(loginFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Logout action
export const logoutUser = () => async (dispatch) => {
  try {
    // Clear token from axios headers
    delete axiosInstance.defaults.headers.common["Authorization"];

    await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
    dispatch(logout());
  } catch (error) {
    console.error("Logout error:", error);
    // Even if the API call fails, we still want to clear local state
    dispatch(logout());
  }
};

// Get user profile
export const getUserProfile = () => async (dispatch) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTH.PROFILE);
    dispatch(
      loginSuccess({
        token: localStorage.getItem("token"),
        user: response.data,
      })
    );
    return { success: true };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch profile";
    return { success: false, error: errorMessage };
  }
};

// Check and restore authentication on page reload
export const checkAuth = () => async (dispatch) => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  console.log("token", token);

  if (token && userStr) {
    // Set authorization header for all future requests
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    try {
      // First, restore from localStorage to avoid flickering UI
      const user = JSON.parse(userStr);
      dispatch(restoreSession({ token, user }));

      // Then verify token with backend and get fresh user data
      const response = await axiosInstance.get(API_ENDPOINTS.AUTH.PROFILE);
      dispatch(
        loginSuccess({
          token: token,
          user: response.data,
        })
      );
      return { success: true };
    } catch (error) {
      console.error("Token validation failed:", error);
      // If token is invalid, clear authentication
      dispatch(logout());
      return { success: false, error: "Authentication expired" };
    }
  }
  return { success: false, error: "No token found" };
};
