import { getApi, toQuery } from "./client";
import { normalizeProduct } from "./normalizers/product";

export async function getBrands(params = {}) {
  const json = await getApi(`/brands${toQuery(params)}`);
  const groups = Array.isArray(json?.serve) ? json.serve : [];
  return groups.flatMap((group) =>
    Array.isArray(group.children)
      ? group.children.map((b) => ({
          id: b.id,
          brandname: b.name,
          slug: b.slug,
          logo: b.logo || b.logoPublicId || b.logo_public_id || b.logoUrl || null,
          isPopular: Boolean(b.isPopular ?? b.popular ?? b.featured),
        }))
      : []
  );
}

export async function getBrandBySlug(slug) {
  const safeSlug = encodeURIComponent(String(slug || ""));
  const json = await getApi(`/brands/${safeSlug}`);

  const brand = json?.serve || null;
  if (brand?.products) {
    brand.products = brand.products.map(normalizeProduct).filter(Boolean);
  }
  return brand;
}