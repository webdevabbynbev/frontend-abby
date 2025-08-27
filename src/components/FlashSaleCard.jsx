import { TagFlashSale } from "@/assets"
import { FaHeart } from 'react-icons/fa';
import BtnIconToggle from "./BtnIconToggle";
export default function FlashSaleCard ({total, sold, Image, Category, ProductName, Price, RealPrice}) {
  
  const percent = Math.min((sold / total) * 100, 100);
  
  let barColor = "bg-green-500";
  if (percent <= 50) barColor = "bg-yellow-500";
  if (percent <= 10) barColor = "bg-red-500";

  return (
    
    <div className="Container rounded-lg bg-white h-auto w-[200px] space-y-4 hover:outline outline-1 outline-primary200 transition-all overflow-hidden">
      <div className="Image rela flex w-full items-center justify-center ">  
      <img src={TagFlashSale} alt="Flash sale" className="TagFlashSale absolute inset-0 z-50 items-start justify-start"></img>
      < div className="absolute top-4 right-4"><BtnIconToggle iconName="heart" variant="tertiary" size="md" /></div>
      <img src={Image} alt={ProductName} className="w-[150px] h-auto items-center object-contain"></img>
    </div>

        <div className="Content-wrapper w-full space-y-1 p-4">
            <div className="CategoryAndName flex-row space-y-1">
                <div className="text-sm font-normal text-neutral-950">{Category}</div>
                <h3 className="text-sm font-bold text-neutral-950 line-clamp-2"> {ProductName} </h3>
         </div>

            <div className="Price flex-row">
                <p className="text-base font-bold text-primary700"> {Price} </p>
                <p className="text-sm font-medium text-neutral-400 line-through"> {RealPrice} </p>
            </div>

            <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${barColor}`} 
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-gray-600 mt-1">{sold}/{total} terjual</p>
      </div>
    </div>
  )
}


