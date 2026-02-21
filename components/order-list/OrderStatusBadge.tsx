import { cn } from "@/lib/utils"
import { CheckCircle2, Clock, FileText } from "lucide-react"

interface OrderStatusBadgeProps {
  isFinalized: boolean
  className?: string
}

export default function OrderStatusBadge({
  isFinalized,
  className,
}: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        isFinalized
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        className
      )}
    >
      {isFinalized ? (
        <>
          <CheckCircle2 className="size-3" />
          Finalized
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

interface DeliveryStatusBadgeProps {
  status: string
  className?: string
}

export function DeliveryStatusBadge({
  status,
  className,
}: DeliveryStatusBadgeProps) {
  const getStatusStyle = () => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "partly delivered":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "not delivered":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        getStatusStyle(),
        className
      )}
    >
      <Clock className="size-3" />
      {status || "Pending"}
    </span>
  )
}
