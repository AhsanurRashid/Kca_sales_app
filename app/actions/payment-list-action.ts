"use server"

import { cookies } from "next/headers"

export type PaymentStatusFilter = "all" | "submitted" | "draft"

export interface IPaymentListItem {
  name: string
  party: string
  party_name: string
  posting_date: string
  paid_amount: number
  mode_of_payment: string
  docstatus: number
  creation: string
  owner: string
}

export interface IPaymentFilters {
  status: PaymentStatusFilter
  postingDate: string
  customerName: string
}

export interface IPaymentListResponse {
  success: boolean
  data: IPaymentListItem[]
  message?: string
}

export interface IPaymentDetail {
  name: string
  party: string
  party_name: string
  posting_date: string
  paid_amount: number
  received_amount: number
  mode_of_payment: string
  docstatus: number
  reference_no: string | null
  reference_date: string | null
  references: {
    reference_name: string
    allocated_amount: number
  }[]
}

export interface IPaymentDetailResponse {
  success: boolean
  data: IPaymentDetail | null
  message?: string
}

/**
 * Build filter query for payment entries API
 */
function buildFilterQuery(
  filters: IPaymentFilters,
  ownerEmail: string
): string {
  const filterArray: (string | number)[][] = []

  // Filter by owner
  filterArray.push(["owner", "=", ownerEmail])

  // Filter based on docstatus
  if (filters.status === "submitted") {
    filterArray.push(["docstatus", "=", 1])
  } else if (filters.status === "draft") {
    filterArray.push(["docstatus", "=", 0])
  }

  // Filter based on posting date
  if (filters.postingDate) {
    filterArray.push(["posting_date", "=", filters.postingDate])
  }

  // Filter based on customer name (like search)
  if (filters.customerName) {
    filterArray.push(["party_name", "like", `%${filters.customerName}%`])
  }

  return JSON.stringify(filterArray)
}

/**
 * Get payment entries with filters
 */
export async function getPaymentEntries(
  filters: IPaymentFilters
): Promise<IPaymentListResponse> {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ")

    // Get user email from cookies
    const userEmail = cookieStore.get("logged-in-user")?.value || ""

    if (!userEmail) {
      return {
        success: false,
        data: [],
        message: "Authentication required",
      }
    }

    const filterQuery = buildFilterQuery(filters, userEmail)

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Payment Entry?fields=["*"]&filters=${encodeURIComponent(filterQuery)}&limit_page_length=None`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return {
        success: false,
        data: [],
        message: `Failed to fetch payment entries: ${response.status}`,
      }
    }

    const result = await response.json()

    // Sort by creation date (newest first)
    const sortedPayments = (result.data || []).sort(
      (a: IPaymentListItem, b: IPaymentListItem) =>
        new Date(b.creation).getTime() - new Date(a.creation).getTime()
    )

    return {
      success: true,
      data: sortedPayments,
    }
  } catch (error) {
    console.error("Error fetching payment entries:", error)
    return {
      success: false,
      data: [],
      message: "Failed to fetch payment entries",
    }
  }
}

/**
 * Get payment entry detail by name
 */
export async function getPaymentDetail(
  name: string
): Promise<IPaymentDetailResponse> {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ")

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Payment Entry/${encodeURIComponent(name)}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return {
        success: false,
        data: null,
        message: `Failed to fetch payment details: ${response.status}`,
      }
    }

    const result = await response.json()
    const payment = result.data

    return {
      success: true,
      data: {
        name: payment.name,
        party: payment.party,
        party_name: payment.party_name,
        posting_date: payment.posting_date,
        paid_amount: payment.paid_amount,
        received_amount: payment.received_amount,
        mode_of_payment: payment.mode_of_payment,
        docstatus: payment.docstatus,
        reference_no: payment.reference_no,
        reference_date: payment.reference_date,
        references: (payment.references || []).map(
          (ref: { reference_name: string; allocated_amount: number }) => ({
            reference_name: ref.reference_name,
            allocated_amount: ref.allocated_amount,
          })
        ),
      },
    }
  } catch (error) {
    console.error("Error fetching payment detail:", error)
    return {
      success: false,
      data: null,
      message: "Failed to fetch payment details",
    }
  }
}
