import { slugify } from "./slugify";
import { getImageUrl } from "./getImageUrl";

export function normalizeCardProduct(raw) {
  if (!raw) return null;

  const source = raw.product ?? raw;

  const variants = Array.isArray(source.variants) ? source.variants : [];
  const variantPrices = variants
    .map((variant) => Number(variant?.price))
    .filter((value) => Number.isFinite(value) && value > 0);

  const lowestVariantPrice = variantPrices.length
    ? Math.min(...variantPrices)
    : null;

  const name =
    source.name ?? source.productName ?? source.title ?? "Unnamed Product";

  const rawPath = typeof source.path === "string" ? source.path : "";
  const pathParts = rawPath.split("/").filter(Boolean);

  const brandName =
    (source.brand && source.brand.name) ||
    (typeof source.brand === "string" ? source.brand : "") ||
    source.brandName ||
    "";

  const brandSlugCandidate =
    (source.brand && source.brand.slug) ||
    source.brand_slug ||
    source.brandSlug ||
    (pathParts.length ? pathParts[0] : "") ||
    brandName;

  const productSlugCandidate =
    source.slug ||
    (pathParts.length ? pathParts[pathParts.length - 1] : "") ||
    name;

  const rawImagePath =
    source.image ||
    (Array.isArray(source.images) ? source.images[0] : null) ||
    (Array.isArray(source.medias) ? source.medias[0]?.url : null);

  return {
    id: source.id ?? source._id ?? crypto.randomUUID(),
    name,

    price: Number(
      lowestVariantPrice ??
        source.price ??
        source.basePrice ??
        source.realprice ??
        source.salePrice ??
        (Array.isArray(source.prices) ? source.prices[0] : undefined) ??
        0
    ),

    compareAt: Number(
      source.realprice ??
        source.oldPrice ??
        (Array.isArray(source.prices) ? source.prices[1] : undefined) ??
        NaN
    ),

    image: getImageUrl(rawImagePath), // STRING URL ONLY
    rating: Number(source.rating ?? source.stars ?? 0),

    brand: brandName,
    brandSlug: slugify(brandSlugCandidate),

    category: source.category ?? source.categoryName ?? "",
    slug: slugify(productSlugCandidate),

    sale: Boolean(
      source.sale ?? source.is_flash_sale ?? source.is_flashsale
    ),
  };
}
