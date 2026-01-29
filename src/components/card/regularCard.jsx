"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import { FaStar } from "react-icons/fa6";
import { BtnIconToggle, Button, BtnIconn, BtnIcon } from "..";
import {
  formatToRupiah,
  slugify,
  getDiscountPercent,
  applyExtraDiscount,
} from "@/utils";
import { getImageUrl } from "@/utils/getImageUrl";
import { DataReview } from "@/data";
import { useAuth } from "@/context/AuthContext";
import { useLoginModal } from "@/context/LoginModalContext";
import axios from "@/lib/axios.js";
import { toast } from "sonner";
import { updateCartCache } from "@/utils/cartCache";
import { addToGuestCart } from "@/utils/guestCart";

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
  const eligibleMinPrice = toNumberOrNaN(
    raw.eligibleMinPrice ?? raw.eligible_min_price,
  );
  const eligibleMaxPrice = toNumberOrNaN(
    raw.eligibleMaxPrice ?? raw.eligible_max_price,
  );

  const eligibleVariantIdsRaw =
    raw.eligibleVariantIds ?? raw.eligible_variant_ids ?? [];
  const eligibleVariantIds = Array.isArray(eligibleVariantIdsRaw)
    ? eligibleVariantIdsRaw
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0)
    : [];

  let eligibleVariantCount = Number(
    raw.eligibleVariantCount ?? raw.eligible_variant_count ?? NaN,
  );
  if (!Number.isFinite(eligibleVariantCount) || eligibleVariantCount < 0) {
    eligibleVariantCount = eligibleVariantIds.length
      ? eligibleVariantIds.length
      : null;
  }

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
    eligibleMinPrice,
    eligibleMaxPrice,
    eligibleVariantCount,
    eligibleVariantIds,
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

  const { user, logout } = useAuth() ?? {};
  const { openLoginModal } = useLoginModal();

  if (!product) return null;

  const handleAddToCart = useCallback(
    async (event) => {
      event?.preventDefault?.();
      event?.stopPropagation?.();

      try {
        console.log('🎯 [RegularCard] Add to cart clicked, product:', product);
        
        if (!product?.id) {
          console.error('❌ [RegularCard] Product id tidak ditemukan:', product);
          toast("Product id tidak ditemukan");
          return;
        }

        const variantItems = product?.variantItems ?? [];
        const variant =
          variantItems?.[0] ??
          product?.variant ??
          product?.variants?.[0] ??
          null;

        console.log('🔍 [RegularCard] Product ID:', product.id);
        console.log('🔍 [RegularCard] Variant items:', variantItems);
        console.log('🔍 [RegularCard] Selected variant:', variant);

        if (!variant) {
          console.error('❌ [RegularCard] Varian produk tidak ditemukan');
          toast("Varian produk tidak ditemukan");
          return;
        }

        // Guest users: add to localStorage
        if (!user) {
          console.log('🛒 [RegularCard] Adding to guest cart:', { product, variant });
          const updatedCart = addToGuestCart(product, variant, 1);
          console.log('📦 [RegularCard] Guest cart after add:', updatedCart);
          
          // Trigger cart update event for badge and cart page
          if (typeof window !== "undefined") {
            updateCartCache(updatedCart);
          }
          
          toast("Produk berhasil dimasukkan ke keranjang");
          return;
        }

        // Authenticated users: add via API
        const payload = {
          product_id: product.id,
          variant_id: variant?.id ?? 0,
          qty: 1,
          attributes: [],
          is_buy_now: false,
        };

        console.log('📤 [RegularCard] Sending payload:', payload);
        const res = await axios.post("/cart", payload);
        console.log('✅ [RegularCard] API response:', res.data);
        toast(res.data?.message || "Produk berhasil dimasukkan ke keranjang");

        if (typeof window !== "undefined") {
          try {
            const cartRes = await axios.get("/cart");
            const items =
              cartRes.data?.serve?.data ||
              cartRes.data?.data?.items ||
              cartRes.data?.data ||
              [];
            updateCartCache(Array.isArray(items) ? items : []);
          } catch (err) {
            console.warn("Failed to sync cart:", err);
          }
        }
      } catch (error) {
        console.error('❌ [RegularCard] Error adding to cart:', error);
        const isUnauthorized = error?.response?.status === 401;
        const msg = isUnauthorized
          ? "Sesi kamu habis. Silakan login ulang."
          : error?.response?.data?.message ||
            "Terjadi kesalahan saat menambah ke keranjang";
        toast(msg);

        if (isUnauthorized && user && typeof window !== "undefined") {
          await logout();
        }
      }
    },
    [logout, product, user],
  );

  const item = useMemo(() => {
    const raw = product;

    const productId =
      raw.product?.id ??
      raw.productId ??
      raw.product_id ??
      raw.id ??
      raw._id ??
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

    if (extra) {
      const appliesTo = Number(extra.appliesTo);
      const extraBaseMin = extra.baseMinPrice;
      const extraEligibleMin = Number.isFinite(extra.eligibleMinPrice)
        ? extra.eligibleMinPrice
        : extraBaseMin;
      const extraFinalMin = extra.finalMinPrice;
      const hasExtraRange =
        Number.isFinite(extraEligibleMin) &&
        Number.isFinite(extraFinalMin) &&
        extraFinalMin < extraEligibleMin;
      const eligibleVariantCount = Number(extra.eligibleVariantCount ?? 0);
      const hasEligibleVariants =
        appliesTo === 3
          ? eligibleVariantCount > 0 ||
            (Array.isArray(extra.eligibleVariantIds) &&
              extra.eligibleVariantIds.length > 0)
          : true;

      if (appliesTo === 0) {
        const priceAfterDiscount = applyExtraDiscount(extra, finalPrice);
        if (
          Number.isFinite(priceAfterDiscount) &&
          priceAfterDiscount < finalPrice
        ) {
          if (!Number.isFinite(compareAtPrice)) {
            compareAtPrice = finalPrice;
          }
          finalPrice = priceAfterDiscount;
        }
      } else if (hasExtraRange) {
        const shouldUseEligibleRange =
          appliesTo !== 3 ||
          !Number.isFinite(basePrice) ||
          extraFinalMin <= basePrice;
        if (shouldUseEligibleRange) {
          compareAtPrice = extraEligibleMin;
          finalPrice = extraFinalMin;
        }
      } else if (
        Number.isFinite(extraFinalMin) &&
        extraFinalMin < finalPrice &&
        hasEligibleVariants
      ) {
        if (!Number.isFinite(compareAtPrice)) {
          const baseMin =
            Number.isFinite(extraEligibleMin) && extraEligibleMin > 0
              ? extraEligibleMin
              : finalPrice;
          compareAtPrice = baseMin;
        }
        finalPrice = extraFinalMin;
      }
    }

    const hasAppliedDiscount =
      Number.isFinite(compareAtPrice) && compareAtPrice > finalPrice;

    if (hasAppliedDiscount && showDiscountBadge) {
      discountBadge = buildDiscountBadge(extra, compareAtPrice, finalPrice);
    } else if (showDiscountBadge && extra) {
      const appliesTo = Number(extra.appliesTo);
      const eligibleVariantCount = Number(extra.eligibleVariantCount ?? 0);
      const hasEligibleVariants =
        appliesTo === 3
          ? eligibleVariantCount > 0 ||
            (Array.isArray(extra.eligibleVariantIds) &&
              extra.eligibleVariantIds.length > 0)
          : false;

      if (hasEligibleVariants) {
        const eligibleMin = Number.isFinite(extra.eligibleMinPrice)
          ? extra.eligibleMinPrice
          : extra.baseMinPrice;
        const eligibleFinal = extra.finalMinPrice;
        discountBadge =
          buildDiscountBadge(extra, eligibleMin, eligibleFinal) ??
          (extra.label ? String(extra.label).trim() : null);
      }
    }

    const image =
      raw.image ??
      (Array.isArray(raw.images) ? raw.images[0] : null) ??
      getImageUrl();

    const slugSource = raw.slug || raw.path || "";
    const safeSlug = slugSource
      ? String(slugSource)
      : slugify(String(name || ""));

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
      sale: Boolean(raw.sale) || hasAppliedDiscount,
      discountBadge,
    };
  }, [product, showDiscountBadge]);

  const hasSale =
    Number.isFinite(item.compareAt) && item.compareAt > item.price;
  const wishlistId = item.productId;
  const wishlistDisabled = !wishlistId || wlPending;

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

      // Check if user is logged in
      if (!user) {
        openLoginModal();
        return;
      }

      const next = !isWishlisted;

      if (!wishlistId) {
        return;
      }

      const productId = wishlistId;

      // ✅ optimistic
      setIsWishlisted(next);
      updateLocal(next);
      setWlPending(true);

      try {
        if (next) {
          await axios.post("/wishlists", {
            product_id: String(productId),
          });
        } else {
          await axios.delete("/wishlists", {
            data: { product_id: String(productId) },
          });
        }
      } catch (err) {
        setIsWishlisted(!next);
        updateLocal(!next);

        // Handle 401 Unauthorized error
        const statusCode = err?.response?.status;
        const errorMessage = err?.response?.data?.message || err?.message;

        if (statusCode === 401 || errorMessage?.includes("Unauthorized")) {
          openLoginModal();
        }
      } finally {
        setWlPending(false);
      }
    },
    [isWishlisted, updateLocal, wishlistId, wlPending, user, openLoginModal],
  );

  const reviewKey = item.productId ?? item.id;
  const reviewStats = REVIEW_STATS.get(String(reviewKey)) || EMPTY_REVIEW_STATS;
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
    <div className="group relative flex h-full w-full flex-col rounded-3xl bg-white transition-all overflow-hidden">
      <Link href={href}>
        <div className="image flex w-full items-center justify-center rounded-3xl">
          {/* Show a text badge if extraDiscount provides one */}
          {item.discountBadge ? (
            <div className="absolute top-2 left-2 z-10 bg-primary-700 text-white text-[10px] rounded-3xl font-bold py-1 px-2">
              {item.discountBadge}
            </div>
          ) : (
            (item.sale || hasSale) && (
              <img
                src="/sale-tag.svg"
                alt="Sale"
                className="absolute top-0 left-0 z-10 w-10 h-auto"
              />
            )
          )}

          <div className="image w-full">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-auto object-cover"
              onError={(e) => {
                e.currentTarget.src = getImageUrl();
              }}
            />
          </div>
        </div>

        <div className="content-wrapper flex flex-col w-full gap-2 p-4">
          <div className="brand-product-title flex flex-col gap-1">
            <p className="text-neutral-900 font-bold">{item.brand || "—"}</p>

            <div className="text-xs font-normal text-neutral-950 w-full line-clamp-1">
              {item.name}
            </div>
          </div>

          <div className="price flex flex-col lg:flex-row gap-1">
            {hasSale ? (
              <>
                <div className="text-sm font-bold text-primary-700">
                  {formatToRupiah(item.price)}
                </div>
                <div className="text-[11px] font-medium text-neutral-400 line-through">
                  {formatToRupiah(item.compareAt)}
                </div>
              </>
            ) : (
              <div className="text-sm font-bold text-primary-700">
                {formatToRupiah(item.price)}
              </div>
            )}
          </div>

          {/* <div className="rating flex gap-1 items-center">
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
            <div className="block items-center w-1 h-1 rounded-full bg-neutral-400" />
            <div className="text-xs font-light text-neutral-300">
              ({reviewCount})
            </div>
          </div> */}
          <div className="hidden opacity-0 absolute left-0 bg-white -bottom-4 flex-row w-full group-hover:-bottom-2 transition-all p-4 justify-center group-hover:opacity-100">
            <div className="button w-full flex space-x-2">
              <Button
                iconName="CartPlus"
                variant="primary"
                size="sm"
                className="w-full"
                onClick={handleAddToCart}
              >
                Add to cart
              </Button>
            </div>
            <div
              className={`z-10 transition-all duration-200
              ${
                isWishlisted ? "scale-100" : "group-hover:pointer-events-auto"
              }`}
            ></div>
          </div>
          <div className="flex flex-row w-full gap-2">
            <div className="button-cart w-full">
              <Button
                iconName="CartPlus"
                variant="secondary"
                size="md"
                className="w-full"
                onClick={handleAddToCart}
              >
                <p className="text-sm">Add to cart</p>
              </Button>
            </div>
            <div className="button-wishlist hidden lg:block">
              <BtnIconToggle
                active={isWishlisted}
                onClick={toggleWishlist}
                variant="secondary"
                size="sm"
                disabled={wishlistDisabled}
              />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
