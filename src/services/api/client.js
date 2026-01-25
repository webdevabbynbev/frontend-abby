const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const normalizedBase = API_BASE.replace(/\/+$/, "").replace(/\/api$/i, "");
const BASE = normalizedBase
  ? normalizedBase.endsWith("/")
    ? normalizedBase
    : `${normalizedBase}/`
  : "";

export async function getApi(path, options = {}) {
  console.log("API_BASE:", BASE);
  if (!BASE) throw new Error("NEXT_PUBLIC_API_URL belum di-set. Cek .env");

  const cleanPath = String(path).replace(/^\/+/, "");
  const url = path.startsWith("http")
    ? path
    : new URL(cleanPath, BASE).toString();

  // const isGet = !options.method || options.method === "GET";

  const res = await fetch(url, {
  ...options,

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  },

  ...(typeof window === "undefined" && { credentials: "include" }),
});

  const contentType = res.headers.get("content-type");
  let data = {};

  if (contentType?.includes("application/json")) {
    data = await res.json().catch(() => ({}));
  } else {
    const text = await res.text().catch(() => "");
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed: ${res.status}`);
  }

  return data;
}

export function toQuery(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    usp.set(k, String(v));
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}
