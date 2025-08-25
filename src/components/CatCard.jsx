export default function CatCard ({title, image}) {
  return (
    <div className="container h-auto p-6 max-w-[22%] flex items-start justify-between 
                  bg-white rounded-[12px] hover:outline outline-1 outline-primary200 transition-all">
      <h3 className="font-normal text-[16px]"> 
        {title}
      </h3>
      <div className="picture">
        <img src={image} alt={title} className="h-auto w-[70px] object-contain"></img>
      </div>
    </div>
  )
}


