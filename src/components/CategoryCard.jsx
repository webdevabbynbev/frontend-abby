"use client";
export function CategoryCard({ title, image }) {
  return (
    <div
      className="container w-auto p-5 flex items-start justify-between 
                  bg-white rounded-xl hover:outline-1 outline-primary-300 hover:-translate-y-[2px] 
                  transition-all ease-in-out"
    >
      <h3 className="font-medium text-base text-primary-700">{title}</h3>
      <div className="picture">
        <img src={image} alt={title} className="h-[70px] w-[70px]"></img>
      </div>
    </div>
  );
}
