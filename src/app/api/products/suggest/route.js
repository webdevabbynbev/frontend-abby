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

    if (!q) return NextResponse.json({ brands: [], data: [] });

    const allBrands = await getBrands();

    const brandMatcher =
      len <= 3 ? (name) => name.startsWith(needle) : (name) => name.includes(needle);

    const matchedBrands = (Array.isArray(allBrands) ? allBrands : [])
      .filter((b) => brandMatcher(String(b?.brandname || "").toLowerCase()))
      .map((b) => ({ id: b.id, name: b.brandname, slug: b.slug }));

    const primaryBrand =
      matchedBrands.find((b) => b.name.toLowerCase() === needle) ||
      matchedBrands.find((b) => b.name.toLowerCase().startsWith(needle)) ||
      matchedBrands[0] ||
      null;

    const getProductBrandName = (product) =>
      String(
        product?.brand?.name ||
          product?.brand?.brandname ||
          product?.brand_name ||
          product?.brandName ||
          product?.brand ||
          ""
      ).toLowerCase();

    const matchesKeyword = (product) => {
      const name = String(product?.name || "").toLowerCase();
      const sku = String(product?.sku || "").toLowerCase();
      const brand = getProductBrandName(product);
      const matcher = len <= 4 ? (v) => v.startsWith(needle) : (v) => v.includes(needle);
      return matcher(name) || matcher(sku) || matcher(brand);
    };

    let products = [];

    if (primaryBrand?.id) {
      const res = await getProducts({ page: 1, per_page: 100, brand_id: primaryBrand.id });
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      products = list.filter(matchesKeyword);
    }

    if (products.length === 0) {
      const textRes = await searchProductsServer({
        q,
        page: 1,
        per_page: 100,
        fetch_size: 500,
      });
      const list = Array.isArray(textRes?.data) ? textRes.data : [];
      products = list.filter(matchesKeyword);
    }

    return NextResponse.json({
      brands: matchedBrands.slice(0, 5),
      data: products.slice(0, limit),
    });
  } catch (err) {
    console.error("[suggest]", err);
    return NextResponse.json(
      { brands: [], data: [], error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
