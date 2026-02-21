import { Suspense } from "react"
import { getProductCategories } from "@/app/actions/product-category-action"
import ProductCategoryList from "@/components/dashboard/ProductCategoryList"

async function ProductCategoriesLoader() {
  const [categoriesResponse] = await Promise.all([
    getProductCategories(),
  ])
  
  if (!categoriesResponse.success) {
    return <div className="text-red-500">{categoriesResponse.message || "Failed to load categories"}</div>
  }
  
  return <ProductCategoryList categories={categoriesResponse.data} />
}

function ProductCategoriesSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default function SalesOrder() {
  return (
    <div className="w-full">
      <Suspense fallback={<ProductCategoriesSkeleton />}>
        <ProductCategoriesLoader />
      </Suspense>
    </div>
  )
}
