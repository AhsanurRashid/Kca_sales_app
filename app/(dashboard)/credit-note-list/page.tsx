"use client"

import { useEffect, useState, useCallback } from "react"
import { CreditNoteListFilters, CreditNoteListTable } from "@/components/credit-note-list"
import { useCreditNoteListStore } from "@/store/credit-note-list-store"
import {
  getCreditNotes,
  ICreditNoteListItem,
} from "@/app/actions/credit-note-list-action"
import { toast } from "sonner"
import { ReceiptText, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

const CreditNoteListPage = () => {
  const [creditNotes, setCreditNotes] = useState<ICreditNoteListItem[]>([])

  const { filters, isLoading, setIsLoading } = useCreditNoteListStore()

  // Fetch credit notes
  const fetchCreditNotes = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await getCreditNotes(filters)
      if (response.success) {
        setCreditNotes(response.data)
      } else {
        toast.error(response.message || "Failed to load credit notes")
      }
    } catch {
      toast.error("Failed to load credit notes")
    } finally {
      setIsLoading(false)
    }
  }, [filters, setIsLoading])

  // Initial load and filter changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchCreditNotes()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [fetchCreditNotes])

  const handleFilterChange = useCallback(() => {
    // Filter changes trigger useEffect via filters dependency
  }, [])

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <ReceiptText className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Credit Note List</h1>
            <p className="text-sm text-white/70">
              View and manage your credit notes
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchCreditNotes}
          disabled={isLoading}
        >
          <RefreshCw className={`size-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <CreditNoteListFilters onFilterChange={handleFilterChange} />

      {/* Credit Notes Table */}
      <CreditNoteListTable
        creditNotes={creditNotes}
        isLoading={isLoading}
      />
    </div>
  )
}

export default CreditNoteListPage
