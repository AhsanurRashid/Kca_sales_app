"use server"

import { cookies } from "next/headers"
import { IActionResponse, IUser, loginFormSchema } from "@/lib/schema"

export async function getUserFromCookie(): Promise<IUser | null> {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get("logged-in-user")
  
  if (!userCookie?.value) {
    return null
  }
  
  try {
    return JSON.parse(userCookie.value) as IUser
  } catch {
    return null
  }
}

export async function loginAction(formData: FormData): Promise<IActionResponse> {
  const data = Object.fromEntries(formData.entries())
  const parsedData = loginFormSchema.safeParse(data)

  if (!parsedData.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: parsedData.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const loginData = {
    usr: parsedData.data.email,
    pwd: parsedData.data.password,
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/method/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(loginData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        message: errorData.message || "Invalid credentials",
        errors: errorData.errors || null,
      }
    }

    const loginResult = await response.json()

    // Get cookies from login response and store them
    const setCookieHeader = response.headers.get("set-cookie")
    const cookieStore = await cookies()
    
    // Parse and store ERPNext session cookies (sid, system_user, etc.)
    if (setCookieHeader) {
      // Split multiple cookies (they may be comma or newline separated)
      const cookieStrings = setCookieHeader.split(/,(?=\s*\w+=)/)
      
      for (const cookieStr of cookieStrings) {
        const [cookiePart] = cookieStr.split(";")
        const [name, ...valueParts] = cookiePart.trim().split("=")
        const value = valueParts.join("=") // Handle values that contain =
        
        if (name && value) {
          cookieStore.set(name.trim(), value.trim(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
          })
        }
      }
    }

    // Build cookie header for subsequent request
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join("; ")

    // Fetch user details using stored cookies
    const userResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resource/User/${encodeURIComponent(parsedData.data.email)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Cookie": cookieHeader,
        },
      }
    )

    if (!userResponse.ok) {
      const errorData = await userResponse.json()
      return {
        success: false,
        message: errorData.message || "Failed to fetch user details",
        errors: errorData.errors || null,
      }
    }

    // Consume response (user details fetched successfully)
    await userResponse.json()
    
    if (loginResult.full_name) {
      cookieStore.set("logged-in-user", JSON.stringify(loginResult) || "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })
    }

    return {
      user: loginResult || null,
      success: true,
      message: loginResult.message || "Login successful",
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
      errors: error instanceof Error ? error.message : String(error),
    }
  }
}

