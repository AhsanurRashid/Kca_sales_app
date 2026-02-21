"use client"

import { useCallback } from "react"
import { usePaymentListStore } from "@/store/payment-list-store"
import { PaymentStatusFilter } from "@/app/actions/payment-list-action"
import { Search, X, Filter, Calendar, User } from "lucide-react"

interface PaymentListFiltersProps {
  onFilterChange: () => void
}

const statusOptions: { value: PaymentStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "submitted", label: "Submitted" },
  { value: "draft", label: "Draft" },
]

export default function PaymentListFilters({ onFilterChange }: PaymentListFiltersProps) {
  const {
    filters,
    setStatusFilter,
    setPostingDateFilter,
    setCustomerNameFilter,
    resetFilters,
  } = usePaymentListStore()

  const handleStatusChange = useCallback(
    (status: PaymentStatusFilter) => {
      setStatusFilter(status)
      onFilterChange()
    },
    [setStatusFilter, onFilterChange]
  )

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPostingDateFilter(e.target.value)
      onFilterChange()
    },
    [setPostingDateFilter, onFilterChange]
  )

  const handleCustomerNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomerNameFilter(e.target.value)
      onFilterChange()
    },
    [setCustomerNameFilter, onFilterChange]
  )

  const handleReset = useCallback(() => {
    resetFilters()
    onFilterChange()
  }, [resetFilters, onFilterChange])

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.postingDate !== "" ||
    filters.customerName !== ""

  return (
    <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-end">
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors"
          >
            <X className="size-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-white uppercase tracking-wide">
            <Filter className="size-3" />
            Status
          </label>
          <div className="flex gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`px-4 py-3 text-sm rounded-xl border transition-all flex-1 ${
                  filters.status === option.value
                    ? "bg-white/20 text-white border-white/30"
                    : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Posting Date Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-white uppercase tracking-wide">
            <Calendar className="size-3" />
            Posting Date
          </label>
          <input
            type="date"
            value={filters.postingDate}
            onChange={handleDateChange}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        {/* Customer Name Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-white uppercase tracking-wide">
            <User className="size-3" />
            Customer Name
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/40" />
            <input
              type="text"
              placeholder="Search customer..."
              value={filters.customerName}
              onChange={handleCustomerNameChange}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
