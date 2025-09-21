"use client";
import * as React from "react";
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

export function HeroCarousel() {
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await api.get("/banners");
        console.log("API response:", res.data);
        setBanners(res.data.serve);
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
      <Carousel className="mx-auto w-full max-w-[1536px] justify-center">
      <CarouselContent>
        {Array.isArray(banners) &&
          banners.map((b) => (
            <CarouselItem key={b.id}>
              <div className="p-1">
                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${b.image}` } alt={b.title}/>
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
