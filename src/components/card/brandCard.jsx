"use client";
import Link from "next/link";
import { getImageUrl } from "@/utils/getImageUrl";

export function BrandCard({ logo, brandname, slug }) {
  const brandLogo = getImageUrl(logo);
  const content = (
    <div className="flex w-full flex-row items-center justify-center rounded-xl bg-white transition-all gap-2">
      <div className="flex h-12 w-12 items-center justify-center">
        <img
          src={brandLogo}
          alt={brandname}
          className="h-full w-full object-contain rounded-sm"
        />
      </div>
      <span className="text-sm font-medium text-primary-700 text-center line-clamp-1">
        {brandname || "—"}
      </span>
    </div>
  );

  return (
    <div className="bg-white p-4 rounded-lg w-auto h-auto max-w-39.5 flex items-center border border-neutral-200 hover:border-primary-300 hover:bg-neutral-50 transition">
      {slug ? (
        <Link href={`/brand/${slug}`} className="w-full">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
