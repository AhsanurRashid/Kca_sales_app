"use server"

import { cookies } from "next/headers"

export interface IProduct {
  name: string
  creation: string
  modified: string
  modified_by: string
  owner: string
  docstatus: number
  idx: number
  naming_series: string
  item_code: string
  item_name: string
  item_group: string
  stock_uom: string
  disabled: number
  allow_alternative_item: number
  is_stock_item: number
  has_variants: number
  opening_stock: number
  valuation_rate: number
  standard_rate: number
  is_fixed_asset: number
  auto_create_assets: number
  is_grouped_asset: number
  asset_category: string | null
  asset_naming_series: string | null
  over_delivery_receipt_allowance: number
  over_billing_allowance: number
  image: string | null
  description: string | null
  brand: string | null
  shelf_life_in_days: number
  end_of_life: string | null
  default_material_request_type: string
  valuation_method: string | null
  warranty_period: string | null
  weight_per_unit: number
  weight_uom: string | null
  allow_negative_stock: number
  has_batch_no: number
  create_new_batch: number
  batch_number_series: string | null
  has_expiry_date: number
  retain_sample: number
  sample_quantity: number
  has_serial_no: number
  serial_no_series: string | null
  variant_of: string | null
  variant_based_on: string
  enable_deferred_expense: number
  no_of_months_exp: number
  enable_deferred_revenue: number
  no_of_months: number
  purchase_uom: string | null
  min_order_qty: number
  safety_stock: number
  is_purchase_item: number
  lead_time_days: number
  last_purchase_rate: number
  is_customer_provided_item: number
  customer: string | null
  delivered_by_supplier: number
  country_of_origin: string | null
  customs_tariff_number: string | null
  sales_uom: string | null
  grant_commission: number
  is_sales_item: number
  max_discount: number
  inspection_required_before_purchase: number
  quality_inspection_template: string | null
  inspection_required_before_delivery: number
  include_item_in_manufacturing: number
  is_sub_contracted_item: number
  default_bom: string | null
  customer_code: string | null
  default_item_manufacturer: string | null
  default_manufacturer_part_no: string | null
  total_projected_qty: number
  _user_tags: string | null
  _comments: string | null
  _assign: string | null
  _liked_by: string | null
}

export interface IProductResponse {
  success: boolean
  data: IProduct[]
  message?: string
}

export interface IPaginatedProductResponse {
  success: boolean
  data: IProduct[]
  total: number
  page: number
  limit: number
  totalPages: number
  message?: string
}

export interface ISingleProductResponse {
  success: boolean
  data: IProduct | null
  message?: string
}

// Only the fields we actually use in the UI
const PRODUCT_FIELDS = '"item_code","item_name","item_group","stock_uom","sales_uom","standard_rate","image"'

export async function getProducts(): Promise<IProductResponse> {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join("; ")

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item?fields=[${PRODUCT_FIELDS}]&limit_page_length=None`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        next: { revalidate: 120 },
      }
    )

    if (!response.ok) {
      return {
        success: false,
        data: [],
        message: "Failed to fetch products",
      }
    }

    const result = await response.json()
    return {
      success: true,
      data: result.data || [],
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    return {
      success: false,
      data: [],
      message: "An error occurred while fetching products",
    }
  }
}

export async function getProductsPaginated(
  page: number = 1,
  limit: number = 24,
  category?: string,
  search?: string
): Promise<IPaginatedProductResponse> {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join("; ")

    const limitStart = (page - 1) * limit
    
    // Build filters based on category and search
    const filterConditions: [string, string, string][] = []
    if (category) {
      filterConditions.push(["item_group", "=", category])
    }
    if (search) {
      filterConditions.push(["item_name", "like", `%${search}%`])
    }
    
    const filters = filterConditions.length > 0
      ? `&filters=${encodeURIComponent(JSON.stringify(filterConditions))}`
      : ""

    // Fetch paginated data and count in parallel
    const [response, countResponse] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item?fields=[${PRODUCT_FIELDS}]&limit_start=${limitStart}&limit_page_length=${limit}${filters}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader,
          },
          next: { revalidate: 120 },
        }
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/method/frappe.client.get_count?doctype=Item${filterConditions.length > 0 ? `&filters=${encodeURIComponent(JSON.stringify(Object.fromEntries(filterConditions.map(f => [f[0], [f[1], f[2]]]))))}` : ''}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader,
          },
          next: { revalidate: 120 },
        }
      ),
    ])

    if (!response.ok) {
      return {
        success: false,
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        message: "Failed to fetch products",
      }
    }

    const result = await response.json()
    
    // Get total count from Frappe's get_count API
    let total = 0
    if (countResponse.ok) {
      const countResult = await countResponse.json()
      total = countResult.message ?? 0
    }

    const totalPages = Math.ceil(total / limit)

    return {
      success: true,
      data: result.data || [],
      total,
      page,
      limit,
      totalPages,
    }
  } catch (error) {
    console.error("Error fetching paginated products:", error)
    return {
      success: false,
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
      message: "An error occurred while fetching products",
    }
  }
}

export async function getProductsByCategory(category: string): Promise<IProductResponse> {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join("; ")

    const filters = JSON.stringify([["item_group", "=", category]])
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item?fields=[${PRODUCT_FIELDS}]&filters=${encodeURIComponent(filters)}&limit_page_length=None`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        next: { revalidate: 120 },
      }
    )

    if (!response.ok) {
      return {
        success: false,
        data: [],
        message: "Failed to fetch products by category",
      }
    }

    const result = await response.json()
    return {
      success: true,
      data: result.data || [],
    }
  } catch (error) {
    console.error("Error fetching products by category:", error)
    return {
      success: false,
      data: [],
      message: "An error occurred while fetching products",
    }
  }
}

export async function getProduct(itemCode: string): Promise<ISingleProductResponse> {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join("; ")

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item/${encodeURIComponent(itemCode)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        next: { revalidate: 120 },
      }
    )

    if (!response.ok) {
      return {
        success: false,
        data: null,
        message: "Failed to fetch product",
      }
    }

    const result = await response.json()
    return {
      success: true,
      data: result.data || null,
    }
  } catch (error) {
    console.error("Error fetching product:", error)
    return {
      success: false,
      data: null,
      message: "An error occurred while fetching product",
    }
  }
}

export async function searchProducts(query: string, limit: number = 10): Promise<IProductResponse> {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join("; ")

    // Search in both item_name and item_code
    const filters = JSON.stringify([
      ["item_name", "like", `%${query}%`]
    ])
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item?fields=[${PRODUCT_FIELDS}]&filters=${encodeURIComponent(filters)}&limit_page_length=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        next: { revalidate: 60 },
      }
    )

    if (!response.ok) {
      return {
        success: false,
        data: [],
        message: "Failed to search products",
      }
    }

    const result = await response.json()
    return {
      success: true,
      data: result.data || [],
    }
  } catch (error) {
    console.error("Error searching products:", error)
    return {
      success: false,
      data: [],
      message: "An error occurred while searching products",
    }
  }
}
