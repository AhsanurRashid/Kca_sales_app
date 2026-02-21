"use client"

import { useEffect, useState, useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"
import OrderFilters from "@/components/order-list/OrderFilters"
import OrderTable from "@/components/order-list/OrderTable"
import { useOrderListStore } from "@/store/order-list-store"
import { useOrderStore } from "@/store/order-store"
import { useCartStore } from "@/store/cart-store"
import {
  getSalesOrders,
  getSalesOrderDetail,
  getAddressDetailByName,
  ISalesOrderListItem,
} from "@/app/actions/sales-order-list-action"
import { toast } from "sonner"
import { ClipboardList, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

const OrderListPage = () => {
  const router = useRouter()
  const [orders, setOrders] = useState<ISalesOrderListItem[]>([])
  const [isPending, startTransition] = useTransition()
  const [isNavigating, setIsNavigating] = useState(false)

  const { filters, isLoading, setIsLoading } = useOrderListStore()
  const { setCustomer, setCustomerAddress, setDeliveryDate, setPaymentTerms, setCustomNote, setCustomFinalized, clearOrderDetails } = useOrderStore()
  const { clearCart, addItem } = useCartStore()

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await getSalesOrders(filters)
      if (response.success) {
        setOrders(response.data)
      } else {
        toast.error(response.message || "Failed to load orders")
      }
    } catch {
      toast.error("Failed to load orders")
    } finally {
      setIsLoading(false)
    }
  }, [filters, setIsLoading])

  // Initial load and filter changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchOrders()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [fetchOrders])

  // Handle row click - fetch order details and navigate to edit
  const handleRowClick = useCallback(
    async (orderName: string) => {
      if (isNavigating) return

      setIsNavigating(true)
      startTransition(async () => {
        try {
          // Fetch order details
          const orderResponse = await getSalesOrderDetail(orderName)

          if (!orderResponse.success || !orderResponse.data) {
            toast.error("Failed to load order details")
            setIsNavigating(false)
            return
          }

          const orderDetails = orderResponse.data

          // Clear previous order data
          clearOrderDetails()
          clearCart()

          // Set order details in store
          setCustomer(orderDetails.customer, orderDetails.customer_name)
          setDeliveryDate(orderDetails.delivery_date)
          setPaymentTerms(orderDetails.payment_terms_template || "")
          setCustomNote(orderDetails.custom_note || "")
          setCustomFinalized(orderDetails.order_finalized === 1)

          // Fetch and set address details
          if (orderDetails.customer_address) {
            const addressResponse = await getAddressDetailByName(
              orderDetails.customer_address
            )
            if (addressResponse.success && addressResponse.data) {
              const addr = addressResponse.data
              const addressDisplay = [
                addr.address_line1,
                addr.address_line2,
                addr.city,
                addr.state,
                addr.country,
                addr.pincode,
              ]
                .filter(Boolean)
                .join(", ")

              setCustomerAddress(orderDetails.customer_address, addressDisplay)
            }
          }

          // Add cart items
          if (orderDetails.items && Array.isArray(orderDetails.items)) {
            orderDetails.items.forEach((item) => {
              addItem({
                item_code: item.item_code,
                item_name: item.item_name,
                quantity: item.qty,
                rate: item.rate,
                price_list_rate: item.rate,
                sales_uom: item.uom,
                uom_factor: 1,
                is_foc: item.rate === 0,
              })
            })
          }

          // Navigate to sales order page for editing
          router.push("/sales-order")
        } catch {
          toast.error("Failed to load order details")
        } finally {
          setIsNavigating(false)
        }
      })
    },
    [
      isNavigating,
      clearOrderDetails,
      clearCart,
      setCustomer,
      setCustomerAddress,
      setDeliveryDate,
      setPaymentTerms,
      setCustomNote,
      setCustomFinalized,
      addItem,
      router,
    ]
  )

  const handleFilterChange = useCallback(() => {
    // Filter changes trigger useEffect via filters dependency
  }, [])

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <ClipboardList className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Order List</h1>
            <p className="text-sm text-white/70">
              View and manage your sales orders
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          disabled={isLoading}
        >
          <RefreshCw className={`size-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <OrderFilters onFilterChange={handleFilterChange} />

      {/* Orders Table */}
      <OrderTable
        orders={orders}
        isLoading={isLoading || isPending || isNavigating}
        onRowClick={handleRowClick}
      />
    </div>
  )
}

export default OrderListPage
