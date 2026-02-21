import { IProduct } from "@/app/actions/product-action"
import ProductCard, { ProductPricing } from "@/components/dashboard/ProductCard"

interface ProductListProps {
  products: IProduct[]
  pricingMap?: Map<string, ProductPricing>
}

const ProductList = ({ products, pricingMap }: ProductListProps) => {
  if (!products.length) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        No products available
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
      {products.map((product) => (
        <ProductCard 
          key={product.item_code} 
          product={product} 
          pricing={pricingMap?.get(product.item_code)}
        />
      ))}
    </div>
  )
}

export default ProductList
