"use client"

import { ISalesOrderListItem } from "@/app/actions/sales-order-list-action"
import OrderStatusBadge, { DeliveryStatusBadge } from "./OrderStatusBadge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { FileX2, Loader2 } from "lucide-react"

interface OrderTableProps {
  orders: ISalesOrderListItem[]
  isLoading: boolean
  onRowClick: (orderName: string) => void
}

export default function OrderTable({
  orders,
  isLoading,
  onRowClick,
}: OrderTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-white/50">
          <Loader2 className="size-8 animate-spin" />
          <p className="text-sm">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-white/50">
          <FileX2 className="size-12 opacity-50" />
          <p className="text-sm">No orders found</p>
          <p className="text-xs">Try adjusting your filters</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left px-4 py-3 text-sm font-medium text-white/50">
                Customer
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-white/50">
                Order ID
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-white/50">
                Delivery Date
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-white/50">
                Total
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-white/50">
                Status
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-white/50">
                Delivery
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {orders.map((order) => (
              <tr
                key={order.name}
                onClick={() => onRowClick(order.name)}
                className={`cursor-pointer transition-colors hover:bg-white/5 ${
                  order.order_finalized === 1
                    ? "bg-green-500/5"
                    : ""
                }`}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{order.customer_name}</div>
                </td>
                <td className="px-4 py-3">
                  <code className="text-sm text-white/70 bg-white/10 px-1.5 py-0.5 rounded">
                    {order.name}
                  </code>
                </td>
                <td className="px-4 py-3 text-sm text-white/70">
                  {formatDate(order.delivery_date)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-medium text-white">
                    {formatCurrency(order.grand_total)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge isFinalized={order.order_finalized === 1} />
                </td>
                <td className="px-4 py-3">
                  <DeliveryStatusBadge status={order.delivery_status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order count footer */}
      <div className="border-t border-white/10 px-4 py-3 bg-white/5">
        <p className="text-sm text-white/50">
          Showing <span className="font-medium text-white">{orders.length}</span>{" "}
          order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  )
}
