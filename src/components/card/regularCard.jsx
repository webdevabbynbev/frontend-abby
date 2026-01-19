"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import { FaStar } from "react-icons/fa6";
import { BtnIconToggle } from "..";
import {
  formatToRupiah,
  slugify,
  getAverageRating,
  getDiscountPercent,
  applyExtraDiscount,
} from "@/utils";
import { DataReview } from "@/data";
import axios from "@/lib/axios";

const WISHLIST_KEY = "abv_wishlist_ids_v1";

const toNumberOrNaN = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
};

const normalizeExtraDiscount = (raw) => {
  if (!raw || typeof raw !== "object") return null;

  const valueType = Number(raw.valueType ?? raw.value_type ?? 1);
  const value = Number(raw.value ?? 0);
  const maxRaw = raw.maxDiscount ?? raw.max_discount;
  const maxDiscount =
    maxRaw === null || maxRaw === undefined || maxRaw === ""
      ? null
      : Number(maxRaw);
  const appliesTo = Number(raw.appliesTo ?? raw.applies_to ?? 0);

  const baseMinPrice = toNumberOrNaN(raw.baseMinPrice ?? raw.base_min_price);
  const finalMinPrice = toNumberOrNaN(raw.finalMinPrice ?? raw.final_min_price);

  const label =
    typeof raw.label === "string"
      ? raw.label.trim()
      : typeof raw.name === "string"
        ? raw.name.trim()
        : "";

  return {
    ...raw,
    valueType,
    value,
    maxDiscount,
    appliesTo,
    baseMinPrice,
    finalMinPrice,
    label,
  };
};

const buildDiscountBadge = (extra, compareAtPrice, finalPrice) => {
  if (
    !Number.isFinite(compareAtPrice) ||
    !Number.isFinite(finalPrice) ||
    compareAtPrice <= finalPrice
  ) {
    return null;
  }

  const label = extra?.label ? String(extra.label).trim() : "";
  if (label) return label;

  const valueType = Number(extra?.valueType);
  const value = Number(extra?.value ?? 0);

  if (Number.isFinite(value) && value > 0) {
    if (valueType === 2) {
      const formatted = formatToRupiah(value);
      return formatted ? `Diskon ${formatted}` : null;
    }
    if (valueType === 1) {
      return `Diskon ${value}%`;
    }
  }

  const percent = getDiscountPercent(compareAtPrice, finalPrice);
  return percent > 0 ? `Diskon ${percent}%` : null;
};

function readWishlistIds() {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
}

function writeWishlistIds(setIds) {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(Array.from(setIds)));
  } catch {}
}

