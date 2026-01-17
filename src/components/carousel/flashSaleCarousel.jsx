"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
  CarouselItem,
  FlashSaleCard,
  RegularCardSkeleton,
} from "@/components";
import { normalizeFlashSaleItem } from "@/services/api/normalizers/product";
import { getApi } from "@/services/api/client";

export function FlashSaleCarousel() {
  const SKELETON_COUNT = 10;
  const [rawItems, setRawItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        setLoading(true);
        const res = await getApi("/flashsale");
        const flashSaleData = res?.serve ?? res;

        const items =
          flashSaleData?.products ??
          flashSaleData?.items ??
          flashSaleData?.list ??
          flashSaleData?.data ??
          [];

        setRawItems(Array.isArray(items) ? items : []);
      } catch (error) {
        console.error("Gagal memuat Flash Sale:", error);
        setRawItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSale();
  }, []);

  const products = useMemo(() => {
    return rawItems.map(normalizeFlashSaleItem).filter(Boolean);
  }, [rawItems]);

  if (loading) {
    return (
      <div className="w-full overflow-hidden">
        <div className="flex gap-4">
          {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="flex-none basis-1/2 md:basis-1/4 lg:basis-1/5"
            >
              <RegularCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <Carousel className="w-full" opts={{ align: "start" }}>
      <CarouselContent className="justify-start snap-start gap-0">
        {products.slice(0, 10).map((product) => (
          <CarouselItem
            key={product.id}
            className="flex-none basis-1/2 md:basis-1/4 lg:basis-1/5"
          >
            <div className="relative h-full w-full overflow-hidden rounded-lg">
              <span className="pointer-events-none absolute top-0 left-0 z-10 flex h-[24px] items-center rounded-br-lg bg-[#AE2D68] px-2 text-[10px] font-bold uppercase tracking-wide text-[#F6F6F6]">
                Flash Sale
              </span>
              <FlashSaleCard
                item={product}
                hrefQuery={{
                  salePrice: product.flashPrice,
                  realPrice: product.realprice,
                  flashSaleId: product.flashSaleId,
                }}
              />
            </div>
          </CarouselItem>
        ))}
        <div className="flex-none w-[0px]" aria-hidden="true" />
      </CarouselContent>

      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
