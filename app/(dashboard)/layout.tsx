import Navbar from "@/components/dashboard/navbar"
import Sidebar from "@/components/dashboard/sidebar"
import CartPanel from "@/components/dashboard/CartPanel"

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full min-h-screen flex items-start bg-bg relative overflow-hidden">
      
      <Sidebar />
      <div className="flex-1 min-w-0 min-h-screen flex flex-col relative z-10">
        <Navbar />
        <div className="flex-1 p-4 pt-20 overflow-y-auto">
          {children}
        </div>
      </div>
      
      {/* Cart Panel */}
      <CartPanel />
    </div>
  )
}

export default DashboardLayout
