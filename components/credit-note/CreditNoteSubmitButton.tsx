"use client"

import { useState, useTransition } from "react"
import { useCreditNoteStore } from "@/store/credit-note-store"
import { submitCreditNote } from "@/app/actions/credit-note-action"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, Send, CheckCircle2, AlertCircle } from "lucide-react"

export default function CreditNoteSubmitButton() {
  const [isPending, startTransition] = useTransition()
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const { creditNoteDetails, items, clearCreditNote } = useCreditNoteStore()

  const canSubmit =
    creditNoteDetails.customer &&
    creditNoteDetails.customer_address &&
    items.length > 0

  const handleSubmit = () => {
    if (!canSubmit) {
      toast.error("Please fill in all required fields and add items")
      return
    }

    startTransition(async () => {
      setSubmitStatus("idle")

      const response = await submitCreditNote(creditNoteDetails, items)

      if (response.success) {
        setSubmitStatus("success")
        toast.success("Credit note submitted successfully!", {
          description: `Credit Note: ${response.data?.name}`,
        })

        // Clear the form after successful submission
        clearCreditNote()

        // Reset status after a delay
        setTimeout(() => setSubmitStatus("idle"), 3000)
      } else {
        setSubmitStatus("error")
        toast.error("Failed to submit credit note", {
          description: response.message,
        })

        // Reset status after a delay
        setTimeout(() => setSubmitStatus("idle"), 3000)
      }
    })
  }

  // Validation messages
  const validationMessages = []
  if (!creditNoteDetails.customer) {
    validationMessages.push("Select a customer")
  }
  if (!creditNoteDetails.customer_address) {
    validationMessages.push("Select a customer address")
  }
  if (items.length === 0) {
    validationMessages.push("Add at least one item")
  }

  return (
    <div className="space-y-4">
      {/* Validation Messages */}
      {validationMessages.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-2">
            <AlertCircle className="size-4 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-400">Required before submit:</p>
              <ul className="text-xs text-amber-400/70 mt-1 space-y-0.5">
                {validationMessages.map((msg, i) => (
                  <li key={i}>• {msg}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {submitStatus === "success" && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <p className="text-sm font-medium text-emerald-400">
              Credit note submitted successfully!
            </p>
          </div>
        </div>
      )}

      <div className="w-full lg:h-0 h-20"></div>

      {/* Submit Button */}
      <div className="lg:relative fixed bottom-0 left-0 right-0 lg:p-0 p-4 lg:bg-transparent bg-bg/95 backdrop-blur-md lg:border-0 border-t border-white/10 z-50">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isPending}
          className="mb-2 lg:mb-4 w-full h-12 bg-linear-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
          size="lg"
        >
          {isPending ? (
            <>
              <Loader2 className="size-5 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="size-5 mr-2" />
              Submit Credit Note
            </>
          )}
        </Button>

        <p className="text-xs text-center text-white/40">
          Please review all details before submitting
        </p>
      </div>
    </div>
  )
}