export function RegularCard({ product, hrefQuery, showDiscountBadge = true }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wlPending, setWlPending] = useState(false);

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
      'unknown';

    const name = raw.name ?? raw.productName ?? raw.title ?? "Unnamed Product";
    const extra = normalizeExtraDiscount(
      raw?.extraDiscount ?? raw?.extra_discount ?? null,
    );

    // --- Price Calculation ---
    // 1. Get base prices from product data
    let basePrice = Number(raw.price ?? raw.base_price ?? raw.basePrice ?? 0);
    const baseCompareAt = Number(raw.realprice ?? raw.oldPrice ?? NaN);

    if (
      (!Number.isFinite(basePrice) || basePrice <= 0) &&
      Number.isFinite(extra?.baseMinPrice)
    ) {
      basePrice = extra.baseMinPrice;
    }

    let finalPrice = basePrice;
    let compareAtPrice =
      Number.isFinite(baseCompareAt) && baseCompareAt > finalPrice
        ? baseCompareAt
        : NaN;
    let discountBadge = null;

    // 2. Apply extraDiscount if it exists (store-wide discount)
    if (extra) {
      // appliesTo=0 means it's a store-wide discount that can be displayed everywhere
      if (Number(extra.appliesTo) === 0) {
        const priceAfterDiscount = applyExtraDiscount(extra, finalPrice);
        if (
          Number.isFinite(priceAfterDiscount) &&
          priceAfterDiscount < finalPrice
        ) {
          // If there wasn't an original sale price, the current price becomes the "compare at" price.
          if (!Number.isFinite(compareAtPrice)) {
            compareAtPrice = finalPrice;
          }
          finalPrice = priceAfterDiscount;
        }
      }
      // This handles discounts that are specific to variants, which might be pre-calculated
      else if (
        Number.isFinite(extra.finalMinPrice) &&
        extra.finalMinPrice < finalPrice
      ) {
        if (!Number.isFinite(compareAtPrice)) {
          const baseMin =
            Number.isFinite(extra.baseMinPrice) && extra.baseMinPrice > 0
              ? extra.baseMinPrice
              : finalPrice;
          compareAtPrice = baseMin;
        }
        finalPrice = extra.finalMinPrice;
      }
    }
    
    const hasAppliedDiscount = Number.isFinite(compareAtPrice) && compareAtPrice > finalPrice;

    // 3. Create the discount badge text if any discount has been applied
    if (hasAppliedDiscount && showDiscountBadge) {
      discountBadge = buildDiscountBadge(
        extra,
        compareAtPrice,
        finalPrice,
      );
    }
    
    const image =
      raw.image ??
      (Array.isArray(raw.images) ? raw.images[0] : null) ??
      'https://res.cloudinary.com/abbymedia/image/upload/v1766202017/placeholder.png';

    const slugSource = raw.slug || raw.path || '';
    const safeSlug = slugSource
      ? String(slugSource)
      : slugify(String(name || ''));

    return {
      id: String(id),
      name,
      price: finalPrice,
      compareAt: hasAppliedDiscount ? compareAtPrice : NaN,
      image,
      rating: Number(raw.rating ?? raw.stars ?? 0),
      brand:
        raw.brand?.name ??
        raw.brand?.brandname ??
        raw.brand ??
        raw.brandName ??
        '',
      category:
        raw.categoryType?.name ??
        raw.category_type?.name ??
        raw.category?.name ??
        raw.category?.categoryname ??
        raw.category ??
        raw.categoryName ??
        '',
      slug: safeSlug,
      // Keep original sale flag for the generic SVG tag, but also rely on hasAppliedDiscount
      sale: Boolean(raw.sale) || hasAppliedDiscount,
      discountBadge,
    };
  }, [product, showDiscountBadge]);

  const hasSale =
    Number.isFinite(item.compareAt) && item.compareAt > item.price;

  // ✅ init: baca cache id dari localStorage supaya icon langsung sync
  useEffect(() => {
    const ids = readWishlistIds();
    setIsWishlisted(ids.has(item.id));
  }, [item.id]);

  const updateLocal = useCallback(
    (next) => {
      const ids = readWishlistIds();
      if (next) ids.add(item.id);
      else ids.delete(item.id);
      writeWishlistIds(ids);
    },
    [item.id],
  );

  const toggleWishlist = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (wlPending) return;

      const next = !isWishlisted;

      // pakai ID yang benar untuk backend
      const productId = item.productId ?? item.id; // kalau kamu belum punya item.productId

      if (!productId) {
        console.error("Missing product_id");
        return;
      }

      // ✅ optimistic
      setIsWishlisted(next);
      updateLocal(next);
      setWlPending(true);

      try {
        if (next) {
          // ✅ ADD
          await axios.post("/wishlists", { product_id: String(productId) });
        } else {
          // ✅ DELETE (paling umum untuk axios)
          await axios.delete("/wishlists", {
            data: { product_id: String(productId) },
          });
        }

        // axios otomatis throw kalau status bukan 2xx, jadi gak perlu res.ok/res.json
      } catch (err) {
        // ❌ revert kalau gagal
        setIsWishlisted(!next);
        updateLocal(!next);

        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Wishlist request failed";
        console.error("Wishlist error:", msg);
      } finally {
        setWlPending(false);
      }
    },
    [isWishlisted, item.id, item.productId, updateLocal, wlPending],
  );

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
    <div className="group relative flex h-full w-full flex-col rounded-lg bg-white space-y-4 transition-all overflow-hidden">
      <Link href={href}>
        <div className="image flex w-full items-center justify-center relative">
          {/* Show a text badge if extraDiscount provides one */}
          {item.discountBadge ? (
            <div className="absolute top-2 left-2 z-10 bg-primary-700 text-white text-[10px] font-bold py-1 px-2 rounded">
              {item.discountBadge}
            </div>
          ) : (item.sale || hasSale) && (
            <img
              src="/sale-tag.svg"
              alt="Sale"
              className="absolute top-0 left-0 z-10 w-10 h-auto"
            />
          )}

          <div
            className={`absolute top-4 right-4 z-10 transition-all duration-200
            ${
              isWishlisted
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto"
            }`}
          >
            <BtnIconToggle
              active={isWishlisted}
              onClick={toggleWishlist}
              variant="tertiary"
              size="md"
              disabled={wlPending} // kalau BtnIconToggle support
            />
          </div>

          <div className="image w-full">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-auto object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "https://res.cloudinary.com/abbymedia/image/upload/v1766202017/placeholder.png";
              }}
            />
          </div>
        </div>

        <div className="content-wrapper w-full space-y-2 p-4">
          <div className="category-and-name space-y-1">
            <div className="text-sm font-bold text-neutral-950 line-clamp-2">
              {item.name}
            </div>
          </div>

          {showDiscountBadge && item.discountBadge ? (
            <div className="text-[10px] py-1 px-3 bg-primary-200 w-fit rounded-full text-primary-700 font-bold">
              {item.discountBadge}
            </div>
          ) : null}

          <div className="price flex items-center space-x-2">
            {hasSale ? (
              <>
                <div className="text-sm font-bold text-primary-700">
                  {formatToRupiah(item.price)}
                </div>
                <div className="text-xs font-medium text-neutral-400 line-through">
                  {formatToRupiah(item.compareAt)}
                </div>
              </>
            ) : (
              <div className="text-base font-bold text-primary-700">
                {formatToRupiah(item.price)}
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
                  <FaStar className="h-3 w-3 text-warning-300" />
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
              {item.brand || "—"}
            </p>
            <p className="text-neutral-400 absolute top-0 left-0 translate-y-6 transition-transform duration-300 group-hover:translate-y-0">
              {item.category || "—"}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
