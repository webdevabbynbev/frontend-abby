import { NextResponse } from "next/server";
import { searchProductsServer } from "@/services/product/search.server";
import { getProducts } from "@/services/api/product.services";
import { getBrands } from "@/services/api/brands.services";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const needle = q.toLowerCase();
    const len = needle.length;
    const limit = Number(searchParams.get("limit") || 10);

    if (!q) {
      return NextResponse.json({ brands: [], data: [] });
    }

    /* ===============================
     * 1️⃣ BRAND MATCH MODE
     * =============================== */
    const allBrands = await getBrands();

    const brandMatcher =
      len <= 3
        ? (name) => name.startsWith(needle)
        : (name) => name.includes(needle);

    const matchedBrands = allBrands
      .filter((b) => brandMatcher(b.brandname.toLowerCase()))
      .map((b) => ({
        id: b.id,
        name: b.brandname,
        slug: b.slug,
      }));

    const primaryBrand =
      matchedBrands.find((b) => b.name.toLowerCase() === needle) ||
      matchedBrands.find((b) => b.name.toLowerCase().startsWith(needle)) ||
      matchedBrands[0] ||
      null;

    /* ===============================
     * 2️⃣ PRODUK DARI BRAND
     * =============================== */
    /* ===============================
     * 2️⃣ PRODUK DARI BRAND (FINAL & BENAR)
     * =============================== */
    let products = [];

    if (primaryBrand?.id) {
      const res = await getProducts({
        page: 1,
        per_page: 100,
        brand_id: primaryBrand.id,
      });

      products = (res?.data || []).filter((p) => {
        const name = (p.name || "").toLowerCase();
        const sku = (p.sku || "").toLowerCase();
        const brand =
          p?.brand?.name?.toLowerCase() ||
          p?.brand?.brandname?.toLowerCase() ||
          "";

        return brandMatcher(name) || brandMatcher(sku) || brandMatcher(brand);
      });
    }

    /* ===============================
     * 3️⃣ FALLBACK PRODUCT SEARCH
     * =============================== */
    if (!primaryBrand && products.length === 0) {
      const textRes = await searchProductsServer({
        q,
        page: 1,
        per_page: 100,
        fetch_size: 100,
      });

      products = (Array.isArray(textRes?.data) ? textRes.data : []).filter(
        (p) => {
          const name = (p.name || "").toLowerCase();
          const sku = (p.sku || "").toLowerCase();
          const brand =
            p?.brand?.name?.toLowerCase() ||
            p?.brand?.brandname?.toLowerCase() ||
            "";

          return brandMatcher(name) || brandMatcher(sku) || brandMatcher(brand);
        },
      );
    }

    return NextResponse.json({
      brands: matchedBrands.slice(0, 5),
      data: products.slice(0, limit),
    });
  } catch (err) {
    console.error("[suggest]", err);
    return NextResponse.json(
      { brands: [], data: [], error: err.message },
      { status: 500 },
    );
  }
}
