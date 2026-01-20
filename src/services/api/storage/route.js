"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FaStar } from "react-icons/fa6";
import { BtnIconToggle } from "..";
import { formatToRupiah, slugify, getAverageRating } from "@/utils";
import { DataReview } from "@/data";
import { getImageUrl } from "@/lib/getImageUrl";

export function RegularCard({ product, hrefQuery }) {
  const [wishlist, setWishlist] = useState([]);

  if (!product) return null;

  const item = useMemo(() => {
    const raw = product;

    const id =
      raw.id ??
      raw._id ??
      raw.slug ??
      raw.sku ??
      raw.code ??
      raw.name ??
      raw.productName ??
      raw.title ??
      "unknown";

    const name = raw.name ?? raw.productName ?? raw.title ?? "Unnamed Product";

    const price = Number(
      raw.price ??
        raw.base_price ??
        raw.basePrice ??
        raw.salePrice ??
        (Array.isArray(raw.prices) ? raw.prices[0] : undefined) ??
        0
    );

    const compareAt = Number(
      raw.realprice ??
        raw.oldPrice ??
        (Array.isArray(raw.prices) ? raw.prices[1] : undefined) ??
        NaN
    );

    const image = getImageUrl(
      raw.image || (Array.isArray(raw.images) ? raw.images[0] : null)
    );

    const slugSource = raw.slug || raw.path || "";
    const safeSlug = slugSource
      ? String(slugSource)
      : slugify(String(name || ""));

    return {
      id: String(id),
      name,
      price,
      compareAt,
      image, // ✅ STRING URL
      rating: Number(raw.rating ?? raw.stars ?? 0),
      brand:
        raw.brand?.name ??
        raw.brand?.brandname ??
        raw.brand ??
        raw.brandName ??
        "",
      category:
        raw.categoryType?.name ??
        raw.category_type?.name ??
        raw.category?.name ??
        raw.category?.categoryname ??
        raw.category ??
        raw.categoryName ??
        "",
      slug: safeSlug,
      sale: Boolean(raw.sale),
    };
  }, [product]);

  const hasSale =
    Number.isFinite(item.compareAt) && item.compareAt > item.price;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("wishlist");
      if (stored) setWishlist(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  const handleWishlist = () => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      return exists ? prev.filter((p) => p.id !== item.id) : [...prev, item];
    });
  };

  const isWishlisted = wishlist.some((p) => p.id === item.id);

  const reviewsForProduct = Array.isArray(DataReview)
    ? DataReview.filter((r) => r.productID === item.id)
    : [];

  const averageRating = getAverageRating(reviewsForProduct);

  const queryString = useMemo(() => {
    if (!hrefQuery || typeof hrefQuery !== "object") return "";
    const params = new URLSearchParams();

    Object.entries(hrefQuery).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      params.set(key, String(value));
    });

    return params.toString();
  }, [hrefQuery]);

  const slugHref = item.slug ? `/${encodeURIComponent(item.slug)}` : "#";
  const href = queryString ? `${slugHref}?${queryString}` : slugHref;

  return (
    <div className="group relative flex h-full w-full flex-col rounded-lg bg-white space-y-4 overflow-hidden">
      <Link href={href}>
        <div className="relative flex w-full items-center justify-center">
          {(item.sale || hasSale) && (
            <img
              src="/sale-tag.svg"
              alt="Sale"
              className="absolute top-0 left-0 z-10 w-10 h-auto"
            />
          )}

          <div className="absolute top-4 right-4 z-10">
            <BtnIconToggle
              active={isWishlisted}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleWishlist();
              }}
              variant="tertiary"
              size="md"
            />
          </div>

          <img
            src={item.image}
            alt={item.name}
            className="w-full h-auto object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = getImageUrl(null);
            }}
          />
        </div>

        <div className="space-y-2 p-4">
          <div className="text-sm font-bold text-neutral-950 line-clamp-2">
            {item.name}
          </div>

          <div className="flex items-center space-x-2">
            {hasSale ? (
              <>
                <div className="text-sm font-bold text-primary-700">
                  {formatToRupiah(item.price)}
                </div>
                <div className="text-xs text-neutral-400 line-through">
                  {formatToRupiah(item.compareAt)}
                </div>
              </>
            ) : (
              <div className="text-base font-bold text-primary-700">
                {formatToRupiah(item.price)}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs">
            {averageRating === 0 ? (
              <span className="text-primary-700">No rating</span>
            ) : (
              <>
                <span className="font-bold text-primary-700">
                  {averageRating}
                </span>
                <FaStar className="h-3 w-3 text-warning-300" />
              </>
            )}
            <span className="text-neutral-300">
              ({reviewsForProduct.length} reviews)
            </span>
          </div>

          <div className="text-xs text-neutral-400 h-6 overflow-hidden">
            {item.brand || item.category || "—"}
          </div>
        </div>
      </Link>
    </div>
  );
}
