// client.js

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

// ✅ Jangan hapus "/api" karena backend kamu pakai "/api/v1".
// ✅ Cukup rapikan trailing slash dan pastikan BASE selalu diakhiri "/".
const BASE = API_BASE ? API_BASE.replace(/\/+$/, "") + "/" : "";

const PRIVATE_PATH_PATTERNS = [
  /^\/api\/v1\/auth(\/|$)/i,
  /^\/api\/v1\/profile(\/|$)/i,
  /^\/api\/v1\/addresses(\/|$)/i,
  /^\/api\/wishlists(\/|$)/i,
  /^\/addresses(\/|$)/i,
  /^\/admin(\/|$)/i,
  /^\/cart(\/|$)/i,
  /^\/profile(\/|$)/i,
  /^\/ramadan(\/|$)/i,
  /^\/transaction(\/|$)/i,
  /^\/vouchers\/(my|[^/]+\/claim)(\/|$)/i,
  /^\/wishlists(\/|$)/i,
];

function assertPublicPath(path) {
  const rawPath = String(path || "");
  const normalizedPath = rawPath.startsWith("http")
    ? new URL(rawPath).pathname
    : `/${rawPath.replace(/^\/+/, "")}`;

  const matched = PRIVATE_PATH_PATTERNS.find((pattern) =>
    pattern.test(normalizedPath),
  );

  if (matched) {
    throw new Error(
      `Endpoint ${normalizedPath} bersifat private. Gunakan axios (authenticated client) untuk request ini.`,
    );
  }
}

export async function getApi(path, options = {}) {
  // console.log("API_BASE:", BASE);

  if (!BASE) {
    throw new Error(
      "NEXT_PUBLIC_API_URL belum di-set. Set di Railway FE Variables, contoh: https://backend-abby-stagging.up.railway.app/api/v1",
    );
  }
  assertPublicPath(path);

  const cleanPath = String(path).replace(/^\/+/, "");
  const url = path.startsWith("http")
    ? path
    : new URL(cleanPath, BASE).toString();

  // console.log("[getApi] url =", url);

  const res = await fetch(url, {
    ...options,
    credentials: "include", // ⬅️ WAJIB DI SEMUA KONDISI
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  // ✅ Baca body sekali (pakai text), lalu parse jika JSON
  const contentType = res.headers.get("content-type") || "";
  const rawText = await res.text().catch(() => "");

  let data = {};
  if (rawText && contentType.includes("application/json")) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = {};
    }
  } else if (rawText) {
    // kalau ternyata JSON tapi content-type salah
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { message: rawText };
    }
  }

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.error ||
      `Request failed: ${res.status} ${res.statusText} (${url})`;
    throw new Error(msg);
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
