"use server"

import { cookies } from "next/headers"

export interface IModeOfPayment {
  name: string
}

export interface IPaymentAccount {
  company: string
  default_account: string
  account_currency: string
}

export interface ICustomerBalance {
  closing_balance: number
}

export interface IPaymentPayload {
  customer: string
  customerName: string
  postingDate: string
  amount: number
  modeOfPayment: string
  customerAddress: string
  paidToAccount: string
  referenceNo?: string
  referenceDate?: string
}

export interface IPaymentResponse {
  success: boolean
  data?: { name: string }
  message?: string
}

/**
 * Get all payment modes
 */
export async function getPaymentModes(): Promise<{
  success: boolean
  data: IModeOfPayment[]
  message?: string
}> {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ")

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Mode of Payment?fields=["name"]&limit_page_length=None`

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
        message: "Failed to fetch payment modes",
      }
    }

    const result = await response.json()
    return {
      success: true,
      data: result.data || [],
    }
  } catch (error) {
    console.error("Error fetching payment modes:", error)
    return {
      success: false,
      data: [],
      message: "Failed to fetch payment modes",
    }
  }
}

/**
 * Get paid to account for a mode of payment
 */
export async function getPaidToAccount(
  modeOfPayment: string,
  company: string
): Promise<{
  success: boolean
  data: { account: string; currency: string } | null
  message?: string
}> {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ")

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Mode of Payment/${encodeURIComponent(modeOfPayment)}`

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
        message: "Failed to fetch paid to account",
      }
    }

    const result = await response.json()
    const accounts: IPaymentAccount[] = result.data.accounts || []

    // Find account for the specified company, fallback to first
    const accRow = accounts.find((acc) => acc.company === company) || accounts[0]

    if (accRow) {
      return {
        success: true,
        data: {
          account: accRow.default_account || "",
          currency: accRow.account_currency || "",
        },
      }
    }

    return {
      success: false,
      data: null,
      message: "No account found for this mode of payment",
    }
  } catch (error) {
    console.error("Error fetching paid to account:", error)
    return {
      success: false,
      data: null,
      message: "Failed to fetch paid to account",
    }
  }
}

/**
 * Get customer balance
 */
export async function getCustomerBalance(customerName: string): Promise<{
  success: boolean
  data: number | null
  message?: string
}> {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ")

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/method/frappe.desk.query_report.run?report_name=Customer Ledger Summary&filters={"party":"${encodeURIComponent(customerName)}"}`

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
        message: "Failed to fetch customer balance",
      }
    }

    const result = await response.json()
    const balanceData = result.message?.result?.[0]

    return {
      success: true,
      data: balanceData?.closing_balance || 0,
    }
  } catch (error) {
    console.error("Error fetching customer balance:", error)
    return {
      success: false,
      data: null,
      message: "Failed to fetch customer balance",
    }
  }
}

/**
 * Create a new payment entry
 */
export async function createPaymentEntry(
  payload: IPaymentPayload
): Promise<IPaymentResponse> {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ")

    const userEmail = cookieStore.get("logged-in-user")?.value || ""

    const company = process.env.NEXT_PUBLIC_COMPANY_NAME || "KITCHEN CARE AGRO FOOD PRODUCTS (M) SDN BHD"

    const paymentData: Record<string, unknown> = {
      company,
      posting_date: payload.postingDate,
      party_type: "Customer",
      party: payload.customer,
      paid_amount: payload.amount,
      received_amount: payload.amount,
      mode_of_payment: payload.modeOfPayment,
      paid_to: payload.paidToAccount,
      references: [],
      remark: `Payment received from ${payload.customerName}`,
      party_address: payload.customerAddress,
      custom_transacted_by: userEmail,
    }

    // Add cheque reference if provided
    if (payload.referenceNo) {
      paymentData.reference_no = payload.referenceNo
    }
    if (payload.referenceDate) {
      paymentData.reference_date = payload.referenceDate
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Payment Entry`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify(paymentData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        message: errorData.message || "Failed to create payment entry",
      }
    }

    const result = await response.json()
    return {
      success: true,
      data: { name: result.data.name },
    }
  } catch (error) {
    console.error("Error creating payment entry:", error)
    return {
      success: false,
      message: "Failed to create payment entry",
    }
  }
}
