import axios from "axios";

const baseURL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_PROD_BACKEND_URL
    : import.meta.env.VITE_LOCAL_BACKEND_URL;

const axiosInstance = axios.create({ baseURL });

axiosInstance.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else config.headers["Content-Type"] = "application/json";
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.clear();
      // localStorage.removeItem("token");
      // localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
