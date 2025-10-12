"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import * as React from "react";
import {
  BtnIcon,
  PickCarousel,
  CategoryCard,
  Button,
  HeroCarousel,
  BrandCard,
  BlogCard,
  FlashSaleCard,
} from "@/components";

import { DataCategoryCard, DataBrand, DataArticleBlog, BevPick } from "@/data";
import { FlashSaleCarousel } from "@/components/FlashSaleCarousel";

export default function Home() {
  const router = useRouter();
  return (
    <div className="Container flex-row items-center justify-center mx-auto min-h-[85vh]">
      <div className="Hero-wrapper w-full flex md:flex-row sm:flex-col justify-between h-full p-10 gap-6 max-w-[1536px] mx-auto">
        <div className="sm:w-full md:max-w-[70%] items-center">
          <HeroCarousel />
        </div>
        <div className="bento-right md:w-[50%] sm:w-full flex md:flex-col sm:flex-row h-auto justify-between gap-4">
          <div className="abbynbev flex md:flex-row sm:flex-col h-full max-h-[50%] gap-4">
            <div className="relative flex flex-col justify-between  h-auto w-full p-4 bg-primary-700 text-primary-100 space-y-2 rounded-lg">
              <div className="space-y-4">
                <h3 className="text-lg font-damion">Abby</h3>
                <p className="text-xs font-semibold ">
                  From everyday essentials to bold glam, Abby helps you find the
                  best makeup that suits your style.
                </p>
                <p className="text-[11px]">Curated makeup products</p>
              </div>
              <div className="absolute p-1 -top-1 -right-1  bg-[#f7f7f7] rounded-full">
                <BtnIcon
                  variant="primary"
                  size="xs"
                  iconName="UpRightFromSquare"
                />
              </div>
            </div>

            <div className="relative flex flex-col justify-between h-auto w-full p-4 bg-primary-200 text-primary-700 space-y-2 rounded-lg">
              <div className="space-y-4 ">
                <h3 className="text-lg font-damion">Bev</h3>
                <p className="text-xs font-semibold ">
                  Bev curates skincare that works for your skin type, concerns,
                  and routine — no guesswork needed.
                </p>
                <p className="text-[11px]">Curated skincare products</p>
              </div>
              <div className="absolute p-1 -top-1 -right-1  bg-[#f7f7f7] rounded-full">
                <BtnIcon
                  variant="primary"
                  size="xs"
                  iconName="UpRightFromSquare"
                />
              </div>
            </div>
          </div>
          <div className="eventabby w-full rounded-xl overflow-hidden">
            <img src="abbywardah.png" alt="event" />
          </div>
        </div>
      </div>

      <div className="ContainerCategory py-10 px-10 space-y-6 max-w-[1536px] mx-auto">
        <h3 className="text-primary-700 text-lg font-bold">Category</h3>
        <div className="grid grid-cols-4 gap-6">
          {DataCategoryCard.map((item) => (
            <CategoryCard key={item.id} {...item} />
          ))}
        </div>
      </div>

      <div className="ContainerFlashSale w-full flex py-10 px-10 bg-primary-100 items-center justify-center space-x-6 bg-[url('/Logo_SVG_AB.svg')] bg-no-repeat bg-center">
        <div className="Wrapper md:flex-row sm:flex-col sm:w-full items-center w-full max-w-[1536px] mx-auto flex flex-row gap-6">
          <div className="leftWrapper flex sm:flex-row md:flex-col sm:w-full w-[50%] space-y-6  md:items-start sm:items-center ">
            <div className="texts flex-row">
            <h3 className="font-damion text-4xl text-primary-700">
              Flash Sale Up to 50% OFF!
            </h3>
            <p>
              Your Favorite Beauty Essentials, Now at Irresistible Prices
              Limited Time Only — While Stock Lasts!
            </p>
            </div>
            <Button variant="primary" size="md">
              See more flash sale product
            </Button>
          </div>
          <div className="md:w-[50%] sm:w-full">
            <FlashSaleCarousel />
          </div>
        </div>
      </div>

      <div className="ContainerAbbyBev py-10 px-10 space-y-16 w-full">
        <div className="max-w-[1536px] mx-auto rounded-[40px] bg-primary-50 wrapper flex-row space-y-6 p-6 outline outline-1 outline-primary-300">
          <div className="flex items-start justify-between">
            <div className="flex-row space-y-1">
              <h3 className="font-damion font-normal text-4xl text-primary-700">
                Abby's Pick
              </h3>
              <p>Your Makeup Matchmaker</p>
            </div>
            <Button variant="secondary" size="md">
              See all
            </Button>
          </div>
          <PickCarousel />
          {/* <Carousel
            SlidesPerView={5}
            products={BevPick}
            CardComponent={RegularCard}
          /> */}
        </div>

        <div className="max-w-[1536px] mx-auto rounded-[40px] bg-primary-50 wrapper flex-row space-y-6 p-6 outline-1 outline-primary-300">
          <div className="flex items-start justify-between">
            <div className="flex-row space-y-1  items-center justify-center">
              <h3 className="font-damion font-normal text-4xl text-primary-700">
                Bev's Pick
              </h3>
              <p>Your skinCare Bestie</p>
            </div>
            <Button variant="secondary" size="md">
              See all
            </Button>
          </div>
          <PickCarousel />
          {/* <Carousel
            SlidesPerView={5}
            products={BevPick}
            CardComponent={RegularCard}
          /> */}
        </div>
      </div>

      <div className="Brand-Container flex px-10 py-10 bg-primary-100 items-center justify-center space-x-6 bg-[url('/Logo_SVG_AB.svg')] bg-no-repeat bg-center">
        <div className="flex max-w-[1536px] mx-auto space-x-10">
          <div className="Wrapper flex-row w-full space-y-6">
            <h3 className="font-damion text-4xl text-primary-700">
              Shop by brands
            </h3>
            <div className="flex-row text-lg font-medium space-y-6">
              <p>
                From best-sellers to hidden gems — explore top beauty brands,
                handpicked by Abby n Bev.
              </p>
              <Button variant="primary" size="md" onClick={() => router.push("/brand")}>
                Discover more
              </Button>
            </div>
          </div>

          <div className="Conten-wrapper grid grid-cols-4 gap-6 min-w-[50%] max-w-[1536px] mx-auto">
            {DataBrand.slice(0, 8).map((item) => (
              <BrandCard key={item.id} {...item} />
            ))}
          </div>
        </div>
      </div>
      <div></div>
      <div className="Article-Container py-10 px-10 space-y-6 max-w-[1536px] mx-auto">
        <h3 className="text-primary-700 text-lg font-bold">New Posts</h3>
        <div className="grid grid-cols-3 gap-6">
          {DataArticleBlog.slice(0, 6).map((item) => (
            <BlogCard key={item.id} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}

console.log("Home render OK");
