"use client";

import React, { useMemo } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
  CarouselItem,
  FlashSaleCard,
} from "@/components";
import { normalizeFlashSaleItem } from "@/services/api/normalizers/product";

export function FlashSaleCarousel({ rawItems = [] }) {
  const products = useMemo(() => {
    return rawItems.map(normalizeFlashSaleItem).filter(Boolean);
  }, [rawItems]);

  const buildKey = (product, index) => {
    const key =
      product?.variant_id ??
      product?.variantId ??
      product?.variant?.id ??
      product?.sku ??
      product?.id;
    return key ? String(key) : `flash-${index}`;
  };

  if (products.length === 0) return null;

  return (
    <Carousel className="w-full" opts={{ align: "start" }}>
      <CarouselContent className="justify-start snap-start gap-0">
        {products.slice(0, 10).map((product, index) => (
          <CarouselItem
            key={buildKey(product, index)}
            className="flex-none basis-1/2 md:basis-1/4 lg:basis-1/5"
          >
            <div className="relative h-full w-full overflow-hidden rounded-lg">
              <span className="pointer-events-none absolute top-0 left-0 z-10 flex h-6 items-center rounded-br-lg bg-[#AE2D68] px-2 text-[10px] font-bold uppercase tracking-wide text-[#F6F6F6]">
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
        <div className="flex-none w-0" aria-hidden="true" />
      </CarouselContent>

      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
