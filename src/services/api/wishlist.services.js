import { cookies } from "next/headers";
import { getApi } from "./client";

function getAuthToken() {
  console.log(cookies().get("auth_token")?.value);
  return cookies().get("auth_token")?.value;
}

/**
 * GET Wishlist
 */
export async function getWishlist() {
  const token = getAuthToken();
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
export async function addWishlist(payload) {
  const token = getAuthToken();
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
export async function removeWishlist(payload) {
  const token = getAuthToken();
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