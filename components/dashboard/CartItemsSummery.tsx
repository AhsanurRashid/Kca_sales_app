"use client"

import { useSyncExternalStore } from "react"
import { useCartStore, ICartItem } from "@/store/cart-store"
import { Input } from "@/components/ui/input"
import { Trash2, Minus, Plus, Gift, Package } from "lucide-react"
import { toast } from "sonner"

// Custom hook for hydration-safe Zustand state
const emptySubscribe = () => () => {}
function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

const CartItemsSummery = () => {
  const isHydrated = useHydrated()

  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const updateRate = useCartStore((state) => state.updateRate)
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

  // Separate regular items and FOC items
  const regularItems = items.filter((item) => !item.is_foc)
  const focItems = items.filter((item) => item.is_foc)

  const itemCount = isHydrated ? getItemCount() : 0
  const total = isHydrated ? getTotal() : 0

  return (
    <div className="w-full">
      {/* Cart Content */}
      <div className="w-full">
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

            {/* Total */}
            <div className="lg:block hidden mt-3 p-3 rounded-xl bg-white/5 border border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">
                  Total ({itemCount} items)
                </span>
                <span className="text-xl font-bold text-white tracking-tight">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
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
          <p className="text-[10px] text-white/40 font-mono tracking-wide">
            {item.item_code}
          </p>
          <h4 className="font-medium text-sm text-white truncate mt-0.5">
            {item.item_name}
          </h4>
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

export default CartItemsSummery
