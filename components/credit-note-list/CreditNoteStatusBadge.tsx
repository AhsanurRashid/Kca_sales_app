import { cn } from "@/lib/utils"
import { CheckCircle2, FileText } from "lucide-react"

interface CreditNoteStatusBadgeProps {
  docstatus: number
  className?: string
}

export default function CreditNoteStatusBadge({
  docstatus,
  className,
}: CreditNoteStatusBadgeProps) {
  const isSubmitted = docstatus === 1

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        isSubmitted
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        className
      )}
    >
      {isSubmitted ? (
        <>
          <CheckCircle2 className="size-3" />
          Submitted
        </>
      ) : (
        <>
          <FileText className="size-3" />
          Draft
        </>
      )}
    </span>
  )
}
