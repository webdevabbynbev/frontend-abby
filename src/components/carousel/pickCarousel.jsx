"use client";

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
  CarouselItem,
  RegularCard,
} from "@/components";
import { getProducts } from "@/services/api/product.services";

export function PickCarousel({ products = [] }) {
  if (products.length === 0) return null;

  return (
    <Carousel className="w-full" opts={{ align: "start" }}>
      <CarouselContent className="justify-start gap-0">
        {products.slice(0, 10).map((product) => (
          <CarouselItem
            key={product.id}
            className="flex-none basis-1/2 md:basis-1/3 lg:basis-1/5"
          >
            <RegularCard product={product} />
          </CarouselItem>
        ))}
        <div className="flex-none w-[0px]" aria-hidden="true" />
      </CarouselContent>

      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}