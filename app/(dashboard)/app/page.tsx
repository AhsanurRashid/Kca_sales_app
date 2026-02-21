import Link from "next/link"
import { menus } from "@/lib/utils"
import {
  Package,
  ShoppingCart,
  ClipboardList,
  FileText,
  Files,
  CreditCard,
  Wallet,
  LucideIcon,
} from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  Package,
  ShoppingCart,
  ClipboardList,
  FileText,
  Files,
  CreditCard,
  Wallet,
}

const HomePage = () => {
  return (
    <div className="space-y-6 max-w-lg mx-auto p-4">
      <div className="grid grid-cols-2 gap-4">
        {menus.dashboard.map((item) => {
          const Icon = item.icon ? iconMap[item.icon] : null
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                {Icon && (
                  <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Icon className="size-6 text-white/70 group-hover:text-white transition-colors" />
                  </div>
                )}
                <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                  {item.name}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default HomePage
