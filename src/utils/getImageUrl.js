const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

const FILE_HOST = API_BASE
  ? API_BASE.replace(/\/api(\/v\d+)?\/?$/i, "")
  : "";

const PLACEHOLDER =
  "https://d2ntedlnuwws1k.cloudfront.net/Products/abby-product-placeholder-image.png";

export function getImageUrl(path) {
  if (!path) return PLACEHOLDER;

  // absolute URL
  if (typeof path === "string" && /^https?:\/\//i.test(path)) {
    return path;
  }

  // relative path dari backend
  if (typeof path === "string" && FILE_HOST) {
    return `${FILE_HOST}/${path.replace(/^\/+/, "")}`;
  }

  return PLACEHOLDER;
}
