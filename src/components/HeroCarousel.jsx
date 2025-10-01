"use client";
import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components";
import api from "@/lib/axios";
import {
  RegularCard,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components";
import Image from "next/image";

export function HeroCarousel() {
  const autoplay = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await api.get("/banners");
        const serve = res.data.serve;
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

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-48 rounded-lg" />
        <Skeleton className="w-1/2 h-6 rounded" />
      </div>
    );
  }

  return (
    <Carousel
      className="mx-auto w-full max-w-[1536px] "
      opts={{
        loop: true,
      }}
      plugins={[autoplay.current]}
      // Optional: bisa pakai event mouseEnter/mouseLeave untuk pause/resume
      onMouseEnter={() => autoplay.current.stop()}
      onMouseLeave={() => autoplay.current.reset()}
    >
      <CarouselContent>
        {Array.isArray(banners) &&
          banners.map((b) => (
            
            <CarouselItem key={b.id}>
              <div className="p-1">
                <img
                  src={
                    b.image.startsWith("http")
                      ? b.image_url
                      : `${process.env.NEXT_PUBLIC_API_URL.replace(
                          "/api/v1",
                          ""
                        )}/${b.image_url}`
                  }
                  alt={b.title || "banner"}
                  className="rounded-lg max-h-[400px] object-cover"
                />
                <span>{b.description}</span>
              </div>
            </CarouselItem>
          ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
