"use client"
import Image from "next/image"
import Link from "next/link"

const NavbarLogo = () => {
  return (
    <Link href="/" className="mr-2">
      <div className="size-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
        <Image src="/assets/images/logo.webp" alt="Logo" width={28} height={28} />
      </div>
    </Link>
  )
}

export default NavbarLogo
