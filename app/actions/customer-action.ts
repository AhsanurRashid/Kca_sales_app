"use server"

import { cookies } from "next/headers"

export interface ICustomer {
  name: string
  creation: string
  modified: string
  modified_by: string
  owner: string
  docstatus: number
  idx: number
  naming_series: string
  salutation: string | null
  customer_name: string
  customer_type: string
  customer_group: string
  territory: string
  gender: string | null
  lead_name: string | null
  opportunity_name: string | null
  account_manager: string | null
  image: string | null
  default_price_list: string | null
  default_bank_account: string | null
  default_currency: string | null
  is_internal_customer: number
  represents_company: string | null
  market_segment: string | null
  industry: string | null
  customer_pos_id: string | null
  website: string | null
  language: string
  customer_details: string | null
  customer_primary_contact: string | null
  mobile_no: string | null
  email_id: string | null
  customer_primary_address: string | null
  primary_address: string | null
  tax_id: string | null
  tax_category: string | null
  tax_withholding_category: string | null
  payment_terms: string | null
  loyalty_program: string | null
  loyalty_program_tier: string | null
  default_sales_partner: string | null
  default_commission_rate: number
  so_required: number
  dn_required: number
  is_frozen: number
  disabled: number
  _user_tags: string | null
  _comments: string | null
  _assign: string | null
  _liked_by: string | null
  custom_tourism_tax_number: string | null
  custom_customer_tin_number: string | null
  custom_sst_number: string | null
  custom_customer__registrationicpassport_type: string | null
  custom_customer_registrationicpassport_number: string | null
}

export interface ICustomerResponse {
  success: boolean
  data: ICustomer[]
  message?: string
}

export async function getCustomers(): Promise<ICustomerResponse> {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join("; ")

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Customer?fields=["*"]&limit_page_length=None`,
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
        message: "Failed to fetch customers",
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

// Customer Address interfaces and action
export interface ICustomerAddress {
  name: string
  address_title: string
  address_type: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string | null
  country: string
  pincode: string | null
  is_primary_address: number
  is_shipping_address: number
}

export interface ICustomerAddressResponse {
  success: boolean
  data: ICustomerAddress[]
  message?: string
}

export async function getCustomerAddresses(
  customerName: string
): Promise<ICustomerAddressResponse> {
  try {
    if (!customerName) {
      return {
        success: false,
        data: [],
        message: "Customer name is required",
      }
    }

    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ")

    // Get addresses linked to the customer via Dynamic Link
    const filters = JSON.stringify([
      ["Dynamic Link", "link_doctype", "=", "Customer"],
      ["Dynamic Link", "link_name", "=", customerName],
      ["Dynamic Link", "parenttype", "=", "Address"],
    ])

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Address?fields=["*"]&filters=${encodeURIComponent(filters)}&limit_page_length=None`,
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
        message: "Failed to fetch customer addresses",
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

// Payment Terms interfaces and action
export interface IPaymentTermsTemplate {
  name: string
  template_name: string
}

export interface IPaymentTermsResponse {
  success: boolean
  data: IPaymentTermsTemplate[]
  message?: string
}

export async function getPaymentTermsTemplates(): Promise<IPaymentTermsResponse> {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ")

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Payment Terms Template?fields=["name","template_name"]&limit_page_length=None`,
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
        message: "Failed to fetch payment terms",
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
