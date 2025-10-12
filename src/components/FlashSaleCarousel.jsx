import React from "react";
import { BevPick } from "@/data";
import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
  CarouselItem,
  FlashSaleCard,
} from "@/components";

export function FlashSaleCarousel() {
  return (
    <Carousel className="mx-auto max-w-[1536px] px-2 sm:px-4 md:px-6">
      <CarouselContent className="sm:space-x-28 md:space-x-28">
        {Array.isArray(BevPick) &&
          BevPick.slice(0, 9).map((b) => (
            <CarouselItem
              key={b.id}
              className="
                basis-[85%] 
                sm:basis-1/3 
                md:basis-1/3 
                lg:basis-1/4 
                xl:basis-1/5
                flex-shrink-0
              "
            >
              <FlashSaleCard item={b} />
            </CarouselItem>
          ))}
      </CarouselContent>

      {/* Tombol navigasi carousel */}
      <CarouselPrevious className="hidden sm:flex left-2 md:left-4" />
      <CarouselNext className="hidden sm:flex right-2 md:right-4" />
    </Carousel>
  );
}