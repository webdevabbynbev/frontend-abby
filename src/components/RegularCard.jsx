import { TagSale } from "@/assets"
export default function RegularCard ({Image, Category, ProductName, Price, RealPrice}) {
  return (
    <div className="Container rounded-lg bg-white h-auto w-[200px] space-y-4 hover:outline outline-1 outline-primary200 transition-all overflow-hidden">
    <div className="Image rela flex w-full items-center justify-center ">  
      <img src={TagSale} alt="Sale" className="TagFlashSale absolute inset-0 z-50 items-start justify-start object-contain"></img>
      <img src={Image} alt={ProductName} className="w-[150px] h-auto items-center"></img>
    </div>
        <div className="Content-wrapper w-full space-y-1 p-4">
            <div className="CategoryAndName flex-row space-y-1">
                <div className="text-sm font-normal text-neutral-950">{Category}</div>
                <div className="text-base font-medium text-neutral-950 line-clamp-2"> {ProductName} </div>
         </div>
            <div className="Price w-full flex-row space-x-2 justify-start">
                <div className="w-full text-base font-bold text-primary700"> {Price} </div>
                <div className="w-full text-xs font-medium text-neutral-400 line-through"> {RealPrice} </div>
            </div>

            <div className="Rating flex space-x-2">
              <div className="flex space-x-2">
                <div className="font-bold text-primary700">4.5
                <i className="fa-solid fa-star text-warning300"/>
                </div>
              </div>
                <div className="font-medium text-neutral300">12 reviews</div>
            </div>
        </div>
    </div>
  )
}


