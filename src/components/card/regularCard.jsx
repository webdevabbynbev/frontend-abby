"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import { FaStar } from "react-icons/fa6";
import { BtnIconToggle } from "..";
import {
  formatToRupiah,
  slugify,
  getDiscountPercent,
  applyExtraDiscount,
} from "@/utils";
import { DataReview } from "@/data";
import axios from "@/lib/axios";

const WISHLIST_KEY = "abv_wishlist_ids_v1";

const canUseStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

let wishlistCache = null;
let wishlistLoaded = false;
const wishlistListeners = new Set();
let storageListenerBound = false;

const loadWishlistCache = () => {
  if (wishlistLoaded) return;
  wishlistLoaded = true;
  wishlistCache = new Set();
  if (!canUseStorage()) return;
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (Array.isArray(arr)) {
      wishlistCache = new Set(arr.map(String));
    }
  } catch {}
};

const notifyWishlistListeners = () => {
  wishlistListeners.forEach((listener) => listener());
};

const syncWishlistFromStorage = () => {
  if (!canUseStorage()) return;
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    wishlistCache = new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    wishlistCache = new Set();
  }
};

const ensureStorageListener = () => {
  if (storageListenerBound || !canUseStorage()) return;
  storageListenerBound = true;
  window.addEventListener("storage", (event) => {
    if (event.key !== WISHLIST_KEY) return;
    syncWishlistFromStorage();
    notifyWishlistListeners();
  });
};

const getWishlistCache = () => {
  loadWishlistCache();
  ensureStorageListener();
  return wishlistCache ?? new Set();
};

const setWishlistCache = (nextSet) => {
  wishlistCache = new Set(nextSet);
  if (canUseStorage()) {
    try {
      localStorage.setItem(
        WISHLIST_KEY,
        JSON.stringify(Array.from(wishlistCache)),
      );
    } catch {}
  }
  notifyWishlistListeners();
};

const subscribeWishlist = (listener) => {
  wishlistListeners.add(listener);
  return () => wishlistListeners.delete(listener);
};

const isWishlistedCached = (id) => {
  if (!id) return false;
  return getWishlistCache().has(String(id));
};

const updateWishlistCache = (id, next) => {
  if (!id) return;
  const cache = getWishlistCache();
  const nextSet = new Set(cache);
  if (next) nextSet.add(String(id));
  else nextSet.delete(String(id));
  setWishlistCache(nextSet);
};

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

const EMPTY_REVIEW_STATS = { count: 0, sum: 0 };

const REVIEW_STATS = (() => {
  if (!Array.isArray(DataReview)) return new Map();
  const map = new Map();
  DataReview.forEach((review) => {
    const key =
      review?.productID ?? review?.productId ?? review?.product_id ?? null;
    if (key === null || key === undefined) return;
    const rating = Number(review?.rating ?? 0);
    const normalizedKey = String(key);
    const entry = map.get(normalizedKey);
    if (entry) {
      entry.count += 1;
      entry.sum += Number.isFinite(rating) ? rating : 0;
    } else {
      map.set(normalizedKey, {
        count: 1,
        sum: Number.isFinite(rating) ? rating : 0,
      });
    }
  });
  return map;
})();

export function RegularCard({ product, hrefQuery, showDiscountBadge = true }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wlPending, setWlPending] = useState(false);

  if (!product) return null;

  const item = useMemo(() => {
    const raw = product;

    const productId =
      raw.id ??
      raw._id ??
      raw.productId ??
      raw.product_id ??
      null;

    const id =
      productId ??
      raw.slug ??
      raw.sku ??
      raw.code ??
      raw.name ??
      raw.productName ??
      raw.title ??
      "unknown";

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
      productId:
        productId === null || productId === undefined
          ? null
          : String(productId),
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
  const wishlistId = item.productId;
  const wishlistDisabled = !wishlistId || wlPending;

  // ✅ init: baca cache id dari localStorage supaya icon langsung sync
  useEffect(() => {
    if (!wishlistId) {
      setIsWishlisted(false);
      return undefined;
    }

    const sync = () => {
      setIsWishlisted(isWishlistedCached(wishlistId));
    };

    sync();
    return subscribeWishlist(sync);
  }, [wishlistId]);

  const updateLocal = useCallback(
    (next) => {
      if (!wishlistId) return;
      updateWishlistCache(wishlistId, next);
    },
    [wishlistId],
  );

  const toggleWishlist = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (wlPending) return;

      const next = !isWishlisted;

      const productId = wishlistId;

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
    [isWishlisted, updateLocal, wishlistId, wlPending],
  );

  const reviewKey = item.productId ?? item.id;
  const reviewStats =
    REVIEW_STATS.get(String(reviewKey)) || EMPTY_REVIEW_STATS;
  const averageRating = reviewStats.count
    ? (reviewStats.sum / reviewStats.count).toFixed(1)
    : 0;
  const reviewCount = reviewStats.count;

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
              disabled={wishlistDisabled} // kalau BtnIconToggle support
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
              ({reviewCount} reviews)
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
