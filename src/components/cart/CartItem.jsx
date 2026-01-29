"use client";

import Image from "next/image";
import Link from "next/link";
import {
    Button,
  Checkbox,
  QuantityInput,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import { formatToRupiah } from "@/utils";
import { getImageUrl } from "@/utils/getImageUrl";
import {
  getStock,
  getQuantity,
  getMaxQty,
  getUnitPrice,
  getLineTotal,
  getVariantDisplayName,
  extractProductId,
  extractCurrentVariantId,
  getAvailableVariants,
} from "@/utils/cartHelpers";

export default function CartItem({
  item,
  isSelected,
  isBusy,
  isDeleting,
  isChangingVariant,
  productVariants,
  onToggleSelect,
  onUpdateQty,
  onChangeVariant,
  onDelete,
  isGrouped = false, // New prop for grouped mode
  hideCheckbox = false, // Hide individual checkbox in group mode
}) {
  const quantity = getQuantity(item);
  const maxQty = getMaxQty(item);
  const productName = item?.product?.name || item?.product_name || "-";
  const productId = extractProductId(item);
  const currentVariantId = extractCurrentVariantId(item);
  const availableVariants = getAvailableVariants(item, productVariants);
  const hasVariants = availableVariants.length > 1;

  const currentVariant =
    availableVariants.find((v) => Number(v.id) === Number(currentVariantId)) ||
    item?.variant;
  const currentVariantDisplayName = getVariantDisplayName(currentVariant);

  // Extract brand from multiple possible paths
  const brandName =
    item?.product?.brand?.name ||
    item?.brand?.name ||
    item?.product?.$attributes?.brand?.name ||
    item?.product?.$preloaded?.brand?.name ||
    null;
  const brandSlug =
    item?.product?.brand?.slug ||
    item?.brand?.slug ||
    item?.product?.$attributes?.brand?.slug ||
    item?.product?.$preloaded?.brand?.slug ||
    null;

  return (
    <div
      className={
        isGrouped
          ? "p-4 md:p-5"
          : "bg-white border border-gray-100 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow duration-150 relative"
      }
    >
      {/* Brand at top-left - only show if not grouped */}
      {!isGrouped && brandName && brandSlug && (
        <Link
          href={`/brand/${brandSlug}`}
          className="absolute top-3 left-3 text-[10px] md:text-xs text-primary-600 hover:text-primary-700 font-semibold bg-primary-50 px-2 py-1 rounded transition-colors z-10"
        >
          {brandName}
        </Link>
      )}

      {/* Mobile Layout */}
      <div className="md:hidden space-y-3">
        <div className={`flex gap-3 items-start ${!isGrouped ? "mt-6" : ""}`}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(v) => onToggleSelect(Number(item.id), v === true)}
          />
          <Image
            src={getImageUrl(item?.product?.image)}
            width={80}
            height={80}
            alt={productName}
            className="rounded-lg border border-gray-200 object-cover flex-shrink-0 aspect-square"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-neutral-900 text-sm line-clamp-2">
              {productName}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-neutral-600 font-medium whitespace-nowrap">
                Variant:
              </span>
              <Select
                value={String(currentVariantId)}
                onValueChange={(value) => onChangeVariant(item.id, value)}
                disabled={!hasVariants || isChangingVariant}
              >
                <SelectTrigger className="h-7 text-xs w-fit">
                  <SelectValue>{currentVariantDisplayName}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {availableVariants.map((variant) => {
                      const variantThumb = Array.isArray(variant?.images)
                        ? variant.images[0]
                        : null;
                      const variantDisplayName = getVariantDisplayName(variant);

                      return (
                        <SelectItem key={variant.id} value={String(variant.id)}>
                          <div className="flex items-center gap-2 w-fit">
                            {variantThumb && (
                              <img
                                src={variantThumb}
                                alt={variantDisplayName}
                                className="h-5 w-5 rounded object-cover"
                              />
                            )}
                            <span>{variantDisplayName}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-neutral-600 font-medium">
                Harga:
              </span>
              <p className="text-xs text-primary-700 font-semibold">
                {formatToRupiah(getUnitPrice(item))}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between gap-2">
              
              <span className="text-xs text-neutral-500">
                Stok: {getStock(item)}
              </span>
              <span className="text-sm font-bold text-primary-700">
                {formatToRupiah(getLineTotal(item))}
              </span>
            </div>

            <button
              className="text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
              onClick={() => onDelete(item)}
              disabled={isBusy || isDeleting}
              type="button"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className={`flex gap-4 items-start ${!isGrouped ? "mt-6" : ""}`}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(v) => onToggleSelect(Number(item.id), v === true)}
          />
          <div className="flex gap-4 flex-1">
            <Image
              src={getImageUrl(item?.product?.image)}
              width={96}
              height={96}
              alt={productName}
              className="rounded-lg border border-gray-200 object-cover flex-shrink-0 aspect-square"
            />
            <div className="space-y-2 flex-1">
              <p className="font-semibold text-neutral-900 line-clamp-2">
                {productName}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600 font-medium whitespace-nowrap">
                  Variant:
                </span>
                <Select
                  value={String(currentVariantId)}
                  onValueChange={(value) => onChangeVariant(item.id, value)}
                  disabled={!hasVariants || isChangingVariant}
                >
                  <SelectTrigger className="h-8 text-xs w-fit">
                    <SelectValue>{currentVariantDisplayName}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {availableVariants.map((variant) => {
                        const variantThumb = Array.isArray(variant?.images)
                          ? variant.images[0]
                          : null;
                        const variantDisplayName =
                          getVariantDisplayName(variant);

                        return (
                          <SelectItem
                            key={variant.id}
                            value={String(variant.id)}
                          >
                            <div className="flex items-center gap-2">
                              {variantThumb && (
                                <img
                                  src={variantThumb}
                                  alt={variantDisplayName}
                                  className="h-6 w-6 rounded object-cover"
                                />
                              )}
                              <span>{variantDisplayName}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600 font-medium">
                  Harga:
                </span>
                <p className="text-sm font-semibold text-primary-700">
                  {formatToRupiah(getUnitPrice(item))}
                </p>
              </div>
            </div>
            <QuantityInput
              value={quantity}
              min={1}
              max={maxQty}
              disabled={isBusy}
              onChange={(v) => onUpdateQty(item, v)}
            />
            <div className="text-right">
              <p className="text-xs text-neutral-500">Stok: {getStock(item)}</p>
              <p className="text-lg font-bold text-primary-700 mt-1">
                {formatToRupiah(getLineTotal(item))}
              </p>
            </div>
            <Button
              className="text-xs font-medium px-2 py-1 rounded transition-colors disabled:opacity-50"
              onClick={() => onDelete(item)}
              disabled={isBusy || isDeleting}
              variant="teriary"
              size="md"
            >
              Hapus
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
