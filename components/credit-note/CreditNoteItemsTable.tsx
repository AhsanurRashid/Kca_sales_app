"use client"

import { useCreditNoteStore, ICreditNoteItem } from "@/store/credit-note-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, Trash2, Minus, Plus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

export default function CreditNoteItemsTable() {
  const { items, removeItem, updateItemQuantity, updateItemRate, getTotal, getItemCount } =
    useCreditNoteStore()
  const total = getTotal()
  const itemCount = getItemCount()

  const handleQuantityChange = (index: number, delta: number) => {
    const item = items[index]
    const newQty = Math.max(1, item.quantity + delta)
    updateItemQuantity(index, newQty)
  }

  const handleRateChange = (index: number, value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num) && num >= 0) {
      updateItemRate(index, num)
    }
  }

  return (
    <div className="w-full">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="size-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
            <Package className="size-8 text-white/40" />
          </div>
          <div>
            <h3 className="font-medium text-white/90">No items in credit note</h3>
            <p className="text-sm text-white/50 mt-1">
              Add products to get started
            </p>
          </div>
          <Link href="/credit-note/products">
            <Button variant="outline" size="sm">
              Add Items
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Items Header */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider px-1">
              Items ({items.length})
            </p>
            <Link href="/credit-note/products">
              <Button variant="outline" size="sm" className="h-7 text-xs">
                Add More
              </Button>
            </Link>
          </div>

          {/* Items List */}
          <div className="flex flex-col gap-2">
            {items.map((item, index) => (
              <CreditNoteItemRow
                key={`${item.item_code}-${index}`}
                item={item}
                index={index}
                onQuantityChange={handleQuantityChange}
                onRateChange={handleRateChange}
                onRemove={() => removeItem(index)}
              />
            ))}
          </div>

          {/* Total */}
          <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Total ({itemCount} items)</span>
              <span className="text-xl font-bold text-white tracking-tight">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface CreditNoteItemRowProps {
  item: ICreditNoteItem
  index: number
  onQuantityChange: (index: number, delta: number) => void
  onRateChange: (index: number, value: string) => void
  onRemove: () => void
}

const CreditNoteItemRow = ({
  item,
  index,
  onQuantityChange,
  onRateChange,
  onRemove,
}: CreditNoteItemRowProps) => {
  return (
    <div className="rounded-xl bg-white/10 border border-white/15 p-3 transition-all hover:bg-white/15">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-white/40 font-mono tracking-wide">
            {item.item_code}
          </p>
          <h4 className="font-medium text-sm text-white truncate mt-0.5">
            {item.item_name}
          </h4>
          <p className="text-xs text-white/50 mt-0.5">
            {item.sales_uom} × 1
          </p>
        </div>
        <button
          onClick={onRemove}
          className="rounded-lg p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <div className="mt-2.5 flex items-center gap-3">
        {/* Quantity */}
        <div className="flex items-center">
          <button
            className="size-7 rounded-l-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
            onClick={() => onQuantityChange(index, -1)}
            disabled={item.quantity <= 1}
          >
            <Minus className="size-3" />
          </button>
          <div className="h-7 w-10 bg-white/5 border-y border-white/20 flex items-center justify-center text-sm text-white font-medium">
            {item.quantity}
          </div>
          <button
            className="size-7 rounded-r-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all"
            onClick={() => onQuantityChange(index, 1)}
          >
            <Plus className="size-3" />
          </button>
        </div>

        {/* Rate */}
        <div className="flex items-center gap-1 flex-1">
          <span className="text-xs text-white/40">$</span>
          <Input
            type="text"
            value={item.rate.toFixed(2)}
            onChange={(e) => onRateChange(index, e.target.value)}
            className="h-7 w-20 text-sm bg-white/5 border-white/20 text-white rounded-lg focus:border-white/40"
          />
        </div>

        {/* Amount */}
        <div className="text-right ml-auto">
          <span className="text-sm font-semibold text-white">
            {formatCurrency(item.amount)}
          </span>
        </div>
      </div>
    </div>
  )
}
