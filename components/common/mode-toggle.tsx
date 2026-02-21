"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <button
      onClick={toggleTheme}
      disabled={!mounted}
      className={`
        relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full 
        transition-all duration-300 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${isDark 
          ? "bg-indigo-500 shadow-[inset_0_1px_1px_rgba(0,0,0,0.1)]" 
          : "bg-white/30 shadow-[inset_0_1px_4px_rgba(0,0,0,0.1)]"
        }
      `}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      role="switch"
      aria-checked={isDark}
    >
      {/* Track icons */}
      <span className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <Sun className={`h-3.5 w-3.5 transition-opacity duration-200 ${isDark ? "opacity-0" : "opacity-50 text-yellow-200"}`} />
        <Moon className={`h-3.5 w-3.5 transition-opacity duration-200 ${isDark ? "opacity-50 text-indigo-200" : "opacity-0"}`} />
      </span>
      
      {/* Knob */}
      <span
        className={`
          pointer-events-none absolute flex h-6 w-6 items-center justify-center rounded-full 
          bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.1)]
          transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
          ${isDark ? "left-7" : "left-1"}
        `}
      >
        {mounted && (
          isDark ? (
            <Moon className="h-3.5 w-3.5 text-indigo-500" />
          ) : (
            <Sun className="h-3.5 w-3.5 text-amber-500" />
          )
        )}
      </span>
    </button>
  )
}

