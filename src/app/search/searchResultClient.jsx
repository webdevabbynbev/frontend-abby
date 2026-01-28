"use client";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BrandCard,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Filter,
  RegularCard,
} from "@/components";

export default function SearchResultsClient({
  initialQ,
  initialProducts,
  initialMeta,
  brands,
  categories,
  concerns,
  ratings,
  itemsPerPage = 24,
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const q = (sp.get("q") || initialQ || "").trim();
  const page = Number(sp.get("page") || 1);
  const limit = Number(sp.get("limit") || itemsPerPage);

  const keyword = q.toLowerCase();
  const brandMatcher =
    keyword.length <= 4
      ? (value) => value.startsWith(keyword)
      : (value) => value.includes(keyword);

  const matchedBrands = (brands || []).filter((brand) => {
    const brandName = String(
      brand?.brandname || brand?.name || "",
    ).toLowerCase();
    return brandName ? brandMatcher(brandName) : false;
  });

  // support beberapa key brand
  const products = (initialProducts || []).map((product) => ({
    ...product,
    brand:
      product?.brand?.name ||
      product?.brand?.brandname ||
      product?.brand_name ||
      product?.brandName ||
      product?.brand ||
      "",
  }));
  const meta = initialMeta || {};

  const totalPages = meta?.total_pages || meta?.lastPage || 1;

  return (
    <div className="flex w-full mx-auto flex-col justify-between xl:max-w-7xl lg:max-w-284 lg:flex-row">
      {/* Sidebar Filter (desktop) */}
      <div className="hidden w-75 lg:w-75 pl-10 pr-2 py-6 lg:block">
        <Filter
          brands={brands}
          categories={categories}
          showBrandFilter={true}
          concerns={concerns}
          ratings={ratings}
          className="w-full py-24"
        />
      </div>

      <div className="flex-1 p-6">
        {/* Header + filter mobile (styling sama BestSeller) */}
        <div className="mb-6 flex flex-row gap-3 sm:flex-row sm:items-center">
          <h1 className="text-xl font-semibold">
            Hasil pencarian: <span className="font-bold">"{q || "-"}"</span>
          </h1>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="tertiary"
                className="ml-auto w-fit px-6 sm:w-auto lg:hidden"
              >
                Filter
              </Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[80vh] w-full flex-col overflow-y-auto overflow-x-hidden custom-scrollbar sm:max-w-100">
              <DialogHeader>
                <DialogTitle>Filter</DialogTitle>
              </DialogHeader>
              <Filter
                brands={brands}
                categories={categories}
                showBrandFilter={true}
                className="w-full pb-10"
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Brand Results */}
         {matchedBrands.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-neutral-500 mb-3">
              Brand
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {matchedBrands.map((brand) => {
                const brandName = brand?.brandname || brand?.name || "—";
                return (
                  <BrandCard
                    key={brand.id || brand.slug || brandName}
                    logo={brand.logo || brand.image || brand.icon}
                    brandname={brandName}
                    slug={brand?.slug}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <h2 className="text-sm font-semibold text-neutral-500 mb-3">
              Produk
            </h2>
            {products.map((p) => (
              <RegularCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="col-span-full text-center py-20 text-neutral-400">
            No products found.
          </p>
        )}

        {/* Pagination sederhana via URL (biar SSR/CSR tetap konsisten) */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-3">
            <button
              className="px-3 py-2 rounded-lg border disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => {
                const next = new URLSearchParams(sp.toString());
                next.set("page", String(Math.max(1, page - 1)));
                router.push(`/search?${next.toString()}`);
              }}
            >
              Prev
            </button>

            <div className="px-3 py-2 text-sm text-neutral-600">
              Page {page} / {totalPages}
            </div>

            <button
              className="px-3 py-2 rounded-lg border disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => {
                const next = new URLSearchParams(sp.toString());
                next.set("page", String(Math.min(totalPages, page + 1)));
                router.push(`/search?${next.toString()}`);
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
