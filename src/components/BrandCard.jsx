"use client";
export function BrandCard({ image }) {
  return (
    <div className="bg-white p-4 rounded-lg w-auto h-auto max-w-[158px] flex items-center">
      <img src={image} alt="brand" className="w-auto h-auto object-contain" />
    </div>
  );
}
