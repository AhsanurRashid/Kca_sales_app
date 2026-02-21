"use client"

import { IProductCategory } from "@/app/actions/product-category-action"
import Image from "next/image"

import { getImageUrl } from "@/lib/utils"

const ProductCategoryList = ({
  categories,
}: {
  categories: IProductCategory[]
}) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-3">
        {categories.map((category) => {
          const imageUrl = getImageUrl(category.image)
          return (
            <div key={category.name} className="h-full">
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl flex flex-col items-center gap-2 p-3 overflow-hidden hover:bg-white/20 transition-all cursor-pointer h-full">
                <div className="size-16 flex-shrink-0">
                  <Image
                    src={imageUrl || "/assets/images/placeholder.webp"}
                    alt={category.name}
                    width={64}
                    height={64}
                    className="object-cover rounded-xl size-full"
                  />
                </div>
                <h3 className="text-xs font-semibold text-white/90 tracking-wide text-center line-clamp-2 flex-1 flex items-center">{category.name}</h3>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProductCategoryList