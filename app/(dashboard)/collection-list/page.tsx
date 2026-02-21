"use client"

import { useEffect, useState, useCallback } from "react"
import { PaymentListFilters, PaymentListTable } from "@/components/payment-list"
import { usePaymentListStore } from "@/store/payment-list-store"
import {
  getPaymentEntries,
  IPaymentListItem,
} from "@/app/actions/payment-list-action"
import { toast } from "sonner"
import { Wallet, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

const PaymentListPage = () => {
  const [payments, setPayments] = useState<IPaymentListItem[]>([])

  const { filters, isLoading, setIsLoading } = usePaymentListStore()

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await getPaymentEntries(filters)
      if (response.success) {
        setPayments(response.data)
      } else {
        toast.error(response.message || "Failed to load payments")
      }
    } catch {
      toast.error("Failed to load payments")
    } finally {
      setIsLoading(false)
    }
  }, [filters, setIsLoading])

  // Initial load and filter changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPayments()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [fetchPayments])

  const handleFilterChange = useCallback(() => {
    // Filter changes trigger useEffect via filters dependency
  }, [])

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Wallet className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Payment List</h1>
            <p className="text-sm text-white/70">
              View and manage your payment entries
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPayments}
          disabled={isLoading}
        >
          <RefreshCw className={`size-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <PaymentListFilters onFilterChange={handleFilterChange} />

      {/* Payments Table */}
      <PaymentListTable
        payments={payments}
        isLoading={isLoading}
      />
    </div>
  )
}

export default PaymentListPage
