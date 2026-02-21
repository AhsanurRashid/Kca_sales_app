import { Suspense } from "react"
import { getProductsPaginated, IProduct } from "@/app/actions/product-action"
import { getItemPrices, getUOMConversionFactors, getAllStock, IStockEntry } from "@/app/actions/pricing-stock-action"
import ProductList from "@/components/dashboard/ProductList"
import Pagination from "@/components/common/Pagination"
import ProductSearch from "@/components/dashboard/ProductSearch"
import { ProductPricing } from "@/components/dashboard/ProductCard"

const ITEMS_PER_PAGE = 24

interface ProductsPageProps {
  searchParams: Promise<{ page?: string; category?: string; search?: string }>
}

// Build pricing map from prices, UOM conversions, stock, and products
function buildPricingMap(
  products: IProduct[],
  prices: { item_code: string; price_list_rate: number }[],
  uomConversions: { from_uom: string; to_uom: string; value: number }[],
  stockData: IStockEntry[]
): Map<string, ProductPricing> {
  const map = new Map<string, ProductPricing>()
  
  // Create lookup maps
  const priceMap = new Map(prices.map((p) => [p.item_code, p.price_list_rate]))
  const uomMap = new Map(uomConversions.map((u) => [`${u.from_uom}_${u.to_uom}`, u.value]))

  // Pre-index stock by item_code (filter rejected once, then group)
  const stockByItem = new Map<string, number>()
  for (const s of stockData) {
    if (s.warehouse.toLowerCase().includes('rejected')) continue
    stockByItem.set(s.item_code, (stockByItem.get(s.item_code) || 0) + (s.adjusted_projected_qty || 0))
  }

  for (const product of products) {
    const priceListRate = priceMap.get(product.item_code) || product.standard_rate
    const salesUom = product.sales_uom || product.stock_uom
    
    // Find UOM conversion factor
    let uomFactor = 1
    if (salesUom && product.stock_uom && salesUom !== product.stock_uom) {
      const factor = uomMap.get(`${salesUom}_${product.stock_uom}`)
      if (factor) {
        uomFactor = factor
      }
    }

    map.set(product.item_code, {
      price_list_rate: priceListRate,
      uom_factor: uomFactor,
      sales_uom: salesUom,
      projected_qty: stockByItem.get(product.item_code) || 0,
    })
  }

  return map
}

async function ProductsLoader({ page, category, search }: { page: number; category?: string; search?: string }) {
  // Fetch products, pricing, and stock data in parallel
  const [products, pricesResult, uomResult, stockResult] = await Promise.all([
    getProductsPaginated(page, ITEMS_PER_PAGE, category, search),
    getItemPrices(),
    getUOMConversionFactors(),
    getAllStock(),
  ])
  
  if (!products.success) {
    return <div className="text-red-500">{products.message || "Failed to load products"}</div>
  }

  if (products.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-1">No products found</h3>
        <p className="text-sm text-muted-foreground">
          {search ? `No results for "${search}"` : "Try adjusting your filters"}
        </p>
      </div>
    )
  }

  // Build pricing map for current page products (includes stock)
  const pricingMap = buildPricingMap(
    products.data,
    pricesResult.data || [],
    uomResult.data || [],
    stockResult.data || []
  )
  
  return (
    <>
      <div className="pb-14">
        <ProductList products={products.data} pricingMap={pricingMap} />
      </div>
      <Pagination
        currentPage={products.page}
        totalPages={products.totalPages}
        total={products.total}
        limit={products.limit}
      />
    </>
  )
}

function ProductsSkeleton() {
  return (
    <div className="pb-14">
      <div className="px-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card overflow-hidden">
              {/* Image Skeleton - Smaller aspect ratio */}
              <div className="relative aspect-4/3 bg-muted animate-pulse">
                <div className="absolute top-1.5 left-1.5">
                  <div className="h-4 w-12 rounded-full bg-muted-foreground/20" />
                </div>
              </div>
              
              {/* Content Skeleton */}
              <div className="p-2 space-y-1.5">
                {/* Item Code */}
                <div className="h-2.5 w-16 rounded bg-muted animate-pulse" />
                {/* Product Name */}
                <div className="space-y-1 min-h-8">
                  <div className="h-3 w-full rounded bg-muted animate-pulse" />
                  <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                </div>
                {/* Qty Input */}
                <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/50">
                  <div className="h-3 w-7 rounded bg-muted animate-pulse" />
                  <div className="h-7 flex-1 rounded bg-muted animate-pulse" />
                </div>
                {/* Rate Input */}
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-7 rounded bg-muted animate-pulse" />
                  <div className="h-7 flex-1 rounded bg-muted animate-pulse" />
                </div>
                {/* Amount */}
                <div className="flex items-center justify-between">
                  <div className="h-3 w-10 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-14 rounded bg-muted animate-pulse" />
                </div>
              </div>
              
              {/* Footer Skeleton - Bigger buttons */}
              <div className="grid grid-cols-2 gap-2 p-2 pt-0">
                <div className="h-8 rounded bg-muted animate-pulse" />
                <div className="h-8 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Pagination Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/10 dark:bg-white/5 backdrop-blur-xl h-12 flex items-center justify-center gap-6 px-4 border-t border-white/20">
        <div className="h-4 w-20 rounded-full bg-foreground/10 animate-pulse" />
        <div className="flex items-center gap-1">
          <div className="h-8 w-8 rounded-full bg-foreground/10 animate-pulse" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-8 rounded-full bg-foreground/10 animate-pulse" />
          ))}
          <div className="h-8 w-8 rounded-full bg-foreground/10 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || "1", 10))
  const category = params.category
  const search = params.search

  return (
    <div className="w-full">
      {/* Search Header */}
      <div className="relative z-10 bg-background/20 backdrop-blur-xl border-b border-border/40 px-4 py-3 mb-2">
        <div className="flex items-center justify-between gap-4">
          <ProductSearch />
          {search && (
            <p className="text-sm text-foreground">
              Results for <span className="font-medium text-foreground">&quot;{search}&quot;</span>
            </p>
          )}
        </div>
      </div>

      <Suspense fallback={<ProductsSkeleton />} key={`${page}-${category}-${search}`}>
        <ProductsLoader page={page} category={category} search={search} />
      </Suspense>
    </div>
  )
}
