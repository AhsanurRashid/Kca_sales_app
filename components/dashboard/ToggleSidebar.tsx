"use client"
import { Menu } from "lucide-react" 
import { useToggleSidebarStore } from "@/store/toggleSidebar-store"
import { Button } from "@/components/ui/button"

const ToggleSidebar = () => {
    const { isSidebarOpen, setSidebarOpen } = useToggleSidebarStore()
    return (
        <Button 
          variant="ghost" 
          size="icon" 
          className="cursor-pointer text-white hover:bg-white/10 rounded-xl" 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
            <Menu /> 
        </Button>
    )
}

export default ToggleSidebar
