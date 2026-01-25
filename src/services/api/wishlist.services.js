import { getApi } from "./client";

/**
 * GET Wishlist
 */
export async function getWishlist(token) {
  if (!token) throw new Error("Unauthorized");

  return getApi("/wishlist", {
    headers: {
      "Proxy-Authorization": `Bearer ${token}`,
    },
  });
}

/**
 * ADD Wishlist
 * payload: { product_id: "1" }
 */
export async function addWishlist(token, payload) {
  if (!token) throw new Error("Unauthorized");
  if (!payload?.product_id) throw new Error("product_id is required");

  return getApi("/wishlist", {
    method: "POST",
    headers: {
      "Proxy-Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
}

// kalau backend kamu pakai DELETE dengan body (paling aman)
export async function removeWishlist(token, payload) {
  if (!token) throw new Error("Unauthorized");
  if (!payload?.product_id) throw new Error("product_id is required");

  return getApi("/wishlist", {
    method: "DELETE",
    headers: {
      "Proxy-Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
}