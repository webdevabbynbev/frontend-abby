import api from "@/lib/axios.js";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const BASE_URL = API_BASE ? API_BASE.replace(/\/+$/, "") : "";

function withPrivateBase(config = {}) {
  return BASE_URL ? { ...config, baseURL: BASE_URL } : config;
}

function unwrap(res) {
  return res?.data ?? res;
}

/**
 * GET Wishlist
 */
export async function getWishlist(token) {
  if (!token) throw new Error("Unauthorized");

  const res = await api.get(
    "/wishlists",
    withPrivateBase({
      headers: {
        "Proxy-Authorization": `Bearer ${token}`,
      },
    }),
  );

  return unwrap(res);
}

/**
 * ADD Wishlist
 * payload: { product_id: "1" }
 */
export async function addWishlist(token, payload) {
  if (!token) throw new Error("Unauthorized");
  if (!payload?.product_id) throw new Error("product_id is required");

  const res = await api.post(
    "/wishlists",
    payload,
    withPrivateBase({
      headers: {
        "Proxy-Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }),
  );

  return unwrap(res);
}

// kalau backend kamu pakai DELETE dengan body (paling aman)
export async function removeWishlist(token, payload) {
  if (!token) throw new Error("Unauthorized");
  if (!payload?.product_id) throw new Error("product_id is required");

  const res = await api.delete(
    "/wishlists",
    withPrivateBase({
      headers: {
        "Proxy-Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data: payload,
    }),
  );

  return unwrap(res);
}
