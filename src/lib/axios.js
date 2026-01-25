import axios from "axios";

const api = axios.create({
  baseURL: "/",          // ⬅️ WAJIB
  withCredentials: true, // aman untuk HttpOnly cookie
});

api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers.Accept = "application/json";

  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;

  if (!isFormData && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

export default api;