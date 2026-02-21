import { ModeToggle } from "@/components/common/mode-toggle"
import Image from "next/image"

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full bg-bg flex flex-col relative overflow-hidden">
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 pb-12">
        {children}
      </main>
      <footer className="relative z-10 p-6 text-center">
        <p className="text-xs text-white/60">
          Copyright © 2026 ERP Boss Inc. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default AuthLayout
