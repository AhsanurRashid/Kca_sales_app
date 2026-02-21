"use server"

import { cookies } from "next/headers"

export type CreditNoteStatusFilter = "all" | "submitted" | "draft"

export interface ICreditNoteListItem {
  name: string
  customer: string
  customer_name: string
  posting_date: string
  grand_total: number
  docstatus: number
  creation: string
  owner: string
  custom_return_against2: string | null
}

export interface ICreditNoteFilters {
  status: CreditNoteStatusFilter
  postingDate: string
  customerName: string
}

export interface ICreditNoteListResponse {
  success: boolean
  data: ICreditNoteListItem[]
  message?: string
}

export interface ICreditNoteDetail {
  name: string
  customer: string
  customer_name: string
  customer_address: string
  posting_date: string
  grand_total: number
  docstatus: number
  custom_return_against2: string | null
  items: {
    item_code: string
    item_name: string
    qty: number
    rate: number
    uom: string
    amount: number
  }[]
}

export interface ICreditNoteDetailResponse {
  success: boolean
  data: ICreditNoteDetail | null
  message?: string
}

/**
 * Build filter query for credit notes (Sales Invoice with is_return=1) API
 */
function buildFilterQuery(
  filters: ICreditNoteFilters,
  ownerEmail: string
): string {
  const filterArray: (string | number)[][] = []

  // Always filter for returns (credit notes)
  filterArray.push(["is_return", "=", 1])

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
    filterArray.push(["customer_name", "like", `%${filters.customerName}%`])
  }

  return JSON.stringify(filterArray)
}

/**
 * Get credit notes (Sales Invoices with is_return=1) with filters
 */
export async function getCreditNotes(
  filters: ICreditNoteFilters
): Promise<ICreditNoteListResponse> {
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

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Invoice?fields=["*"]&filters=${encodeURIComponent(filterQuery)}&limit_page_length=None`

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
        message: `Failed to fetch credit notes: ${response.status}`,
      }
    }

    const result = await response.json()

    // Sort by creation date (newest first)
    const sortedCreditNotes = (result.data || []).sort(
      (a: ICreditNoteListItem, b: ICreditNoteListItem) =>
        new Date(b.creation).getTime() - new Date(a.creation).getTime()
    )

    return {
      success: true,
      data: sortedCreditNotes,
    }
  } catch (error) {
    console.error("Error fetching credit notes:", error)
    return {
      success: false,
      data: [],
      message: "Failed to fetch credit notes",
    }
  }
}

/**
 * Get credit note detail by name
 */
export async function getCreditNoteDetail(
  name: string
): Promise<ICreditNoteDetailResponse> {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ")

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Invoice/${encodeURIComponent(name)}`

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
        message: `Failed to fetch credit note details: ${response.status}`,
      }
    }

    const data = await response.json()
    const creditNote = data.data

    return {
      success: true,
      data: {
        name: creditNote.name,
        customer: creditNote.customer,
        customer_name: creditNote.customer_name,
        customer_address: creditNote.customer_address || "",
        posting_date: creditNote.posting_date,
        grand_total: creditNote.grand_total,
        docstatus: creditNote.docstatus,
        custom_return_against2: creditNote.custom_return_against2,
        items: (creditNote.items || []).map(
          (item: {
            item_code: string
            item_name: string
            qty: number
            rate: number
            uom: string
            amount: number
          }) => ({
            item_code: item.item_code,
            item_name: item.item_name,
            qty: Math.abs(item.qty), // Qty is negative for returns
            rate: item.rate,
            uom: item.uom,
            amount: Math.abs(item.amount), // Amount is negative for returns
          })
        ),
      },
    }
  } catch (error) {
    console.error("Error fetching credit note detail:", error)
    return {
      success: false,
      data: null,
      message: "Failed to fetch credit note details",
    }
  }
}
