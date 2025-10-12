import { DataBrand, BevPick } from "@/data";
import { slugify } from "@/utils";
export function getBrand(slug) {
  // 1) Cari brand dengan prioritas ke field `slug`
  const brand = DataBrand.find(
    (b) => (b.slug ?? slugify(b.brandname)) === slug
  );
  if (!brand) return null;

  const brandSlug = brand.slug ?? slugify(brand.brandname);

  // 2) Ambil produk yang slug brand-nya cocok (fallback slugify nama brand di produk)
  const rawProducts = BevPick.filter(
    (p) => (p.brandSlug ?? slugify(p.brand)) === brandSlug
  );

  // 3) Normalisasi shape supaya sesuai dengan yang dibaca card
  const products = rawProducts.map((p, idx) => ({
    id: p.id ?? `${brandSlug}-${idx}`,
    name: p.name ?? p.productName ?? p.title ?? "Unnamed Product",
    price: p.price ?? p.prices?.[0] ?? 0,
    image: p.image ?? p.images?.[0] ?? null,
    rating: p.rating ?? p.stars ?? 0,
    brand: brand.brandname,
    slug: p.slug ?? slugify(p.name ?? p.productName ?? `item-${idx}`),
    category:
      p.category ??
      p.categoryName ??
      p.cat ??
      p.type ?? // kalau kamu pakai type
      "Uncategorized",
  }));

  return { ...brand, products };
}
