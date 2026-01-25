import { getProducts } from "@/services/api/product.services";
import { getBrands } from "@/services/api/brands.services";

function normLower(v) {
  return (v ?? "").toString().toLowerCase();
}

function normalizeSearchText(v) {
  return normLower(v).replace(/[^a-z0-9]/g, "");
}

function getBrandId(p) {
  return (
    p?.brand_id ??
    p?.brandId ??
    p?.brand?.id ??
    null
  );
}

/**
 * q: string
 * page: number
 * per_page: number
 * brand: string | string[] | null  (id atau slug; support multi via comma)
 */
export async function searchProductsServer({
  q,
  page = 1,
  per_page = 24,
  fetch_size = 500,
  brand = null,
  _skipBrandResolve = false,
} = {}) {
  const keyword = (q || "").trim();
  if (!keyword) return { data: [], meta: { page, per_page, total: 0, total_pages: 1 } };

  const needle = keyword.toLowerCase();
  const needleNormalized = normalizeSearchText(keyword);
  const searchOneBrand = async (brandValue) => {
    if (!brandValue) {
      return { data: [], meta: { page, per_page, total: 0, total_pages: 1 } };
    }
    return searchProductsServer({
      q,
      page,
      per_page,
      fetch_size,
      brand: brandValue,
      _skipBrandResolve: true,
    });
  };

  // normalize brand filter (support comma separated)
  const brandListRaw = Array.isArray(brand)
    ? brand
    : typeof brand === "string"
      ? brand.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
  const brandSet = new Set(brandListRaw.map((b) => b.toString()));

  const res = await getProducts({
    page: 1,
    // ambil banyak lalu filter manual (karena backend sering fallback)
    per_page: Math.max(per_page, fetch_size),
  });

  const rows = Array.isArray(res?.data) ? res.data : [];

  const filtered = rows
    .filter((p) => {
      // keyword filter
      const name = normLower(p?.name);
      const brandName = normLower(p?.brand ?? p?.brand?.name ?? p?.brand?.brandname);
      const brandSlug = normLower(p?.brand?.slug ?? p?.brand_slug);
      const category = normLower(
        p?.category ??
          p?.category?.name ??
          p?.category?.categoryname ??
          p?.categoryName ??
          p?.category_name ??
          p?.categoryname,
      );
      const sku = normLower(p?.sku);
      const nameNormalized = normalizeSearchText(name);
      const brandNameNormalized = normalizeSearchText(brandName);
      const brandSlugNormalized = normalizeSearchText(brandSlug);
      const categoryNormalized = normalizeSearchText(category);
      const skuNormalized = normalizeSearchText(sku);

      const okKeyword =
        name.includes(needle) ||
        brandName.includes(needle) ||
        brandSlug.includes(needle) ||
        category.includes(needle) ||
        sku.includes(needle) ||
        (needleNormalized &&
          (nameNormalized.includes(needleNormalized) ||
            brandNameNormalized.includes(needleNormalized) ||
            brandSlugNormalized.includes(needleNormalized) ||
            categoryNormalized.includes(needleNormalized) ||
            skuNormalized.includes(needleNormalized)));

      if (!okKeyword) return false;

      // brand filter (kalau ada)
      if (brandSet.size === 0) return true;

      const bid = getBrandId(p);
      const bslug = p?.brand?.slug ?? p?.brand_slug ?? null;
      const bname = p?.brand ?? p?.brand?.name ?? null;

      // cocokkan ke beberapa kemungkinan field
      return (
        (bid != null && brandSet.has(bid.toString())) ||
        (bslug && brandSet.has(bslug.toString())) ||
        (bname && brandSet.has(bname.toString()))
      );
    });

  // paging dari hasil filtered
  const start = (page - 1) * per_page;
  const end = start + per_page;

  if (filtered.length === 0 && !_skipBrandResolve && brandSet.size === 0) {
    try {
      const brands = await getBrands();
      const matchedBrand = (Array.isArray(brands) ? brands : []).find((b) => {
        const name = normalizeSearchText(b?.brandname || "");
        const slug = normalizeSearchText(b?.slug || "");
        if (needleNormalized && name) {
          if (name.includes(needleNormalized) || needleNormalized.includes(name)) return true;
        }
        if (needleNormalized && slug) {
          if (slug.includes(needleNormalized) || needleNormalized.includes(slug)) return true;
        }
        return false;
      });
      if (matchedBrand?.id || matchedBrand?.slug || matchedBrand?.brandname) {
        return await searchOneBrand(
          matchedBrand.id ?? matchedBrand.slug ?? matchedBrand.brandname,
        );
      }
    } catch {
      // ignore brand lookup failures
    }
  }

  return {
    data: filtered.slice(start, end),
    meta: {
      page,
      per_page,
      total: filtered.length,
      total_pages: Math.max(1, Math.ceil(filtered.length / per_page)),
    },
  };
}