import { DataListCategory } from "../data/DataListCategory"

export default function CategoryChip (CategoryChip) {
  const Category = DataListCategory.find((cat => cat.id === 2))

  return (
    <div>
        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
          {category ? category.name : "Kategori tidak ditemukan"}
        </div>
    </div>
  )
}
