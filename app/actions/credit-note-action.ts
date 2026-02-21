"use server"

import { cookies } from "next/headers"
import { ICreditNoteDetails, ICreditNoteItem } from "@/store/credit-note-store"

export interface ICreditNotePayload {
  doctype: string
  customer: string
  customer_address: string
  currency: string
  selling_price_list: string
  price_list_currency: string
  is_return: number
  update_billed_amount_in_dn: number
  update_stock: number
  custom_return_against2?: string
  items: {
    item_code: string
    item_name: string
    qty: number
    price_list_rate: number
    rate: number
    amount: number
  }[]
}

export interface ICreditNoteResponse {
  success: boolean
  data?: {
    name: string
    customer: string
    grand_total: number
  }
  message?: string
}

export interface IValidationError {
  field: string
  message: string
}

export interface IValidationResult {
  isValid: boolean
  errors: IValidationError[]
}

/**
 * Validate credit note data before submission
 */
export async function validateCreditNoteData(
  details: ICreditNoteDetails,
  items: ICreditNoteItem[]
): Promise<IValidationResult> {
  const errors: IValidationError[] = []

  if (!details.customer) {
    errors.push({
      field: "customer",
      message: "Please select a customer",
    })
  }

  if (!details.customer_address) {
    errors.push({
      field: "customer_address",
      message: "Please select a customer address",
    })
  }

  if (items.length === 0) {
    errors.push({
      field: "items",
      message: "Please add at least one item to the credit note",
    })
  }

  // Validate each item has positive quantity
  items.forEach((item, index) => {
    if (item.quantity <= 0) {
      errors.push({
        field: `items[${index}].quantity`,
        message: `Item "${item.item_name}" must have a positive quantity`,
      })
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Submit a credit note (Sales Invoice with is_return=1)
 */
export async function submitCreditNote(
  details: ICreditNoteDetails,
  items: ICreditNoteItem[]
): Promise<ICreditNoteResponse> {
  try {
    // Validate first
    const validation = await validateCreditNoteData(details, items)
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.errors.map((e) => e.message).join(". "),
      }
    }

    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ")

    // Prepare items with negative quantities for return
    const payloadItems = items.map((item) => ({
      item_code: item.item_code,
      item_name: item.item_name,
      qty: -Math.abs(item.quantity), // Negative quantity for returns
      price_list_rate: item.price_list_rate,
      rate: item.rate,
      amount: -Math.abs(item.quantity * item.rate), // Negative amount
    }))

    // Prepare the payload
    const payload: ICreditNotePayload = {
      doctype: "Sales Invoice",
      customer: details.customer,
      customer_address: details.customer_address,
      currency: "MYR",
      selling_price_list: "Standard Selling",
      price_list_currency: "MYR",
      is_return: 1,
      update_billed_amount_in_dn: 0,
      update_stock: 1,
      items: payloadItems,
    }

    // Add return against if specified
    if (details.return_against) {
      payload.custom_return_against2 = details.return_against
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Invoice`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify(payload),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        message:
          errorData?.message ||
          errorData?.exc_type ||
          `Failed to submit credit note. Status: ${response.status}`,
      }
    }

    const result = await response.json()

    return {
      success: true,
      data: {
        name: result.data?.name || "",
        customer: result.data?.customer || details.customer,
        grand_total: result.data?.grand_total || 0,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    }
  }
}
