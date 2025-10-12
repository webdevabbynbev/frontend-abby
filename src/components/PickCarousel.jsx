import React from "react";
import { BevPick } from "@/data";
import {
  RegularCard,
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
  CarouselItem,
} from "@/components";

export function PickCarousel() {
  return (
    <Carousel className="mx-auto w-full max-w-[1536px] justify-center">
      <CarouselContent>
        {Array.isArray(BevPick) &&
          BevPick.slice(0, 9).map((b) => ( 
          <CarouselItem
          key={b.id}
          className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5" >
          <RegularCard item={b} />
          </CarouselItem>
          
        ))}
        
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
