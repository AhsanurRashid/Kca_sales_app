"use client"

import { useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { useCartStore, ICartItem } from "@/store/cart-store"
import { useCartPanelStore } from "@/store/cart-panel-store"
import { Input } from "@/components/ui/input"
import {
  ShoppingCart,
  X,
  Trash2,
  Minus,
  Plus,
  Gift,
  ChevronRight,
  Package,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Custom hook for hydration-safe Zustand state
const emptySubscribe = () => () => {}
function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

const CartPanel = () => {
  const router = useRouter()
  const isOpen = useCartPanelStore((state) => state.isOpen)
  const setIsOpen = useCartPanelStore((state) => state.setIsOpen)
  const isHydrated = useHydrated()
  
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const updateRate = useCartStore((state) => state.updateRate)
  const clearCart = useCartStore((state) => state.clearCart)
  const getTotal = useCartStore((state) => state.getTotal)
  const getItemCount = useCartStore((state) => state.getItemCount)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price)
  }

  const handleQuantityChange = (item: ICartItem, delta: number) => {
    const newQty = Math.max(1, item.quantity + delta)
    updateQuantity(item.item_code, item.is_foc, newQty)
  }

  const handleRateChange = (item: ICartItem, value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      const baseRate = item.price_list_rate * item.uom_factor
      if (num >= baseRate) {
        updateRate(item.item_code, num)
      } else {
        toast.warning(`Rate cannot be below ${formatPrice(baseRate)}`)
      }
    }
  }

  const handleClearCart = () => {
    if (items.length > 0) {
      clearCart()
      toast.success("Cart cleared")
    }
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty. Please add items to proceed.")
      return
    }
    setIsOpen(false)
    // Redirect to order page or open order modal
    // For example, using Next.js router:
    router.push("/order")
  }

  // Separate regular items and FOC items
  const regularItems = items.filter((item) => !item.is_foc)
  const focItems = items.filter((item) => item.is_foc)

  const itemCount = isHydrated ? getItemCount() : 0
  const total = isHydrated ? getTotal() : 0

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Cart Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-screen w-full max-w-md bg-bg dark:bg-white/5 backdrop-blur-xl border-l border-white/20 z-50 transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
              <ShoppingCart className="size-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Cart</h2>
              {itemCount > 0 && (
                <p className="text-xs text-white/60">{itemCount} items</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl p-2 transition-all"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="p-3 w-full overflow-y-auto h-[calc(100vh-180px)]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <div className="size-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Package className="size-8 text-white/40" />
              </div>
              <div>
                <h3 className="font-medium text-white/90">Your cart is empty</h3>
                <p className="text-sm text-white/50 mt-1">
                  Add products to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Regular Items */}
              {regularItems.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-white/50 uppercase tracking-wider px-1 mb-2">
                    Items ({regularItems.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {regularItems.map((item) => (
                      <CartItemRow
                        key={`${item.item_code}-regular`}
                        item={item}
                        onQuantityChange={handleQuantityChange}
                        onRateChange={handleRateChange}
                        onRemove={() => removeItem(item.item_code, false)}
                        formatPrice={formatPrice}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* FOC Items */}
              {focItems.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-white/50 uppercase tracking-wider px-1 mb-2 flex items-center gap-1.5">
                    <Gift className="size-3.5" />
                    Free of Cost ({focItems.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {focItems.map((item) => (
                      <CartItemRow
                        key={`${item.item_code}-foc`}
                        item={item}
                        onQuantityChange={handleQuantityChange}
                        onRateChange={handleRateChange}
                        onRemove={() => removeItem(item.item_code, true)}
                        formatPrice={formatPrice}
                        isFoc
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/5 backdrop-blur-md border-t border-white/20">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-white/60">Total</span>
            <span className="text-2xl font-bold text-white tracking-tight">{formatPrice(total)}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearCart}
              disabled={items.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 hover:text-white transition-all text-sm font-medium disabled:opacity-40 disabled:pointer-events-none"
            >
              <Trash2 className="size-4" />
              Clear
            </button>
            
            <button
              onClick={handleCheckout}
              disabled={items.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/20 border border-white/30 text-white shadow-lg hover:bg-white/30 transition-all text-sm font-medium disabled:opacity-40 disabled:pointer-events-none"
            >
              Checkout
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

interface CartItemRowProps {
  item: ICartItem
  onQuantityChange: (item: ICartItem, delta: number) => void
  onRateChange: (item: ICartItem, value: string) => void
  onRemove: () => void
  formatPrice: (price: number) => string
  isFoc?: boolean
}

const CartItemRow = ({
  item,
  onQuantityChange,
  onRateChange,
  onRemove,
  formatPrice,
  isFoc,
}: CartItemRowProps) => {
  return (
    <div className="rounded-xl bg-white/10 border border-white/15 p-3 transition-all hover:bg-white/15">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-white/40 font-mono tracking-wide">{item.item_code}</p>
          <h4 className="font-medium text-sm text-white truncate mt-0.5">{item.item_name}</h4>
          <p className="text-xs text-white/50 mt-0.5">
            {item.sales_uom} × {item.uom_factor}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="rounded-lg p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <div className="mt-2.5 flex items-center gap-3">
        {/* Quantity */}
        <div className="flex items-center">
          <button
            className="size-7 rounded-l-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
            onClick={() => onQuantityChange(item, -1)}
            disabled={item.quantity <= 1}
          >
            <Minus className="size-3" />
          </button>
          <div className="h-7 w-10 bg-white/5 border-y border-white/20 flex items-center justify-center text-sm text-white font-medium">
            {item.quantity}
          </div>
          <button
            className="size-7 rounded-r-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all"
            onClick={() => onQuantityChange(item, 1)}
          >
            <Plus className="size-3" />
          </button>
        </div>

        {/* Rate */}
        {!isFoc ? (
          <div className="flex items-center gap-1 flex-1">
            <span className="text-xs text-white/40">$</span>
            <Input
              type="text"
              value={item.rate.toFixed(2)}
              onChange={(e) => onRateChange(item, e.target.value)}
              className="h-7 w-20 text-sm bg-white/5 border-white/20 text-white rounded-lg focus:border-white/40"
            />
          </div>
        ) : (
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
            FREE
          </span>
        )}

        {/* Amount */}
        <div className="text-right ml-auto">
          <span className="text-sm font-semibold text-white">
            {isFoc ? formatPrice(0) : formatPrice(item.amount)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default CartPanel
