"use client"

import { IPaymentListItem } from "@/app/actions/payment-list-action"
import PaymentStatusBadge from "./PaymentStatusBadge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { FileX2, Loader2 } from "lucide-react"

interface PaymentListTableProps {
  payments: IPaymentListItem[]
  isLoading: boolean
  onRowClick?: (paymentName: string) => void
}

export default function PaymentListTable({
  payments,
  isLoading,
  onRowClick,
}: PaymentListTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-white/50">
          <Loader2 className="size-8 animate-spin" />
          <p className="text-sm">Loading payments...</p>
        </div>
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-white/50">
          <FileX2 className="size-12 opacity-50" />
          <p className="text-sm">No payments found</p>
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
                Payment ID
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-white/50">
                Date
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-white/50">
                Amount
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-white/50">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {payments.map((payment) => (
              <tr
                key={payment.name}
                onClick={() => onRowClick?.(payment.name)}
                className={`transition-colors hover:bg-white/5 ${
                  onRowClick ? "cursor-pointer" : ""
                } ${
                  payment.docstatus === 1
                    ? "bg-green-500/5"
                    : ""
                }`}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{payment.party_name}</div>
                </td>
                <td className="px-4 py-3">
                  <code className="text-sm text-white/70 bg-white/10 px-1.5 py-0.5 rounded">
                    {payment.name}
                  </code>
                </td>
                <td className="px-4 py-3 text-sm text-white/70">
                  {formatDate(payment.posting_date)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-medium text-white">
                    {formatCurrency(payment.paid_amount)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <PaymentStatusBadge docstatus={payment.docstatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment count footer */}
      <div className="border-t border-white/10 px-4 py-3 bg-white/5">
        <p className="text-sm text-white/50">
          Showing <span className="font-medium text-white">{payments.length}</span>{" "}
          payment{payments.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  )
}
