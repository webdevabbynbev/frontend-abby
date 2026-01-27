"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselIndicators,
} from "@/components";
import { getImageUrl } from "@/utils/getImageUrl";

export function HeroCarousel({ banners = [] }) {
  const autoplay = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  const Wrapper = ({ children }) => (
    <div className="w-full">
      <div className="relative w-full overflow-hidden rounded-lg aspect-16/4">
        {children}
      </div>
    </div>
  );

  if (!banners.length) return null;

  return (
    <Wrapper>
      <Carousel
        className="absolute inset-0 w-full h-full"
        opts={{ loop: true }}
        plugins={[autoplay.current]}
        onMouseEnter={() => autoplay.current.stop()}
        onMouseLeave={() => autoplay.current.reset()}
      >
        <CarouselContent className="h-full">
          {banners.map((b, idx) => {
            const src = getImageUrl(b.image_url || b.image);

            return (
              <CarouselItem key={b.id || idx} className="h-full">
                <img
                  src={src}
                  alt={b.title || "Banner"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = getImageUrl(null);
                  }}
                />
              </CarouselItem>
            );
          })}
        </CarouselContent>

        <CarouselPrevious />
        <CarouselNext />
        <CarouselIndicators />
      </Carousel>
    </Wrapper>
  );
}
