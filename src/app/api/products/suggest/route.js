import { NextResponse } from "next/server";
import { searchProductsServer } from "@/services/product/search.server";
import { getProducts } from "@/services/api/product.services";
import { getBrands } from "@/services/api/brands.services";
import { getCategories } from "@/services/api/category.services";

function normalizeSearchText(v) {
  return String(v || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const needle = q.toLowerCase();
    const needleNormalized = normalizeSearchText(q);
    const len = needle.length;
    const limit = Number(searchParams.get("limit") || 10);

    if (!q) return NextResponse.json({ brands: [], categories: [], data: [] });

    const allBrands = await getBrands();
    const allCategories = await getCategories().catch(() => []);

    const brandMatcher =
      len <= 3 ? (name) => name.startsWith(needle) : (name) => name.includes(needle);
    const categoryMatcher =
      len <= 3 ? (name) => name.startsWith(needle) : (name) => name.includes(needle);

    const matchedBrands = (Array.isArray(allBrands) ? allBrands : [])
      .filter((b) => brandMatcher(String(b?.brandname || "").toLowerCase()))
      .map((b) => ({ id: b.id, name: b.brandname, slug: b.slug }));

    const rawCategories =
      allCategories?.serve?.data ??
      allCategories?.serve ??
      allCategories?.data ??
      allCategories ??
      [];
    const matchedCategories = (Array.isArray(rawCategories) ? rawCategories : [])
      .filter((c) => {
        const categoryName = String(c?.name || c?.categoryname || "");
        const lowered = categoryName.toLowerCase();
        const normalized = normalizeSearchText(categoryName);
        if (categoryMatcher(lowered)) return true;
        if (!needleNormalized) return false;
        return normalized.includes(needleNormalized);
      })
      .map((c) => ({
        id: c.id,
        name: c.name || c.categoryname,
        slug: c.slug,
      }))
      .filter((c) => c.name);

    const primaryBrand =
      matchedBrands.find((b) => b.name.toLowerCase() === needle) ||
      matchedBrands.find((b) => b.name.toLowerCase().startsWith(needle)) ||
      matchedBrands[0] ||
      null;
    const primaryBrandNormalized = primaryBrand
      ? normalizeSearchText(primaryBrand.name)
      : "";
    const isBrandQuery =
      Boolean(primaryBrandNormalized) &&
      len >= 3 &&
      (needleNormalized === primaryBrandNormalized ||
        primaryBrandNormalized.startsWith(needleNormalized));

    const getProductBrandName = (product) =>
      String(
        product?.brand?.name ||
          product?.brand?.brandname ||
          product?.brand_name ||
          product?.brandName ||
          product?.brand ||
          ""
      ).toLowerCase();
    const getProductBrandSlug = (product) =>
      String(
        product?.brand?.slug ||
          product?.brand_slug ||
          product?.brandSlug ||
          ""
      ).toLowerCase();
    const getProductBrandId = (product) =>
      String(
        product?.brand_id ||
          product?.brandId ||
          product?.brand?.id ||
          ""
      );
    const getProductCategoryName = (product) =>
      String(
        product?.category?.name ||
          product?.category?.categoryname ||
          product?.categoryName ||
          product?.category_name ||
          product?.category ||
          product?.categoryname ||
          ""
      ).toLowerCase();
    const getProductName = (product) => String(product?.name || "").toLowerCase();

    const matchesKeyword = (product) => {
      const name = getProductName(product);
      const sku = String(product?.sku || "").toLowerCase();
      const brand = getProductBrandName(product);
      const category = getProductCategoryName(product);
      const matcher = len <= 4 ? (v) => v.startsWith(needle) : (v) => v.includes(needle);
      if (matcher(name) || matcher(sku) || matcher(brand) || matcher(category)) return true;
      if (!needleNormalized) return false;
      const normalizedFields = [
        normalizeSearchText(name),
        normalizeSearchText(sku),
        normalizeSearchText(brand),
        normalizeSearchText(category),
      ];
      return normalizedFields.some((value) => value.includes(needleNormalized));
    };
    const matchesBrand = (product) => {
      if (!primaryBrand) return false;
      const productBrandName = normalizeSearchText(getProductBrandName(product));
      const productBrandSlug = normalizeSearchText(getProductBrandSlug(product));
      const productBrandId = getProductBrandId(product);
      if (primaryBrand.id && productBrandId) {
        if (String(primaryBrand.id) === String(productBrandId)) return true;
      }
      const primaryBrandSlug = primaryBrand.slug
        ? normalizeSearchText(primaryBrand.slug)
        : "";
      if (primaryBrandSlug && productBrandSlug) {
        if (primaryBrandSlug === productBrandSlug) return true;
      }
      if (primaryBrandNormalized && productBrandName) {
        return (
          primaryBrandNormalized === productBrandName ||
          productBrandName.includes(primaryBrandNormalized) ||
          primaryBrandNormalized.includes(productBrandName)
        );
      }
      const productName = normalizeSearchText(getProductName(product));
      if (primaryBrandNormalized && productName) {
        return productName.includes(primaryBrandNormalized);
      }
      return false;
    };

    let products = [];

    if (primaryBrand?.id) {
      const res = await getProducts({ page: 1, per_page: 500, brand_id: primaryBrand.id });
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const brandMatches = list.filter(matchesBrand);
      products = isBrandQuery ? brandMatches : list.filter(matchesKeyword);
    }

    if (products.length === 0) {
      if (isBrandQuery && primaryBrand) {
        const brandRes = await searchProductsServer({
          q,
          page: 1,
          per_page: 100,
          fetch_size: 500,
          brand: primaryBrand.id ?? primaryBrand.slug ?? primaryBrand.name,
        });
        const brandList = Array.isArray(brandRes?.data) ? brandRes.data : [];
        if (brandList.length > 0) {
          products = brandList.filter(matchesBrand);
        }
      }
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
      categories: matchedCategories.slice(0, 5),
      data: products.slice(0, limit),
    });
  } catch (err) {
    console.error("[suggest]", err);
    return NextResponse.json(
      { brands: [], categories: [], data: [], error: err?.message || String(err) },
      { status: 500 }
    );
  }
}