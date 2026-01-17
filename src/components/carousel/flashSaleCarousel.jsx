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
import { getApi } from "@/services/api/client";

function normalizeFlashSaleItem(raw) {
  if (!raw) return raw;

  const source = raw.product ?? raw;

  // Try to find original price
  const comparePrice = Number(
    source.realprice ??
      source.oldPrice ??
      source.original_price ??
      source.originalPrice ??
      0,
  );

  // Try to find base price
  const currentPrice = Number(
    source.price ?? source.basePrice ?? source.base_price ?? 0,
  );

  // Determine normal (original) price
  let normalPrice = currentPrice;
  if (comparePrice > 0 && comparePrice > currentPrice) {
    normalPrice = comparePrice;
  }

  // Determine sale price
  let salePrice = Number(
    source.flashPrice ??
      source.flash_price ??
      source.salePrice ??
      source.sale_price ??
      source.flashSalePrice ??
      source.flash_sale_price ??
      source.discountPrice ??
      source.discount_price ??
      0,
  );

  // Fallback: if salePrice is 0 but we have a comparePrice > currentPrice, assume currentPrice is the sale price
  if (salePrice === 0 && comparePrice > 0 && comparePrice > currentPrice) {
    salePrice = currentPrice;
  }

  const isSale =
    Number.isFinite(salePrice) && salePrice > 0 && salePrice < normalPrice;

  if (!isSale) return raw;

  const normalizedProduct = {
    ...source,
    price: normalPrice, // FlashSaleCard expects 'price' to be original price
    flashPrice: salePrice, // FlashSaleCard expects 'flashPrice'
    realprice: normalPrice,
    sale: true,
    flashSaleId: raw.flashSaleId ?? source.flashSaleId,
  };

  if (raw.product) {
    return {
      ...raw,
      product: normalizedProduct,
    };
  }

  return normalizedProduct;
}

export function FlashSaleCarousel() {
  const SKELETON_COUNT = 10;
  const [rawItems, setRawItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        setLoading(true);
        const res = await getApi('/flashsale');
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
              <FlashSaleCard item={product} />
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
