"use client"

import { useEffect } from "react"
import { useUserStore } from "@/store/user-store"
import { getUserFromCookie } from "@/app/actions/login-action"

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { hydrate, isHydrated } = useUserStore()

  useEffect(() => {
    if (!isHydrated) {
      getUserFromCookie().then((user) => {
        hydrate(user)
      })
    }
  }, [hydrate, isHydrated])

  return <>{children}</>
}
