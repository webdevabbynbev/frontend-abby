import axios from "axios";

/**
 * Axios instance FINAL
 * - Semua request lewat Next.js (/api/v1)
 * - Cookie HttpOnly aman
 * - Rewrite handle proxy ke backend (3333)
 */
const api = axios.create({
  baseURL: "/api/v1",     // ⬅️ WAJIB
  withCredentials: true, // ⬅️ WAJIB untuk HttpOnly cookie
});

/**
 * Request interceptor
 * - Set header default
 * - Tidak ada redirect baseURL
 * - Tidak ada direct hit backend
 */
api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    config.headers.Accept = "application/json";

    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (!isFormData && !config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * (Optional tapi disarankan)
 * Response interceptor untuk debug auth
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      console.warn("[API] 401 Unauthorized");
    }
    return Promise.reject(error);
  }
);

export default api;
