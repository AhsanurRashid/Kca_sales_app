"use client"

import { logoutAction } from "@/app/actions/logout-action"
import { useUserStore } from "@/store/user-store"
import { useLocationTrackerStore } from "@/store/location-tracker-store"
import { useRouter } from "next/navigation"
import { User, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getInitials } from "@/lib/utils"


const Profile = () => {
  const { user, setUser, isHydrated } = useUserStore()
  const { stopTracking } = useLocationTrackerStore()
  const router = useRouter()

  const handleLogout = async () => {
    // Stop location tracking immediately before logout
    stopTracking()

    const result = await logoutAction()
    if (result.success) {
      setUser(null)
      router.push("/")
    }
  }

  if (!isHydrated) {
    return (
      <div className="w-10 h-10 rounded-xl bg-white/20 animate-pulse" />
    )
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="cursor-pointer relative z-0">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 w-10 h-10 flex items-center justify-center rounded-xl shadow-lg text-sm font-semibold text-white">
              {getInitials(user?.full_name || "")}
            </div>
            <div className="absolute -top-0.5 -right-0.5 bg-emerald-400 w-3 h-3 rounded-full border-2 border-white/30 z-10"></div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl" align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-white/90">{user?.full_name}</DropdownMenuLabel>
            <DropdownMenuItem className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-white/20" />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleLogout} className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default Profile
