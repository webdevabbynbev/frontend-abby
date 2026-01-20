"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatToRupiah, slugify } from "@/utils";
import { ProgressBar } from "../progress/progressBar";
import { getImageUrl } from "@/utils/getImageUrl";

export function FlashSaleCard({ product, item, hrefQuery }) {
  const flashStock = 100;
  const flashStockLeft = 10;

  const data = useMemo(() => {
    if (!product && !item) return null;

    const raw = product ?? item;
    const source = raw.product ?? raw;

    const name =
      source.name ?? source.productName ?? source.title ?? "Unnamed Product";

    const salePrice = Number(source.flashPrice ?? 0);
    const originalPrice = Number(source.price ?? 0);
    const isSale = salePrice > 0 && salePrice < originalPrice;

    const rawImage =
      source.image ??
      (Array.isArray(source.images) ? source.images[0] : null) ??
      (Array.isArray(source.medias) ? source.medias[0]?.url : null);

    return {
      id: source.id ?? source._id ?? crypto.randomUUID(),
      name,
      price: isSale ? salePrice : originalPrice,
      compareAt: isSale ? originalPrice : NaN,
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
    };
  }, [product, item]);

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

  const progress = Math.round((flashStockLeft / flashStock) * 100);

  return (
    <div className="group relative flex h-full w-full flex-col rounded-lg bg-white space-y-4 overflow-hidden">
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
