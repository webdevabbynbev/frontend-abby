"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  RegularCard,
  TxtField,
  Filter,
  RegularCardSkeleton,
} from "@/components";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/Pagination";
import { buildPageItems } from "@/lib/pagination";

const BestSellerClient = ({
  products = [],
  brands = [],
  categories = [],
  concerns = [],
  meta = {},
  currentPage = 1,
  search = "",
  itemsPerPage = 20,
  filterCategory = null,
  filterSubcategory = null,
}) => {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);


    useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Filter products by category and subcategory
  const filteredProducts = products.filter((product) => {
    if (filterCategory) {
      const productCategory = String(product.category || "").toLowerCase();
      const filterCat = String(filterCategory).toLowerCase();
      if (!productCategory.includes(filterCat)) return false;
    }

    if (filterSubcategory) {
      const categoryType = String(product.categoryType || "").toLowerCase();
      const filterSubcat = String(filterSubcategory).toLowerCase();
      if (!categoryType.includes(filterSubcat)) return false;
    }

    return true;
  });

  const totalPages = meta?.lastPage || 1;
  const skeletonCard = itemsPerPage;
  const currentItems = filteredProducts;

  const paginationLinkBaseClass =
    "bg-transparent border border-transparent font-bold text-primary-700 hover:bg-secondary-100 transition-all duration-200 cursor-pointer";

  const pageItems = buildPageItems(currentPage, totalPages);

    const pushWithParams = (nextPage, nextSearch) => {
    const params = new URLSearchParams();
    if (nextSearch) params.set("q", nextSearch);
    if (nextPage && nextPage > 1) params.set("page", String(nextPage));
    if (itemsPerPage) params.set("per_page", String(itemsPerPage));
    if (filterCategory) params.set("category", filterCategory);
    if (filterSubcategory) params.set("subcategory", filterSubcategory);
    router.push(`/best-seller?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full xl:max-w-7xl lg:max-w-240 mx-auto p-6">
        <h1 className="sr-only">
          Produk best seller Abby n Bev yang paling sering diburu.
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
          {/* LEFT: FILTER SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <Filter
                brands={brands}
                categories={categories}
                concerns={concerns}
                showBrandFilter
                className="w-full"
              />
            </div>
          </aside>

          {/* RIGHT: MAIN CONTENT */}
          <main className="flex flex-col gap-6">
            {/* SEARCH + FILTER MOBILE */}
            <div className="flex gap-3 lg:gap-4 items-center">
              <form
                className="flex-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  pushWithParams(1, searchInput.trim());
                }}
              >
                <TxtField
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  iconLeftName="MagnifyingGlass"
                  className="w-full"
                />
              </form>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="tertiary"
                    className="w-fit px-6 lg:hidden"
                  >
                    Filter
                  </Button>
                </DialogTrigger>
                <DialogContent className="flex max-h-[80vh] w-full flex-col overflow-y-auto custom-scrollbar sm:max-w-100">
                  <DialogHeader>
                    <DialogTitle>Filter</DialogTitle>
                  </DialogHeader>
                  <Filter
                    brands={brands}
                    showBrandFilter
                    categories={categories}
                    className="w-full"
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* PRODUCTS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {false ? (
                [...Array(skeletonCard)].map((_, i) => (
                  <RegularCardSkeleton key={i} />
                ))
              ) : currentItems.length > 0 ? (
                currentItems.map((product) => (
                  <RegularCard key={product.id} product={product} />
                ))
              ) : (
                <p className="col-span-full text-center py-20 text-neutral-400">
                  No products found.
                </p>
              )}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && currentItems.length > 0 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      aria-disabled={currentPage === 1}
                      className={`${paginationLinkBaseClass} ${
                        currentPage === 1 ? "pointer-events-none opacity-50" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1)
                          pushWithParams(currentPage - 1, search);
                      }}
                    />
                  </PaginationItem>

                  {pageItems.map((item, index) => (
                    <PaginationItem key={`${item}-${index}`}>
                      {typeof item === "number" ? (
                        <PaginationLink
                          href="#"
                          isActive={item === currentPage}
                          className={`${paginationLinkBaseClass} ${
                            item === currentPage ? "bg-secondary-100" : ""
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            pushWithParams(item, search);
                          }}
                        >
                          {item}
                        </PaginationLink>
                      ) : (
                        <PaginationEllipsis />
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      aria-disabled={currentPage === totalPages}
                      className={`${paginationLinkBaseClass} ${
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages)
                          pushWithParams(currentPage + 1, search);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default BestSellerClient;
