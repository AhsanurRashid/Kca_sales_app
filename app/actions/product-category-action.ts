"use server"

import { cookies } from "next/headers"

export interface IProductCategory {
  name: string
  creation: string
  modified: string
  modified_by: string
  owner: string
  docstatus: number
  idx: number
  item_group_name: string
  parent_item_group: string
  is_group: number
  image: string | null
  route: string | null
  website_title: string | null
  description: string | null
  show_in_website: number
  include_descendants: number
  weightage: number
  slideshow: string | null
  lft: number
  rgt: number
  old_parent: string | null
  _user_tags: string | null
  _comments: string | null
  _assign: string | null
  _liked_by: string | null
}

export interface IProductCategoryResponse {
  success: boolean
  data: IProductCategory[]
  message?: string
}

export async function getProductCategories(): Promise<IProductCategoryResponse> {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join("; ")

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item%20Group?fields=["*"]&limit_page_length=None`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        cache: "no-store",
      }
    )

    if (!response.ok) {
      return {
        success: false,
        data: [],
        message: "Failed to fetch product categories",
      }
    }

    const result = await response.json()

    return {
      success: true,
      data: result.data || [],
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "Something went wrong",
    }
  }
}
