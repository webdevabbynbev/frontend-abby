import { getApi, toQuery } from "./client";
import { normalizeProduct } from "./normalizers/product";

export async function getBrands(params = {}) {
  const json = await getApi(`/brands${toQuery(params)}`);
  console.log("BRANDS API RAW:", json);
  return json.serve.flatMap((group) =>
    Array.isArray(group.children)
      ? group.children.map((b) => ({
          id: b.id,
          brandname: b.name,   // 🔴 NORMALISASI DI SINI
          slug: b.slug,
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