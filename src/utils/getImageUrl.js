import api from "@/lib/axios";

const API_BASE =
  api.defaults.baseURL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "";

const FILE_HOST = API_BASE.replace(/\/api(\/v\d+)?\/?$/i, "");

const PLACEHOLDER =
  "https://d2ntedlnuwws1k.cloudfront.net/Products/abby-product-placeholder-image.png";

export function getImageUrl(path) {
  if (!path) return PLACEHOLDER;

  // kalau sudah absolute
  if (typeof path === "string" && /^https?:\/\//i.test(path)) {
    return path;
  }

  // relative path
  if (typeof path === "string") {
    return `${FILE_HOST}/${path.replace(/^\/+/, "")}`;
  }

  return PLACEHOLDER;
}
