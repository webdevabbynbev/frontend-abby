"use client";
import { useRouter, useSearchParams } from "next/navigation";
import {
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
  itemsPerPage = 24,
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const q = (sp.get("q") || initialQ || "").trim();
  const page = Number(sp.get("page") || 1);
  const limit = Number(sp.get("limit") || itemsPerPage);

  // support beberapa key brand
  const products = initialProducts || [];
  const meta = initialMeta || {};

  const totalPages = meta?.total_pages || meta?.lastPage || 1;

  return (
    <div className="flex w-full mx-auto flex-col justify-between xl:max-w-[1280px] lg:max-w-[1136px] lg:flex-row">
      {/* Sidebar Filter (desktop) */}
      <div className="hidden w-[300px] lg:w-[300px] pl-10 pr-2 py-6 lg:block">
        <Filter
          brands={brands}
          categories={categories}
          showBrandFilter={true}
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
            <DialogContent className="flex max-h-[80vh] w-full flex-col overflow-y-auto overflow-x-hidden custom-scrollbar sm:max-w-[400px]">
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

        {/* Grid */}
        {products.length > 0 ? (
          <ProductSkeletonGrid count={itemsPerPage} />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

