export default function ItemCard ({Image, Category, ProductName, Price, RealPrice }) {
  return (
    <div className="Container rounded-lg bg-white h-auto w-[200px] space-y-4 hover:outline outline-1 outline-primary200 transition-all">
    <div className="Image flex w-full items-center justify-center ">    
      <img src={Image} alt={ProductName} className="w-[150px] h-auto items-center"></img>
    </div>
        <div className="Content-wrapper w-full space-y-2 p-4">
            <div className="CategoryAndName flex-row">
                <div className="text-sm font-normal text-neutral-950">{Category}</div>
                <div className="text-sm font-medium text-neutral-950"> {ProductName} </div>
         </div>
            <div className="Price flex-row">
                <div className="text-base font-bold text-primary700"> {Price} </div>
                <div className="text-sm font-medium text-neutral-400 line-through"> {RealPrice} </div>
            </div>
        </div>

    </div>
  )
}


