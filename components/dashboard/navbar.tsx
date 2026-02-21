// import { ModeToggle } from "@/components/common/mode-toggle"
import ToggleSidebar from "./ToggleSidebar"
import Profile from "@/components/dashboard/profile"
import NavbarLogo from "./NavbarLogo"
import CartButton from "./CartButton"

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-20 bg-white/10 dark:bg-white/5 backdrop-blur-xl w-full h-16 flex items-center justify-between px-4 border-b border-white/20">
      <div className="flex items-center gap-2">
        <NavbarLogo />
        <ToggleSidebar />
      </div>
      <div className="flex items-center gap-3">
        {/* <ModeToggle /> */}
        <CartButton />
        <Profile />
      </div>
    </nav>
  )
}

export default Navbar
