"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatToRupiah, slugify } from "@/utils";
import { ProgressBar } from "../progress/progressBar";
import { getImageUrl } from "@/utils/getImageUrl";

export function FlashSaleCard({ product, item, hrefQuery }) {
  const toSafeNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const data = useMemo(() => {
    if (!product && !item) return null;

    const raw = product ?? item;
    const source = raw.product ?? raw;

    const name =
      source.name ?? source.productName ?? source.title ?? "Unnamed Product";

    const salePrice = Number(source.flashPrice ?? 0);
    const originalPrice = Number(source.price ?? 0);
    const hasOriginalPrice = originalPrice > 0;
    const hasPromoPrice = salePrice > 0;
    const isSale = hasPromoPrice && (!hasOriginalPrice || salePrice < originalPrice);

    const rawImage =
      source.image ??
      (Array.isArray(source.images) ? source.images[0] : null) ??
      (Array.isArray(source.medias) ? source.medias[0]?.url : null);

    const stockTotalRaw =
      source.flashStockTotal ??
      source.flash_stock_total ??
      source.promoStockTotal ??
      source.promo_stock_total ??
      source.flashStock ??
      source.flash_stock ??
      source.promoStock ??
      source.promo_stock ??
      source.stockTotal ??
      source.stock_total ??
      source.stock;

    const stockLeftRaw =
      source.flashStockLeft ??
      source.flash_stock_left ??
      source.promoStockLeft ??
      source.promo_stock_left ??
      source.stockLeft ??
      source.stock_left ??
      source.promoStock ??
      source.promo_stock ??
      source.stock;

    const totalStock = toSafeNumber(stockTotalRaw, 0);
    const leftStock = toSafeNumber(stockLeftRaw, totalStock);
    const resolvedTotal = totalStock > 0 ? totalStock : Math.max(leftStock, 0);
    const resolvedLeft =
      resolvedTotal > 0
        ? Math.min(Math.max(leftStock, 0), resolvedTotal)
        : Math.max(leftStock, 0);

    return {
      id: source.id ?? source._id ?? crypto.randomUUID(),
      name,
      price: isSale ? salePrice : originalPrice,
      compareAt: isSale && hasOriginalPrice ? originalPrice : NaN,
      image: getImageUrl(rawImage),
      brand:
        source.brand?.name ??
        source.brand?.brandname ??
        source.brand ??
        source.brandName ??
        "",
      category:
        source.categoryType?.name ??
        source.category_type?.name ??
        source.category?.name ??
        source.category?.categoryname ??
        source.category ??
        source.categoryName ??
        "",
      slug: slugify(source.slug || source.path || name || ""),
      sale: isSale,
      flashStock: resolvedTotal,
      flashStockLeft: resolvedLeft,
    };
  }, [item, product]);

  if (!data) return null;

  const queryString = useMemo(() => {
    if (!hrefQuery || typeof hrefQuery !== "object") return "";
    const params = new URLSearchParams();
    Object.entries(hrefQuery).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "")
        params.set(k, String(v));
    });
    return params.toString();
  }, [hrefQuery]);

  const href = data.slug
    ? `/${encodeURIComponent(data.slug)}${queryString ? `?${queryString}` : ""}`
    : "#";

  const flashStock = data.flashStock ?? 0;
  const flashStockLeft = data.flashStockLeft ?? 0;
  const progress =
    flashStock > 0 ? Math.round((flashStockLeft / flashStock) * 100) : 0;

  return (
    <div className="group relative flex h-full w-full flex-col rounded-3xl bg-white space-y-4 overflow-hidden">
      <Link href={href}>
        <div className="relative">
          <img
            src={data.image}
            alt={data.name}
            className="w-full h-auto object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = getImageUrl(null);
            }}
          />
        </div>

        <div className="p-4 space-y-2">
          <div className="text-sm font-bold line-clamp-2">{data.name}</div>

          <div className="flex gap-2 items-center">
            <span className="font-bold text-primary-700">
              {formatToRupiah(data.price)}
            </span>
            {Number.isFinite(data.compareAt) && (
              <span className="text-xs line-through text-neutral-400">
                {formatToRupiah(data.compareAt)}
              </span>
            )}
          </div>

          <ProgressBar value={progress} height={6} />

          <p className="text-xs text-neutral-500">
            Tersisa{" "}
            <span className="font-bold text-primary-700">
              {flashStockLeft}
            </span>{" "}
            dari {flashStock}
          </p>
        </div>
      </Link>
    </div>
  );
}
