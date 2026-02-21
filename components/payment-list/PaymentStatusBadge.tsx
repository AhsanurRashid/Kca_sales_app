interface PaymentStatusBadgeProps {
  docstatus: number
}

export default function PaymentStatusBadge({ docstatus }: PaymentStatusBadgeProps) {
  const isSubmitted = docstatus === 1

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isSubmitted
          ? "bg-green-500/20 text-green-400"
          : "bg-amber-500/20 text-amber-400"
      }`}
    >
      {isSubmitted ? "Submitted" : "Draft"}
    </span>
  )
}
