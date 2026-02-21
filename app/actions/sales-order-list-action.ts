"use server"

import { cookies } from "next/headers"

export type OrderStatusFilter = "all" | "finalized" | "draft"

export interface ISalesOrderListItem {
  name: string
  customer: string
  customer_name: string
  delivery_date: string
  grand_total: number
  delivery_status: string
  order_finalized: number
  creation: string
  owner: string
  custom_note: string | null
}

export interface ISalesOrderFilters {
  status: OrderStatusFilter
  deliveryDate: string
  customerName: string
}

export interface ISalesOrderListResponse {
  success: boolean
  data: ISalesOrderListItem[]
  message?: string
}

export interface ISalesOrderDetail {
  name: string
  customer: string
  customer_name: string
  customer_address: string
  delivery_date: string
  payment_terms_template: string
  order_finalized: number
  custom_note: string | null
  grand_total: number
  items: {
    item_code: string
    item_name: string
    qty: number
    rate: number
    uom: string
    amount: number
  }[]
}

export interface ISalesOrderDetailResponse {
  success: boolean
  data: ISalesOrderDetail | null
  message?: string
}

export interface ICustomerDetail {
  name: string
  customer_name: string
  customer_type: string
  customer_group: string
  territory: string
  mobile_no: string | null
  email_id: string | null
}

export interface IAddressDetail {
  name: string
  address_title: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string | null
  country: string
  pincode: string | null
}

/**
 * Build filter query for sales orders API
 */
function buildFilterQuery(
  filters: ISalesOrderFilters,
  ownerEmail: string
): string {
  const filterArray: (string | number)[][] = []

  // Filter based on order_finalized status
  if (filters.status === "finalized") {
    filterArray.push(["order_finalized", "=", 1])
  } else if (filters.status === "draft") {
    filterArray.push(["order_finalized", "=", 0])
  }

  // Filter based on delivery date
  if (filters.deliveryDate) {
    filterArray.push(["delivery_date", "=", filters.deliveryDate])
  }

  // Filter based on customer name
  if (filters.customerName) {
    filterArray.push(["customer_name", "like", `%${filters.customerName}%`])
  }

  // Filter based on the owner (email)
  filterArray.push(["owner", "=", ownerEmail])

  return filterArray.length > 0
    ? `&filters=${encodeURIComponent(JSON.stringify(filterArray))}`
    : ""
}

/**
 * Fetch sales orders with optional filters
 */
export async function getSalesOrders(
  filters: ISalesOrderFilters
): Promise<ISalesOrderListResponse> {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ")

    // Get user email from cookies
    const userEmail = cookieStore.get("logged-in-user")?.value || ""

    const filterQuery = buildFilterQuery(filters, userEmail)

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Order?fields=["*"]&limit_page_length=None${filterQuery}`,
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
        message: "Failed to fetch sales orders",
      }
    }

    const result = await response.json()

    // Sort by creation date (newest first)
    const sortedOrders = (result.data || []).sort(
      (a: ISalesOrderListItem, b: ISalesOrderListItem) =>
        new Date(b.creation).getTime() - new Date(a.creation).getTime()
    )

    return {
      success: true,
      data: sortedOrders,
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "Something went wrong",
    }
  }
}

/**
 * Fetch single sales order details by name
 */
export async function getSalesOrderDetail(
  orderName: string
): Promise<ISalesOrderDetailResponse> {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ")

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Order/${encodeURIComponent(orderName)}`,
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
        data: null,
        message: "Failed to fetch order details",
      }
    }

    const result = await response.json()

    return {
      success: true,
      data: result.data,
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : "Something went wrong",
    }
  }
}

/**
 * Fetch customer details by customer name
 */
export async function getCustomerDetailByName(
  customerName: string
): Promise<{ success: boolean; data: ICustomerDetail | null; message?: string }> {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ")

    const filters = JSON.stringify([["name", "=", customerName]])

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Customer?fields=["*"]&filters=${encodeURIComponent(filters)}`,
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
        data: null,
        message: "Failed to fetch customer details",
      }
    }

    const result = await response.json()

    return {
      success: true,
      data: result.data?.[0] || null,
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : "Something went wrong",
    }
  }
}

/**
 * Fetch address details by address name
 */
export async function getAddressDetailByName(
  addressName: string
): Promise<{ success: boolean; data: IAddressDetail | null; message?: string }> {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ")

    const filters = JSON.stringify([["name", "=", addressName]])

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Address?filters=${encodeURIComponent(filters)}&fields=["*"]`,
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
        data: null,
        message: "Failed to fetch address details",
      }
    }

    const result = await response.json()

    return {
      success: true,
      data: result.data?.[0] || null,
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : "Something went wrong",
    }
  }
}
