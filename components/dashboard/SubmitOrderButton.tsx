"use client"

import { useState, useSyncExternalStore } from "react"
import { useOrderStore } from "@/store/order-store"
import { useCartStore } from "@/store/cart-store"
import { useUserStore } from "@/store/user-store"
import { submitSalesOrder, validateOrderData } from "@/app/actions/order-action"
import { toast } from "sonner"
import { Loader2, Send, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

// Custom hook for hydration-safe Zustand state
const emptySubscribe = () => () => {}
function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

const SubmitOrderButton = () => {
  const isHydrated = useHydrated()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const orderDetails = useOrderStore((state) => state.orderDetails)
  const setValidationErrors = useOrderStore((state) => state.setValidationErrors)
  const clearValidationErrors = useOrderStore((state) => state.clearValidationErrors)
  const clearOrderDetails = useOrderStore((state) => state.clearOrderDetails)

  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const getTotal = useCartStore((state) => state.getTotal)

  const user = useUserStore((state) => state.user)

  const handleSubmit = async () => {
    // Clear previous errors
    clearValidationErrors()
    setSuccessMessage("")

    // Validate the data
    const validation = await validateOrderData(orderDetails, items)

    if (!validation.isValid) {
      // Set validation errors in the store
      const errors: Record<string, string> = {}
      validation.errors.forEach((error) => {
        errors[error.field] = error.message
      })
      setValidationErrors(errors)

      // Show error toast with all messages
      const errorMessages = validation.errors.map((e) => e.message)
      toast.error("Please fix the following errors:", {
        description: errorMessages.join(". "),
      })
      return
    }

    // Submit the order
    setLoading(true)

    try {
      const result = await submitSalesOrder(
        orderDetails,
        items,
        user?.full_name || ""
      )

      if (result.success) {
        setSuccessMessage(`Order ${result.data?.name} submitted successfully!`)
        toast.success("Order submitted successfully!", {
          description: `Order ID: ${result.data?.name}`,
        })

        // Clear cart and order details
        clearCart()
        clearOrderDetails()

        // Redirect to products page after a short delay
        setTimeout(() => {
          router.push("/products")
        }, 2000)
      } else {
        toast.error("Failed to submit order", {
          description: result.message,
        })
      }
    } catch {
      toast.error("Something went wrong", {
        description: "Please try again later",
      })
    } finally {
      setLoading(false)
    }
  }

  const total = isHydrated ? getTotal() : 0
  const itemCount = isHydrated ? items.length : 0

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 2,
    }).format(price)
  }

  if (!isHydrated) {
    return (
      <>
        <div className="hidden lg:block mt-6 p-4">
          <div className="animate-pulse h-14 bg-white/10 rounded-xl" />
        </div>
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg/95 backdrop-blur-xl border-t border-white/20 p-4">
          <div className="animate-pulse h-14 bg-white/10 rounded-xl" />
        </div>
        <div className="lg:hidden h-24" />
      </>
    )
  }

  if (successMessage) {
    return (
      <>
        <div className="hidden lg:block mt-6 p-4">
          <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/30 p-4 flex items-center gap-3">
            <CheckCircle2 className="size-5 text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-emerald-400">
                {successMessage}
              </p>
              <p className="text-xs text-emerald-400/60 mt-0.5">
                Redirecting to products...
              </p>
            </div>
          </div>
        </div>
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg/95 backdrop-blur-xl border-t border-white/20 p-4">
          <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/30 p-4 flex items-center gap-3">
            <CheckCircle2 className="size-5 text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-emerald-400">
                {successMessage}
              </p>
              <p className="text-xs text-emerald-400/60 mt-0.5">
                Redirecting to products...
              </p>
            </div>
          </div>
        </div>
        <div className="lg:hidden h-24" />
      </>
    )
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block mt-6 pt-6 border-t border-white/30 space-y-4">
        {/* Cart Empty Warning */}
        {itemCount === 0 && (
          <div className="rounded-xl bg-amber-500/20 border border-amber-500/30 p-3 flex items-center gap-2">
            <AlertCircle className="size-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-400">
              Your cart is empty. Add items to submit an order.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || itemCount === 0}
          className={cn(
            "w-full rounded-xl p-4 font-medium text-sm transition-all flex items-center justify-center gap-2",
            loading || itemCount === 0
              ? "bg-white/10 text-white/40 cursor-not-allowed"
              : "bg-linear-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/20"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Submitting Order...
            </>
          ) : (
            <>
              <Send className="size-4" />
              Submit Order
            </>
          )}
        </button>

        {/* Help Text */}
        <p className="text-xs text-white/40 text-center">
          Please review all details before submitting
        </p>
      </div>

      {/* Mobile View - Fixed Bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg/95 backdrop-blur-xl border-t border-white/20 p-4 space-y-3">
        {/* Cart Empty Warning */}
        {itemCount === 0 && (
          <div className="rounded-xl bg-amber-500/20 border border-amber-500/30 p-2.5 flex items-center gap-2">
            <AlertCircle className="size-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-400">
              Your cart is empty. Add items to submit an order.
            </p>
          </div>
        )}

        {/* Order Summary - Compact for mobile */}
        {itemCount > 0 && (
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-white/60">{itemCount} items</span>
            <span className="text-lg text-white font-bold">
              {formatPrice(total)}
            </span>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || itemCount === 0}
          className={cn(
            "w-full rounded-xl p-4 font-medium text-sm transition-all flex items-center justify-center gap-2",
            loading || itemCount === 0
              ? "bg-white/10 text-white/40 cursor-not-allowed"
              : "bg-linear-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/20"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="size-4" />
              Submit Order
            </>
          )}
        </button>
      </div>
    </>
  )
}

export default SubmitOrderButton
