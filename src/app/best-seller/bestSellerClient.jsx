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
  meta = {},
  currentPage = 1,
  search = "",
  itemsPerPage = 20,
}) => {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);


    useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const totalPages = meta?.lastPage || 1;
  const skeletonCard = itemsPerPage;
  const currentItems = products;

  const paginationLinkBaseClass =
    "bg-transparent border border-transparent font-bold text-primary-700 hover:bg-secondary-100 transition-all duration-200 cursor-pointer";

  const pageItems = buildPageItems(currentPage, totalPages);

    const pushWithParams = (nextPage, nextSearch) => {
    const params = new URLSearchParams();
    if (nextSearch) params.set("q", nextSearch);
    if (nextPage && nextPage > 1) params.set("page", String(nextPage));
    if (itemsPerPage) params.set("per_page", String(itemsPerPage));
    router.push(`/best-seller?${params.toString()}`);
  };

  return (
    <div className="flex w-full mx-auto flex-col justify-between xl:max-w-7xl lg:max-w-284 lg:flex-row">
      <h1 className="sr-only">
        Produk best seller Abby n Bev yang paling sering diburu.
      </h1>

      {/* FILTER DESKTOP */}
      <div className="hidden w-75 lg:w-75 pl-10 pr-2 py-6 lg:block">
        <Filter
          brands={brands}
          categories={categories}
          showBrandFilter
          className="w-full py-24"
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6">
        {/* SEARCH + FILTER MOBILE */}
        <div className="mb-6 flex gap-3 sm:items-center">
          <form
            className="w-full"
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
                className="w-fit px-6 sm:w-auto lg:hidden"
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
                className="w-full py-24"
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
        {totalPages > 1 && (
          <Pagination className="mt-12">
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
      </div>
    </div>
  );
};

export default BestSellerClient;
