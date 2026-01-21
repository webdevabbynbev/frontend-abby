import SearchResultsClient from "./searchResultClient";
import { searchProductsServer } from "@/services/product/search.server";
import { getBrands } from "@/services/api/brands.services";
import { getCategories } from "@/services/api/category.services";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams; // ✅ wajib

  const q = (sp?.q || "").trim();

  const brand = sp?.brand || sp?.brands || sp?.brand_id || "";

  const page = Number(sp?.page || 1);
  const limit = Number(sp?.limit || 24);

 const [resBrands, resCategories] = await Promise.all([
    getBrands(),
    getCategories(),
  ]);
  const brands = resBrands?.data || [];
  const categories = Array.isArray(resCategories?.serve)
    ? resCategories.serve
    : Array.isArray(resCategories?.data)
      ? resCategories.data
      : Array.isArray(resCategories)
        ? resCategories
        : [];

  if (!q) {
    // tetap render layout + filter, tapi tanpa hasil
    return (
      <SearchResultsClient
        initialQ=""
        initialProducts={[]}
        initialMeta={{}}
        brands={brands}
        categories={categories}
        itemsPerPage={24}
      />
    );
  }

  const { data: initialProducts, meta: initialMeta } =
    await searchProductsServer({
      q,
      page: Number(sp?.page || 1),
      limit: Number(sp?.limit || 24),
      brand,
    });

  return (
    <SearchResultsClient
      initialQ={q}
      initialProducts={initialProducts}
      initialMeta={initialMeta}
      brands={brands}
      categories={categories}
      itemsPerPage={24}
    />
  );
}
