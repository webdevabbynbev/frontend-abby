"use client";
import { FaStar } from "react-icons/fa";
import { BtnIconToggle } from ".";
import { useState, useEffect } from "react";
import Link from "next/link";
import { formatToRupiah } from "@/utils";
import { DataReview } from "@/data";
import { getAverageRating } from "@/utils";

export function RegularCard( props ) {
  const item = props;

  const [wishlist, setWishlist] = useState([]);


  useEffect(() => {
    const stored = localStorage.getItem("wishlist");
    if (stored) {
      setWishlist(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const handleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isWishlisted = wishlist.some((p) => p.id === item.id);
  if (!item) return null;

  const reviewsForProduct = DataReview.filter((r) => r.productID === item.id);
  const averageRating = getAverageRating(reviewsForProduct);

  return (
    <div className="container group relative rounded-lg bg-white h-auto w-[200px] space-y-4 transition-all overflow-hidden">
      <Link key={`flash-${item.id}`} href={`/product-detail/${item.slug}`}>
        <div className="image flex w-full items-center justify-center relative">
          {/* Sale tag */}
          {item.sale && (
            <img
              src="/sale-tag.svg"
              alt="Sale"
              className="absolute top-0 left-0 z-10 w-[40px] h-auto"
            />
          )}

          {/* Favorite button */}
          <div className="absolute top-4 right-4 z-10">
            <BtnIconToggle
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleWishlist(item);
              }}
              iconName="Heart"
              variant="tertiary"
              size="md"
            >
              {isWishlisted ? "Heart" : "Heart"}
            </BtnIconToggle>
          </div>

          {/* name image */}
          <div className="image object-cover">
            <img
              src={item.image}
              alt={item.name}
              className="w-[150px] h-auto"
            />
          </div>
        </div>

        <div className="content-wrapper w-full space-y-2 p-4">
          <div className="category-and-name space-y-1">
            <div className="text-sm font-bold text-neutral-950 line-clamp-2">
              {item.name}
            </div>
          </div>
          <div className="price flex items-center space-x-2">
            {item.sale && (
              <div className="text-base font-bold text-primary-700">
                {formatToRupiah(item.price)}
              </div>
            )}
            {item.sale ? (
              <div className="text-xs font-medium text-neutral-400 line-through">
                {formatToRupiah(item.realprice)}
              </div>
            ) : (
              <div className="text-base font-bold text-primary-700">
                {formatToRupiah(item.realprice)}
              </div>
            )}
          </div>

          <div className="rating flex space-x-2 items-center">
            <div className="flex space-x-1 items-center">
              {averageRating === 0 ? (
                <span className="text-xs text-primary-700 font-light">
                  No rating
                </span>
              ) : (
                <div className="flex items-center space-x-1 font-bold text-primary-700 text-xs">
                  <span>{averageRating}</span>
                  <FaStar className="h-[12px] w-[12px] text-warning-300" />
                </div>
              )}
            </div>
            <div className="w-1 h-1 rounded-full bg-neutral-400" />
            <div className="text-xs font-light text-neutral-300">
              ({reviewsForProduct.length} reviews)
            </div>
          </div>
          <div className="text-xs category-brand flex flex-row relative items-center space-x-1.5 overflow-hidden h-6">
            <p className="text-neutral-400 transition-transform duration-300 group-hover:-translate-y-6">
              {item.category}
            </p>
            <p className="text-neutral-400 absolute top-0 left-0 translate-y-6 transition-transform duration-300 group-hover:translate-y-0">
              {item.brand}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
