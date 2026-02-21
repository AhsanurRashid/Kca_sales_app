"use server"

import { cookies } from "next/headers"

export async function logoutAction(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/method/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    })

    const cookieStore = await cookies()
    cookieStore.delete("logged-in-user")

    if (!response.ok) {
      return {
        success: false,
        message: "Logout failed",
      }
    }

    return {
      success: true,
      message: "Logged out successfully",
    }
  } catch (error) {
    console.error("Logout error:", error)
    const cookieStore = await cookies()
    cookieStore.delete("logged-in-user")
    
    return {
      success: false,
      message: "An unexpected error occurred",
    }
  }
}