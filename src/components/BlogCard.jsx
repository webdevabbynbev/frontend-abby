import { BtnIcon } from "."
import { FaEllipsis } from "react-icons/fa6"
import { CategoryChip } from "."
import { DataCategoryBlog } from "../data"

export function BlogCard (Date, Image, ImgTitle, Title, Preview ){
  return (
    <div className="Container flex-row bg-white p-6">
        <div className="Content-wrapper flex">
            <div className="wrapper-left-content space-x-2">
                <span className="text-sm">Abby n Bev</span> 
                <span className="bg-neutral-400 p-2 rounded-full"></span>
                <span className="text-sm text-neutral400 "> {Date} </span>
            </div>
                <BtnIcon variant="tertiary" size="md" icon={FaEllipsis}></BtnIcon>
        </div>
                
        <div className="flex-row">
            <img src={Image} alt={ImgTitle} className=""/>
            <div className="flex"><p>Category</p> <CategoryChip item="1"/></div>
        </div>

        <div className="flex-row">
          
        </div>

    </div>
  )
}
