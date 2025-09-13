"use client";
import Link from "next/link";
import styles from "../components/Carousel.module.css";
import {
  HeroSlider,
  CategoryCard,
  Button,
  Carousel,
  FlashSaleCard,
  RegularCard,
  BrandCard,
  BlogCard,
} from "../components";

import { DataCategoryCard, DataBrand, BevPick, DataArticleBlog } from "../data";

export default function Home() {
  return (
    <div className="Container flex-row items-center justify-center mx-auto">
      <div className="Hero-wrapper w-full flex justify-between h-[80vh]">
        <HeroSlider />
      </div>

      <div className="w-full h-auto flex px-10 py-16 max-w-[1536px] mx-auto ">
        <div className="flex w-full h-auto">
          <div className="Card flex items-center justify-end mr-4 text-primary-700">
            <div className="bg-primary-100 flex rounded-xl p-6 text-left space-y-4">
              <div className="space-y-4">
                <h3 className="text-[28px] font-damion">Abby</h3>
                <div className="space-y-2">
                  <p className="font-semibold">
                    Meet Abby - Your Makeup Matchmaker
                  </p>
                  <p className="text-sm">
                    From everyday essentials to bold glam, Abby helps you find
                    the best makeup that suits your style.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full h-auto">
          <div className="Card flex items-center justify-end mr-4 text-primary-700">
            <div className="bg-primary-100 flex rounded-xl p-6 text-left space-y-4">
              <div className="space-y-4">
                <h3 className="text-[28px] font-normal font-damion">Bev</h3>
                <div className="space-y-2">
                  <p className="font-semibold">
                    Say Hi to Bev – Your Skincare Bestie
                  </p>
                  <p className="text-sm">
                    Bev curates skincare that works for your skin type,
                    concerns, and routine — no guesswork needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ContainerCategory py-16 px-10 space-y-6 max-w-[1536px] mx-auto">
        <h3 className="text-primary-700 text-lg font-bold">Category</h3>
        <div className="grid grid-cols-4 gap-6">
          {DataCategoryCard.map((item) => (
            <CategoryCard key={item.id} {...item} />
          ))}
        </div>
      </div>

      <div className="ContainerFlashSale w-full flex py-16 px-10 bg-primary-100 items-center justify-center space-x-6 bg-[url('/Logo_SVG_AB.svg')] bg-no-repeat bg-center">
        <div className="Wrapper items-center w-full max-w-[1536px] mx-auto flex space-x-20">
          <div className="leftWrapper flex-row w-full space-y-6">
            <h3 className="font-damion text-4xl text-primary-700">
              Flash Sale Up to 50% OFF!
            </h3>
            <p>
              Your Favorite Beauty Essentials, Now at Irresistible Prices
              Limited Time Only — While Stock Lasts!
            </p>
            <Button variant="primary" size="md">
              See more flash sale product
            </Button>
          </div>
          <div className={`${styles.mySwiper} max-w-[50%]`}>
            <Carousel
              className="w-full"
              products={BevPick}
              CardComponent={RegularCard}
            />
          </div>
        </div>
      </div>

      <div className="ContainerAbbyBev py-16 px-10 space-y-16 w-full">
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
          <Carousel
            SlidesPerView={5}
            products={BevPick}
            CardComponent={RegularCard}
          />
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
          <Carousel
            SlidesPerView={5}
            products={BevPick}
            CardComponent={RegularCard}
          />
        </div>
      </div>

      <div className="Brand-Container flex px-10 py-16 bg-primary-100 items-center justify-center space-x-6 bg-[url('/Logo_SVG_AB.svg')] bg-no-repeat bg-center">
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
              <Button variant="primary" size="md">
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
      <div className="Article-Container py-16 px-10 space-y-6 max-w-[1536px] mx-auto">
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
