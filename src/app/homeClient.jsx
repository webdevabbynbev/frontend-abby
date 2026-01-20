"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { getImageUrl } from "@/utils/getImageUrl";

import {
  RegularCardSkeleton,
  RegularCard,
  CategoryCard,
  Button,
  HeroCarousel,
  BrandCard,
  FlashSaleCarousel,
} from "@/components";
import { DataBrand } from "@/data";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel";
import { getProducts } from "@/services/api/product.services";
import { getCategories } from "@/services/api/category.services";

export default function HomeClient() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [bestSellers, setBestSellers] = useState([]);
  const [bestSellersLoading, setBestSellersLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [, setCategoriesLoading] = useState(true);

  const router = useRouter();

  const attachApiExtraDiscounts = (normalizedItems, rawRows) => {
    if (!Array.isArray(normalizedItems)) return [];

    const extraById = new Map();
    if (Array.isArray(rawRows)) {
      rawRows.forEach((row) => {
        const source = row?.product ?? row;
        const key = Number(
          source?.id ??
            source?.productId ??
            source?.product_id ??
            source?._id ??
            0,
        );
        if (!key) return;
        const extra =
          row?.product?.extraDiscount ??
          row?.extraDiscount ??
          source?.extraDiscount ??
          null;
        if (extra) {
          extraById.set(key, extra);
        }
      });
    }

    return normalizedItems.map((item) => {
      const key = Number(
        item?.productId ?? item?.product_id ?? item?.id ?? item?._id ?? 0,
      );
      const extra = extraById.get(key) ?? item?.extraDiscount ?? null;
      return extra ? { ...item, extraDiscount: extra } : item;
    });
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const res = await getCategories();
        if (cancelled) return;

        const arr = Array.isArray(res?.serve)
          ? res.serve
          : Array.isArray(res?.serve?.data)
            ? res.serve.data
            : [];

        const level1 = arr.filter(
          (c) => c.level === 1 && (c.parentId == null || c.parent_id == null),
        );
        setCategories(level1);
      } catch (err) {
        console.error("getCategories error:", err);
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }

      if (cancelled) return;

      try {
        const { data, dataRaw } = await getProducts({
          page: 1,
          per_page: 30,
          sort_by: "created_at",
          order: "desc",
        });
        if (!cancelled) {
          setProducts(attachApiExtraDiscounts(data, dataRaw));
        }
      } catch (err) {
        console.error("getProducts error:", err);
      } finally {
        if (!cancelled) setProductsLoading(false);
      }

      if (cancelled) return;

      try {
        const { data, dataRaw } = await getProducts({
          page: 1,
          per_page: 15,
          sort_by: "sold",
          order: "desc",
        });
        if (!cancelled) {
          setBestSellers(attachApiExtraDiscounts(data, dataRaw));
        }
      } catch (err) {
        console.error("getBestSellers error:", err);
      } finally {
        if (!cancelled) setBestSellersLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);


  // --- COMPONENT: PICK SECTION (Existing) ---
  const PickSection = ({
    title,
    subtitle,
    items = [],
    loading = false,
    onSeeAll,
    maxItems = 12,
    skeletonCount = 12,
    titleClassName = "text-4xl",
  }) => {
    if (!loading && (!items || items.length === 0)) return null;

    return (
      <div className="xl:max-w-7xl lg:max-w-240 mx-auto p-6 space-y-6">
        <h1 className="sr-only">
          Situs Belanja Online Makeup dan Skincare Terbaik Di Indonesia
        </h1>
        <div className="flex items-start justify-between">
          <div className="flex-row space-y-1">
            <h3
              className={`font-damion font-normal ${titleClassName} text-primary-700`}
            >
              {title}
            </h3>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>

          <Button variant="secondary" size="md" onClick={onSeeAll}>
            See all
          </Button>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: skeletonCount }).map((_, i) => (
                <RegularCardSkeleton key={`pick-skel-${i}`} />
              ))}
            </div>

            <div className="hidden lg:grid grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <RegularCardSkeleton key={`pick-skel-${i}`} />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:hidden gap-4">
              {items.slice(0, maxItems).map((p) => (
                <RegularCard
                  key={p.id ?? p._id ?? p.slug ?? p.name}
                  product={p}
                />
              ))}
            </div>

            <div className="hidden lg:grid grid-cols-5 gap-4">
              {items.slice(0, 10).map((p) => (
                <RegularCard
                  key={p.id ?? p._id ?? p.slug ?? p.name}
                  product={p}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // --- NEW COMPONENT: DUAL PROMO SECTION (Split Left/Right) ---
  const DualPromoSection = () => {
    const editorPicks = products.length > 0 ? products.slice(0, 15) : [];
    const trendingPicks = bestSellers;

    const bannerSrc = getImageUrl(
      "Products/abby-product-placeholder-image.png",
    );

    return (
      <div className="w-full xl:max-w-7xl lg:max-w-240 mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* ================= LEFT ================= */}
          <div className="flex flex-col space-y-4">
            {/* Banner kiri */}
            <div className="w-full aspect-video bg-gray-200 rounded-xl overflow-hidden shadow-sm">
              <img
                src={bannerSrc}
                alt="Left Banner"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = getImageUrl();
                }}
              />
            </div>

            {/* Carousel kiri */}
            <div className="space-y-2">
              <h4 className="font-damion text-2xl text-primary-700">
                New Arrival
              </h4>

              <Carousel opts={{ align: "start" }} className="w-full relative">
                <CarouselContent className="-ml-2 md:-ml-4">
                  {productsLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <CarouselItem
                          key={`left-skel-${i}`}
                          className="pl-2 md:pl-4 basis-1/2"
                        >
                          <RegularCardSkeleton />
                        </CarouselItem>
                      ))
                    : editorPicks.map((product) => (
                        <CarouselItem
                          key={product.id || product._id}
                          className="pl-2 md:pl-4 basis-1/2"
                        >
                          <RegularCard product={product} />
                        </CarouselItem>
                      ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="flex flex-col space-y-4">
            {/* Banner kanan */}
            <div className="w-full aspect-video bg-gray-200 rounded-xl overflow-hidden shadow-sm">
              <img
                src={bannerSrc}
                alt="Right Banner"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = getImageUrl();
                }}
              />
            </div>

            {/* Carousel kanan */}
            <div className="space-y-2">
              <h4 className="font-damion text-2xl text-primary-700">
                Best Seller
              </h4>

              <Carousel opts={{ align: "start" }} className="w-full relative">
                <CarouselContent className="-ml-2 md:-ml-4">
                  {bestSellersLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <CarouselItem
                          key={`right-skel-${i}`}
                          className="pl-2 md:pl-4 basis-1/2"
                        >
                          <RegularCardSkeleton />
                        </CarouselItem>
                      ))
                    : trendingPicks.map((product) => (
                        <CarouselItem
                          key={product.id || product._id}
                          className="pl-2 md:pl-4 basis-1/2"
                        >
                          <RegularCard product={product} />
                        </CarouselItem>
                      ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------

  const abbyPicks = products.slice(0, 12);
  const bevPicks = products.slice(12, 24);

  return (
    <div className="Container items-center justify-center mx-auto overflow-visible">
      <h1 className="sr-only">
        Situs Belanja Online Makeup dan Skincare Terbaik di Indonesia
      </h1>
      <div className="Hero-wrapper w-full flex flex-row py-0 lg:py-6 justify-between h-full mx-auto xl:max-w-7xl lg:max-w-240">
        <div className="h-auto w-full px-0 lg:px-6 items-center">
          <HeroCarousel />
        </div>
      </div>

      {/* <div className="ContainerCategory p-6 space-y-4 mx-auto w-full xl:max-w-7xl lg:max-w-240 overflow-hidden">
        <h3 className="text-primary-700 text-lg font-bold">Kategori</h3>
        <div className="w-full">
          <div
            className="
              flex gap-3
              overflow-x-auto
              no-scrollbar
              pb-2
              px-6
              snap-x snap-mandatory
              scroll-smooth
              lg:mx-0 lg:px-0
              lg:grid md:grid-cols-8 lg:grid-cols-8 lg:gap-6 lg:overflow-visible justify-between
            "
          >
            {categories.map((item) => (
              <div key={item.id} className="shrink-0 snap-start">
                <CategoryCard {...item} />
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* --- ADDED NEW DUAL PROMO SECTION HERE --- */}
      <DualPromoSection />
      {/* ----------------------------------------- */}

      <div className="ContainerFlashSale w-full flex-col bg-primary-100 items-center justify-center bg-[url('/Logo_SVG_AB.svg')] bg-no-repeat bg-center">
        <div className="Wrapper p-6 flex flex-col xl:max-w-7xl lg:max-w-240 mx-auto">
          <div className="leftWrapper justify-between flex flex-row w-full space-y-6">
            <div className="texts flex-row">
              <h3 className="font-damion text-3xl text-primary-700">
                Flash Sale
              </h3>
            </div>
            <div className="">
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push("/sale")}
              >
                Lihat semua
              </Button>
            </div>
          </div>
          <div className="w-full">
            <FlashSaleCarousel />
          </div>
        </div>
      </div>

      <div className="ContainerAbbyBev py-10 space-y-16 w-full">
        <PickSection
          title="Abby's Pick"
          subtitle="Your Makeup Matchmaker"
          items={abbyPicks}
          loading={productsLoading}
          onSeeAll={() => router.push("/products?pick=abby")}
          titleClassName="text-3xl"
        />

        <PickSection
          title="Bev's Pick"
          subtitle="Your skinCare Bestie"
          items={bevPicks}
          loading={productsLoading}
          onSeeAll={() => router.push("/products?pick=bev")}
          titleClassName="text-3xl"
        />
      </div>

      <div className="Brand-Container flex px-10 py-10 bg-primary-100 items-center justify-center space-x-6 bg-[url('/Logo_SVG_AB.svg')] bg-no-repeat bg-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:max-w-7xl lg:max-w-240 mx-auto gap-6">
          <div className="Wrapper flex-row w-full space-y-6">
            <h3 className="font-damion text-3xl text-primary-700">
              Shop by brands
            </h3>
            <div className="hidden flex-row text-lg font-medium space-y-6 lg:block">
              <p>
                From best-sellers to hidden gems — explore top beauty brands,
                handpicked by Abby n Bev.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push("/brand")}
              >
                Discover more
              </Button>
            </div>
          </div>

          <div className="Conten-wrapper grid grid-cols-2 md:grid-cols-4 gap-6 min-w-[50%] max-w-384 mx-auto">
            {DataBrand.slice(0, 8).map((item) => (
              <BrandCard key={item.id} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

console.log("Home render OK");
