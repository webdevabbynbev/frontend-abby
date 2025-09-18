"use client";
export function BrandCard({ logo, brandname }) {
  return (
    <div className="bg-white p-4 rounded-lg w-auto h-auto max-w-[158px] flex items-center">
      <img
        src={logo}
        alt={brandname}
        className="w-auto h-auto object-contain"
      />
    </div>
  );
}
