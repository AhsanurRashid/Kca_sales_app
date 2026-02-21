"use client"

import { ICreditNoteListItem } from "@/app/actions/credit-note-list-action"
import CreditNoteStatusBadge from "./CreditNoteStatusBadge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { FileX2, Loader2 } from "lucide-react"

interface CreditNoteListTableProps {
  creditNotes: ICreditNoteListItem[]
  isLoading: boolean
  onRowClick?: (creditNoteName: string) => void
}

export default function CreditNoteListTable({
  creditNotes,
  isLoading,
  onRowClick,
}: CreditNoteListTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-white/50">
          <Loader2 className="size-8 animate-spin" />
          <p className="text-sm">Loading credit notes...</p>
        </div>
      </div>
    )
  }

  if (creditNotes.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-white/50">
          <FileX2 className="size-12 opacity-50" />
          <p className="text-sm">No credit notes found</p>
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
                Credit Note ID
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-white/50">
                Posting Date
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-white/50">
                Total
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-white/50">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {creditNotes.map((creditNote) => (
              <tr
                key={creditNote.name}
                onClick={() => onRowClick?.(creditNote.name)}
                className={`transition-colors hover:bg-white/5 ${
                  onRowClick ? "cursor-pointer" : ""
                } ${
                  creditNote.docstatus === 1
                    ? "bg-green-500/5"
                    : ""
                }`}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{creditNote.customer_name}</div>
                </td>
                <td className="px-4 py-3">
                  <code className="text-sm text-white/70 bg-white/10 px-1.5 py-0.5 rounded">
                    {creditNote.name}
                  </code>
                </td>
                <td className="px-4 py-3 text-sm text-white/70">
                  {formatDate(creditNote.posting_date)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-medium text-white">
                    {formatCurrency(Math.abs(creditNote.grand_total))}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <CreditNoteStatusBadge docstatus={creditNote.docstatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Credit note count footer */}
      <div className="border-t border-white/10 px-4 py-3 bg-white/5">
        <p className="text-sm text-white/50">
          Showing <span className="font-medium text-white">{creditNotes.length}</span>{" "}
          credit note{creditNotes.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  )
}
