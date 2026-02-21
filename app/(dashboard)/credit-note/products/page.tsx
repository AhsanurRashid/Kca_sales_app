"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useCreditNoteStore } from "@/store/credit-note-store"
import { getProducts, IProduct } from "@/app/actions/product-action"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Package,
  Search,
  ArrowLeft,
  Plus,
  Minus,
  ShoppingCart,
  Loader2,
  Check,
} from "lucide-react"
import { toast } from "sonner"
import { cn, formatCurrency, getImageUrl } from "@/lib/utils"
import Image from "next/image"

interface SelectedProduct {
  product: IProduct
  quantity: number
  rate: number
}

export default function CreditNoteProductsPage() {
  const router = useRouter()
  const { addItem } = useCreditNoteStore()

  // Data states
  const [products, setProducts] = useState<IProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  // Search state
  const [searchQuery, setSearchQuery] = useState("")

  // Selection states
  const [selectedProducts, setSelectedProducts] = useState<Map<string, SelectedProduct>>(
    new Map()
  )

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true)
      const response = await getProducts()
      if (response.success) {
        setProducts(response.data)
      } else {
        toast.error("Failed to load products")
      }
      setLoadingProducts(false)
    }
    fetchProducts()
  }, [])

  // Filter products based on search
  const filteredProducts = products.filter(
    (p) =>
      p.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.item_code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectProduct = (product: IProduct) => {
    setSelectedProducts((prev) => {
      const newMap = new Map(prev)
      if (newMap.has(product.item_code)) {
        // Already selected, increment quantity
        const existing = newMap.get(product.item_code)!
        newMap.set(product.item_code, {
          ...existing,
          quantity: existing.quantity + 1,
        })
      } else {
        // Add new selection
        newMap.set(product.item_code, {
          product,
          quantity: 1,
          rate: product.standard_rate,
        })
      }
      return newMap
    })
  }

  const handleQuantityChange = (itemCode: string, delta: number) => {
    setSelectedProducts((prev) => {
      const newMap = new Map(prev)
      const existing = newMap.get(itemCode)
      if (existing) {
        const newQty = existing.quantity + delta
        if (newQty <= 0) {
          newMap.delete(itemCode)
        } else {
          newMap.set(itemCode, { ...existing, quantity: newQty })
        }
      }
      return newMap
    })
  }

  const handleQuantityInput = (itemCode: string, value: string) => {
    const num = parseInt(value, 10)
    setSelectedProducts((prev) => {
      const newMap = new Map(prev)
      const existing = newMap.get(itemCode)
      if (existing) {
        if (!isNaN(num) && num > 0) {
          newMap.set(itemCode, { ...existing, quantity: num })
        } else if (value === "" || num === 0) {
          newMap.delete(itemCode)
        }
      }
      return newMap
    })
  }

  const handleRateChange = (itemCode: string, value: string) => {
    const num = parseFloat(value)
    setSelectedProducts((prev) => {
      const newMap = new Map(prev)
      const existing = newMap.get(itemCode)
      if (existing) {
        newMap.set(itemCode, { ...existing, rate: isNaN(num) ? 0 : num })
      }
      return newMap
    })
  }

  const handleAddToCart = useCallback(() => {
    if (selectedProducts.size === 0) {
      toast.error("Please select at least one product")
      return
    }

    // Add all selected products to the credit note store
    selectedProducts.forEach((selected) => {
      addItem({
        item_code: selected.product.item_code,
        item_name: selected.product.item_name,
        quantity: selected.quantity,
        rate: selected.rate,
        price_list_rate: selected.product.standard_rate,
        sales_uom: selected.product.sales_uom || selected.product.stock_uom,
      })
    })

    toast.success(`Added ${selectedProducts.size} item(s) to credit note`)
    router.push("/credit-note")
  }, [selectedProducts, addItem, router])

  const totalSelectedItems = Array.from(selectedProducts.values()).reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  const totalSelectedAmount = Array.from(selectedProducts.values()).reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-5 text-white" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Package className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Select Products</h1>
              <p className="text-sm text-white/50">
                Choose products for the credit note
              </p>
            </div>
          </div>
        </div>

        {/* Selection Summary - Desktop */}
        {selectedProducts.size > 0 && (
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-white/50">
                {totalSelectedItems} item(s) selected
              </p>
              <p className="font-medium text-white">{formatCurrency(totalSelectedAmount)}</p>
            </div>
            <Button onClick={handleAddToCart}>
              <ShoppingCart className="size-4 mr-2" />
              Add to Credit Note
            </Button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 text-white/90"
        />
      </div>

      {/* Products Grid */}
      {loadingProducts ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No products found</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery ? `No results for "${searchQuery}"` : "Try adjusting your search"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 pb-20">
          {filteredProducts.map((product) => {
            const isSelected = selectedProducts.has(product.item_code)
            const selection = selectedProducts.get(product.item_code)
            const imageUrl = getImageUrl(product.image)
            const salesUom = product.sales_uom || product.stock_uom

            return (
              <Card
                key={product.item_code}
                className={cn(
                  "group gap-2 w-full overflow-hidden transition-all duration-200 hover:shadow-md py-0",
                  isSelected && "ring-2 ring-primary"
                )}
              >
                {/* Product Image */}
                <div
                  className="relative aspect-4/3 overflow-hidden bg-muted cursor-pointer"
                  onClick={() => handleSelectProduct(product)}
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.item_name}
                      fill
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted to-muted/50">
                      <Package className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}

                  {/* UOM Badge */}
                  <div className="absolute top-1.5 left-1.5 flex gap-1">
                    <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {salesUom}
                    </span>
                  </div>

                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5">
                      <span className="inline-flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                      </span>
                    </div>
                  )}
                </div>

                <CardContent className="p-2 space-y-1.5">
                  {/* Item Code */}
                  <p className="text-[10px] font-mono text-muted-foreground truncate">
                    {product.item_code}
                  </p>

                  {/* Product Name */}
                  <h3 className="font-medium text-xs leading-tight line-clamp-2 min-h-8 group-hover:text-primary transition-colors">
                    {product.item_name}
                  </h3>

                  {isSelected && selection ? (
                    <>
                      {/* Quantity Input */}
                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/50">
                        <span className="text-[10px] text-muted-foreground w-7">Qty:</span>
                        <div className="flex items-center flex-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-r-none"
                            onClick={() => handleQuantityChange(product.item_code, -1)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <Input
                            type="text"
                            value={selection.quantity}
                            onChange={(e) => handleQuantityInput(product.item_code, e.target.value)}
                            className="h-7 w-10 text-center text-sm px-0 rounded-none border-x-0 font-medium"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-l-none"
                            onClick={() => handleQuantityChange(product.item_code, 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Rate Input */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground w-7">Rate:</span>
                        <div className="flex items-center flex-1">
                          <span className="text-xs text-muted-foreground px-1">$</span>
                          <Input
                            type="text"
                            value={selection.rate.toFixed(2)}
                            onChange={(e) => handleRateChange(product.item_code, e.target.value)}
                            className="h-7 flex-1 text-sm px-2 font-medium"
                          />
                        </div>
                      </div>

                      {/* Amount Display */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-bold text-primary">
                          {formatCurrency(selection.rate * selection.quantity)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Price Display */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
                        <span className="text-[10px] text-muted-foreground">Price:</span>
                        <span className="font-bold text-sm text-primary">
                          {formatCurrency(product.standard_rate)}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>

                <CardFooter className="p-2 pt-0">
                  <Button
                    size="sm"
                    className="w-full gap-1.5 text-xs h-8"
                    variant={isSelected ? "secondary" : "default"}
                    onClick={() => handleSelectProduct(product)}
                  >
                    {isSelected ? (
                      <>
                        <Plus className="h-4 w-4" />
                        Add More
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        Select
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Floating Action Button for adding to cart */}
      {selectedProducts.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 z-50">
          <Button size="lg" onClick={handleAddToCart} className="shadow-lg">
            <ShoppingCart className="size-5 mr-2" />
            Add {totalSelectedItems} item(s) - {formatCurrency(totalSelectedAmount)}
          </Button>
        </div>
      )}
    </div>
  )
}
