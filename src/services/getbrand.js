import { DataBrand, BevPick } from "@/data";
import { slugify } from "@/utils/slugify";

// ambil brand berdasarkan slug
export function getBrand(slug) {
  const brand = DataBrand.find((b) => slugify(b.brandname) === slug);
  if (!brand) return null;

  // ambil produk berdasarkan brand
  const products = BevPick.filter((p) => slugify(p.brand) === slug);

  return { ...brand, products };
}
