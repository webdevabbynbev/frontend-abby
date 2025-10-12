"use client";
import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselIndicators,
} from "@/components";
import { getImageUrl } from "@/utils/getImageUrl";

export function HeroCarousel() {
  const autoplay = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );
  const [isloading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const { data } = await api.get("/banners");
        const serve = data?.serve;
        const normalized = Array.isArray(serve) ? serve : serve?.data || [];
        setBanners(normalized);
      } catch (error) {
        console.error("error fetching banner", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBanners();
  }, []);


  if (isloading|| !banners.length) {
    // 🔹 SKELETON VIEW
    return (
      <div className="w-full h-[220px] sm:h-[200px] md:h-[200px] lg:h-[200px] xl:h-[600px]">
        <div className="flex">
            <div className="w-full h-full">
              <Skeleton className="w-full h-[220px] sm:h-[200px] md:h-[200px] lg:h-[200px] xl:h-[600px] rounded-lg" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Carousel
        className="w-full h-full"
        opts={{ loop: true }}
        plugins={[autoplay.current]}
        onMouseEnter={() => autoplay.current.stop()}
        onMouseLeave={() => autoplay.current.reset()}
      >
        <CarouselContent>
          {banners.map((b, idx) => {
            const src = getImageUrl(b.image_url || b.image);
            return (
              <CarouselItem key={b.id || idx}>
                <div className="relative h-full">
                  <img
                    src={src}
                    alt={b.title || "Banner"}
                    className="rounded-lg w-full h-auto object-cover"
                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                  />
                  {/* {b.description && (
                    <span className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded-md">
                      {b.description}
                    </span>
                  )} */}
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Default Controls */}
        <CarouselPrevious />
        <CarouselNext />
        <CarouselIndicators />
      </Carousel>
    </div>
  );
}
