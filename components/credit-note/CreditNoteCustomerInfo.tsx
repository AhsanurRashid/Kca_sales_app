"use client"

import { useCreditNoteStore } from "@/store/credit-note-store"
import { User, MapPin, FileText, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CreditNoteCustomerInfo() {
  const { creditNoteDetails } = useCreditNoteStore()

  const hasCustomer = !!creditNoteDetails.customer
  const hasAddress = !!creditNoteDetails.customer_address

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
          <User className="size-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Credit Note Details</h2>
          <p className="text-xs text-white/60">Customer and return information</p>
        </div>
      </div>

      {!hasCustomer ? (
        <div className="rounded-xl bg-white/10 border border-white/15 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-white/10 flex items-center justify-center">
                <User className="size-5 text-white/40" />
              </div>
              <div>
                <p className="text-sm text-white/60">No customer selected</p>
                <p className="text-xs text-white/40">Select a customer to continue</p>
              </div>
            </div>
            <Link href="/credit-note/customer">
              <Button size="sm" variant="outline">
                Select Customer
                <ChevronRight className="size-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Customer */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider px-1 flex items-center gap-1.5">
              <User className="size-3.5" />
              Customer
            </label>
            <Link href="/credit-note/customer">
              <div className="rounded-xl bg-white/10 border border-white/15 p-3 transition-all hover:bg-white/15 flex items-center justify-between cursor-pointer">
                <span className="text-sm text-white font-medium">
                  {creditNoteDetails.customer_name}
                </span>
                <ChevronRight className="size-4 text-white/40" />
              </div>
            </Link>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider px-1 flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              Delivery Address
            </label>
            <Link href="/credit-note/customer">
              <div className="rounded-xl bg-white/10 border border-white/15 p-3 transition-all hover:bg-white/15 flex items-center justify-between cursor-pointer">
                {hasAddress ? (
                  <span className="text-sm text-white truncate pr-2">
                    {creditNoteDetails.customer_address_display}
                  </span>
                ) : (
                  <span className="text-sm text-amber-400">No address selected</span>
                )}
                <ChevronRight className="size-4 text-white/40 shrink-0" />
              </div>
            </Link>
          </div>

          {/* Return Against */}
          {creditNoteDetails.return_against && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider px-1 flex items-center gap-1.5">
                <FileText className="size-3.5" />
                Return Against
              </label>
              <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-3">
                <span className="text-sm text-blue-400 font-medium">
                  {creditNoteDetails.return_against}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
