import axios from "axios";

const api = axios.create({
  baseURL: "/", // ⬅️ WAJIB
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

  // ✅ Untuk endpoint OAuth yang panggil backend langsung (bukan proxy)
  // Ganti /api/* dengan full backend URL
  if (
    config.url?.startsWith("/api/v1/auth/register-google") ||
    config.url?.startsWith("/api/v1/auth/login-google")
  ) {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ||
      "http://localhost:3333";
    config.baseURL = backendUrl;
    config.url = config.url.replace(/^\//, ""); // remove leading slash
  }

  return config;
});

export default api;
