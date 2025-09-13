"use client";
import { FaStar } from "react-icons/fa";
import { BtnIconToggle } from ".";
import { useState, useEffect } from "react";
import Link from "next/link";
import { formatToRupiah } from "@/utils";

export function RegularCard({ item }) {
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
  return (
    <div className="container relative rounded-lg bg-white h-auto w-[200px] space-y-4 hover:outline outline-1 outline-primary-200 transition-all overflow-hidden">
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
          <img
            src={item.image}
            alt={item.name}
            className="w-[150px] h-auto object-contain"
          />
        </div>

        <div className="content-wrapper w-full space-y-1 p-4">
          <div className="category-and-name space-y-1">
            <div className="text-sm font-normal text-neutral-950">
              {item.category}
            </div>
            <div className="text-sm font-bold text-neutral-950 line-clamp-2">
              {item.name}
            </div>
          </div>

          <div className="price flex-row space-x-2">
            <div className="text-base font-bold text-primary-700">
              {formatToRupiah(item.price)}
            </div>
            <div className="text-xs font-medium text-neutral-400 line-through">
              {formatToRupiah(item.realprice)}
            </div>
          </div>

          <div className="rating flex space-x-3">
            <div className="flex space-x-1 items-center">
              <div className="font-bold text-primary-700">{item.rating}</div>
              <FaStar className="h-[12px] w-[12px] text-warning-300" />
            </div>
            <div className="font-medium text-neutral-300">
              {item.total_review} reviews
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
