import { DataBrand } from "../data/Brand";
import BrandCard from "./BrandCard";

export default function BrandList() {
  return (
    <div className="grid grid-cols-4 gap-6">
      {DataBrand.map((item) => (
        <BrandCard key={item.id} {...item} />
      ))}
    </div>
  );
}