import axios from "axios";

const baseURL = "http://localhost:8080/hiranyagarbha";
//const baseURL = "https://hiranyagarbha.onrender.com/hiranyagarbha";

// const axiosInstance = axios.create({
//   baseURL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });
const axiosInstance = axios.create({
  baseURL,
});
// JSON header sirf tab lagao jab FormData NA ho
axiosInstance.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"]; // 👈 MOST IMPORTANT
  } else {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

// Request interceptor to add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
