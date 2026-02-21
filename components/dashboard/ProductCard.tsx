"use client"
import { useState, useCallback } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { ShoppingCart, Gift, Package, Minus, Plus } from "lucide-react"
import { getImageUrl } from "@/lib/utils"
import { IProduct } from "@/app/actions/product-action"
import { useCartStore } from "@/store/cart-store"
import { toast } from "sonner"

export interface ProductPricing {
  price_list_rate: number
  uom_factor: number
  sales_uom: string
  projected_qty: number
}

interface ProductCardProps {
  product: IProduct
  pricing?: ProductPricing
}

const ProductCard = ({ product, pricing }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1)
  const [rate, setRate] = useState(0)
  const [isRateEdited, setIsRateEdited] = useState(false)
  
  const addItem = useCartStore((state) => state.addItem)

  // Calculate base rate and UOM info from pricing data
  const uomFactor = pricing?.uom_factor || 1
  const priceListRate = pricing?.price_list_rate || product.standard_rate
  const baseRate = priceListRate * uomFactor
  const salesUom = pricing?.sales_uom || product.stock_uom
  const projectedQty = pricing?.projected_qty ?? 0
  
  // Out of stock check
  const isOutOfStock = !projectedQty || projectedQty <= 0
  const displayQty = projectedQty && uomFactor ? (projectedQty / uomFactor).toFixed(0) : '0'

  // Initialize rate if not edited
  const displayRate = isRateEdited ? rate : baseRate

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price)
  }

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta))
  }

  const handleQuantityInput = (value: string) => {
    const num = parseInt(value, 10)
    if (!isNaN(num) && num > 0) {
      setQuantity(num)
    } else if (value === "") {
      setQuantity(1)
    }
  }

  const handleRateChange = (value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      setIsRateEdited(true)
      setRate(num)
    } else if (value === "") {
      setIsRateEdited(true)
      setRate(0)
    }
  }

  const handleRateBlur = () => {
    // Ensure rate is not below base rate
    if (displayRate < baseRate) {
      setRate(baseRate)
      setIsRateEdited(true)
      toast.warning(`Rate cannot be below ${formatPrice(baseRate)}`)
    }
  }

  const handleAddToCart = useCallback((isFoc: boolean) => {
    // Validate rate for non-FOC items
    const finalRate = isFoc ? 0 : Math.max(displayRate, baseRate)
    
    if (!isFoc && displayRate < baseRate) {
      toast.error(`Rate cannot be below ${formatPrice(baseRate)}`)
      return
    }

    // Calculate required stock (quantity * uom_factor)
    const requiredStock = quantity * uomFactor

    if (requiredStock > projectedQty) {
      const maxQty = Math.floor(projectedQty / uomFactor)
      toast.error(
        `Insufficient stock. Available: ${projectedQty} units (max ${maxQty} ${salesUom})`
      )
      return
    }

    // Add to cart
    addItem({
      item_code: product.item_code,
      item_name: product.item_name,
      quantity,
      rate: finalRate,
      price_list_rate: priceListRate,
      sales_uom: salesUom,
      uom_factor: uomFactor,
      is_foc: isFoc,
    })

    toast.success(
      isFoc 
        ? `Added ${quantity} ${salesUom} of ${product.item_name} as FOC`
        : `Added ${quantity} ${salesUom} of ${product.item_name} to cart`
    )

    // Reset quantity after adding
    setQuantity(1)
  }, [displayRate, baseRate, quantity, uomFactor, projectedQty, product, salesUom, priceListRate, addItem])

  return (
    <Card className="group gap-2 w-full overflow-hidden transition-all duration-200 hover:shadow-md py-0">
      {/* Product Image - Smaller aspect ratio */}
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        {product.image ? (
          <Image
            src={getImageUrl(product.image) || "/assets/images/placeholder.webp"}
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
        
        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute top-1.5 right-1.5">
            <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
              Out of Stock
            </span>
          </div>
        )}
        
        {/* Stock Qty Badge - when in stock */}
        {!isOutOfStock && (
          <div className="absolute top-1.5 right-1.5">
            <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              {displayQty} avail
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

        {/* Quantity Input */}
        <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/50">
          <span className="text-[10px] text-muted-foreground w-7">Qty:</span>
          <div className="flex items-center flex-1">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7 rounded-r-none"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <Input
              type="text"
              value={quantity}
              onChange={(e) => handleQuantityInput(e.target.value)}
              className="h-7 w-10 text-center text-sm px-0 rounded-none border-x-0 font-medium"
            />
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7 rounded-l-none"
              onClick={() => handleQuantityChange(1)}
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
              value={displayRate.toFixed(2)}
              onChange={(e) => handleRateChange(e.target.value)}
              onBlur={handleRateBlur}
              className="h-7 flex-1 text-sm px-2 font-medium"
            />
          </div>
        </div>

        {/* Amount Display */}
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Amount:</span>
          <span className="font-bold text-primary">
            {formatPrice(displayRate * quantity)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-2 p-2 pt-0">
        <Button 
          size="sm"
          className="gap-1.5 text-xs h-8" 
          onClick={() => handleAddToCart(false)}
          disabled={isOutOfStock}
        >
          <ShoppingCart className="h-4 w-4" />
          Cart
        </Button>
        <Button 
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs h-8"
          onClick={() => handleAddToCart(true)}
          disabled={isOutOfStock}
        >
          <Gift className="h-4 w-4" />
          FOC
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ProductCard