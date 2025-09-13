"use client";
import { BtnIconToggle } from ".";

import Link from "next/link";

export function FlashSaleCard({
  item,
  // total,
  // sold,
  // image,
  // category,
  // name,
  // price,
  // realPrice,
}) {
  const percent = Math.min((item.sold / item.total) * 100, 100);

  let barColor = "bg-green-500";
  if (percent <= 50) barColor = "bg-yellow-500";
  if (percent <= 10) barColor = "bg-red-500";

  return (
    <div className="container relative rounded-lg bg-white h-auto w-[200px] space-y-4 hover:outline outline-1 outline-primary-200 transition-all overflow-hidden">
      <div className="image flex w-full items-center justify-center relative">
        {/* Pakai Tag.svg khusus untuk FlashSale */}
        <img
          src="/Tag.svg"
          alt="Flash sale"
          className="absolute top-0 left-0 z-10 w-[80px] h-auto"
        />

        {/* Favorite button */}
        <div className="absolute top-4 right-4 z-10">
          <BtnIconToggle iconName="Heart" variant="tertiary" size="md" />
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
          <h3 className="text-sm font-bold text-neutral-950 line-clamp-2">
            {item.name}
          </h3>
        </div>

        <div className="price flex-row">
          <p className="text-base font-bold text-primary-700">{item.price}</p>
          <p className="text-sm font-medium text-neutral-400 line-through">
            {item.realprice}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">Tersisa {item.sold}</p>
      </div>
    </div>
  );
}
