"use client"

import { useSyncExternalStore } from "react"
import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { useCartPanelStore } from "@/store/cart-panel-store"

// Custom hook for hydration-safe Zustand state
const emptySubscribe = () => () => {}
function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

const CartButton = () => {
  const isHydrated = useHydrated()
  const setIsOpen = useCartPanelStore((state) => state.setIsOpen)
  const getItemCount = useCartStore((state) => state.getItemCount)

  const itemCount = isHydrated ? getItemCount() : 0

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 hover:text-white transition-all"
    >
      <ShoppingCart className="size-5" />
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  )
}

export default CartButton
