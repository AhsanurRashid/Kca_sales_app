"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { menus } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { useToggleSidebarStore } from "@/store/toggleSidebar-store"
import { 
  X, 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  FileText, 
  Files, 
  CreditCard, 
  Wallet,
  LucideIcon 
} from "lucide-react"
import { Button } from "@/components/ui/button"

const iconMap: Record<string, LucideIcon> = {
  Package,
  ShoppingCart,
  ClipboardList,
  FileText,
  Files,
  CreditCard,
  Wallet,
}

const Sidebar = () => {
  const pathname = usePathname()
  const { isSidebarOpen, setSidebarOpen } = useToggleSidebarStore()

  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed top-0 left-0 h-screen w-70 bg-bg dark:bg-white/5 backdrop-blur-xl border-r border-white/20 z-50 transition-transform duration-300 ease-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header with close button */}
        <div className="p-4 flex items-center justify-between">
          <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
            <Image src="/assets/images/logo.webp" alt="Logo" width={32} height={32} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="size-5" />
          </Button>
        </div>
        
        {/* Navigation */}
        <div className="p-3 w-full overflow-y-auto h-[calc(100vh-88px)]">
          <nav className="flex flex-col gap-1">
            {menus.dashboard.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon ? iconMap[item.icon] : null
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-white/20 text-white border border-white/30 shadow-lg"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {Icon && (
                    <div className={cn(
                      "size-8 rounded-lg flex items-center justify-center transition-all",
                      isActive 
                        ? "bg-white/20" 
                        : "bg-white/10"
                    )}>
                      <Icon className="size-4" strokeWidth={1.5} />
                    </div>
                  )}
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}

export default Sidebar
