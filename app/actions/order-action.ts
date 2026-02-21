"use server"

import { cookies } from "next/headers"
import { ICartItem } from "@/store/cart-store"
import { IOrderDetails } from "@/store/order-store"

export interface ISalesOrderItem {
  item_code: string
  item_name: string
  qty: number
  price_list_rate: number
  rate: number
  amount: number
  is_free_item: number
  uom: string
}

export interface ISalesOrderPayload {
  doctype: string
  customer: string
  customer_address: string
  delivery_date: string
  currency: string
  selling_price_list: string
  price_list_currency: string
  items: ISalesOrderItem[]
  payment_terms_template: string
  custom_finalized: number
  order_finalized: number
  custom_note: string
  sales_team: {
    sales_person: string
    allocated_percentage: number
    commission_rate: number
  }[]
}

export interface ISubmitOrderResponse {
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

export async function validateOrderData(
  orderDetails: IOrderDetails,
  cartItems: ICartItem[]
): Promise<IValidationResult> {
  const errors: IValidationError[] = []

  if (!orderDetails.customer) {
    errors.push({
      field: "customer",
      message: "Please select a customer",
    })
  }

  if (!orderDetails.customer_address) {
    errors.push({
      field: "customer_address",
      message: "Please select a delivery address",
    })
  }

  if (!orderDetails.delivery_date) {
    errors.push({
      field: "delivery_date",
      message: "Please select a delivery date",
    })
  }

  if (!orderDetails.payment_terms_template) {
    errors.push({
      field: "payment_terms_template",
      message: "Please select payment terms",
    })
  }

  if (cartItems.length === 0) {
    errors.push({
      field: "cart",
      message: "Your cart is empty. Please add items to proceed.",
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export async function submitSalesOrder(
  orderDetails: IOrderDetails,
  cartItems: ICartItem[],
  salesPersonName: string
): Promise<ISubmitOrderResponse> {
  try {
    // Validate first
    const validation = await validateOrderData(orderDetails, cartItems)
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

    // Prepare items for the payload
    const items: ISalesOrderItem[] = cartItems.map((item) => ({
      item_code: item.item_code,
      item_name: item.item_name,
      qty: item.quantity,
      price_list_rate: item.is_foc ? 0 : item.price_list_rate,
      rate: item.is_foc ? 0 : item.rate,
      amount: item.is_foc ? 0 : item.amount,
      is_free_item: item.is_foc ? 1 : 0,
      uom: item.sales_uom,
    }))

    // Prepare the payload
    const payload: ISalesOrderPayload = {
      doctype: "Sales Order",
      customer: orderDetails.customer,
      customer_address: orderDetails.customer_address,
      delivery_date: orderDetails.delivery_date,
      currency: "MYR",
      selling_price_list: "Standard Selling",
      price_list_currency: "MYR",
      items,
      payment_terms_template: orderDetails.payment_terms_template,
      custom_finalized: orderDetails.custom_finalized ? 1 : 0,
      order_finalized: orderDetails.custom_finalized ? 1 : 0,
      custom_note: orderDetails.custom_note || "",
      sales_team: [
        {
          sales_person: salesPersonName || "",
          allocated_percentage: 100,
          commission_rate: 0,
        },
      ],
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Order`,
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
          `Failed to submit order. Status: ${response.status}`,
      }
    }

    const result = await response.json()

    return {
      success: true,
      data: {
        name: result.data?.name || "",
        customer: result.data?.customer || orderDetails.customer,
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
