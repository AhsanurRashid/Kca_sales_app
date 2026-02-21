"use server"

import { cookies } from "next/headers"

// Types
export interface IItemPrice {
  item_code: string
  price_list_rate: number
  price_list: string
}

export interface IUOMConversionFactor {
  from_uom: string
  to_uom: string
  value: number
}

export interface IStockEntry {
  item_code: string
  warehouse: string
  adjusted_projected_qty: number
}

export interface IPriceResponse {
  success: boolean
  data: IItemPrice[]
  message?: string
}

export interface IUOMResponse {
  success: boolean
  data: IUOMConversionFactor[]
  message?: string
}

export interface IStockResponse {
  success: boolean
  data: IStockEntry[]
  message?: string
}

export interface IItemStockResponse {
  success: boolean
  projected_qty: number
  message?: string
}

// Helper to get cookie header
async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  return allCookies.map(cookie => `${cookie.name}=${cookie.value}`).join("; ")
}

/**
 * Fetch all selling prices (cached for 5 minutes)
 */
export async function getItemPrices(): Promise<IPriceResponse> {
  try {
    const cookieHeader = await getCookieHeader()

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item%20Price?fields=["item_code","price_list_rate","price_list"]&filters=[["selling","=",1]]&limit_page_length=None`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      return {
        success: false,
        data: [],
        message: "Failed to fetch item prices",
      }
    }

    const result = await response.json()
    return {
      success: true,
      data: result.data || [],
    }
  } catch (error) {
    console.error("Error fetching item prices:", error)
    return {
      success: false,
      data: [],
      message: "An error occurred while fetching item prices",
    }
  }
}

/**
 * Fetch UOM conversion factors (cached for 10 minutes)
 */
export async function getUOMConversionFactors(): Promise<IUOMResponse> {
  try {
    const cookieHeader = await getCookieHeader()

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resource/UOM%20Conversion%20Factor?fields=["from_uom","to_uom","value"]&filters=[["category","=","Count"]]&limit_page_length=None`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        next: { revalidate: 600 }, // Cache for 10 minutes
      }
    )

    if (!response.ok) {
      return {
        success: false,
        data: [],
        message: "Failed to fetch UOM conversion factors",
      }
    }

    const result = await response.json()
    return {
      success: true,
      data: result.data || [],
    }
  } catch (error) {
    console.error("Error fetching UOM conversion factors:", error)
    return {
      success: false,
      data: [],
      message: "An error occurred while fetching UOM conversion factors",
    }
  }
}

/**
 * Fetch all stock quantities (fresh, no cache)
 */
export async function getAllStock(): Promise<IStockResponse> {
  try {
    const cookieHeader = await getCookieHeader()

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/method/en_customization.api.stock.get_adjusted_projected_qty_list`,
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
        message: "Failed to fetch stock quantities",
      }
    }

    const result = await response.json()
    return {
      success: true,
      data: result.message || [],
    }
  } catch (error) {
    console.error("Error fetching stock quantities:", error)
    return {
      success: false,
      data: [],
      message: "An error occurred while fetching stock quantities",
    }
  }
}

/**
 * Get stock quantity for a specific item (on-demand)
 */
export async function getItemStock(itemCode: string): Promise<IItemStockResponse> {
  try {
    const stockResponse = await getAllStock()
    
    if (!stockResponse.success) {
      return {
        success: false,
        projected_qty: 0,
        message: stockResponse.message,
      }
    }

    // Filter out rejected warehouses and sum valid stock
    const validStocks = stockResponse.data.filter(
      (s) =>
        s.item_code === itemCode &&
        !s.warehouse.toLowerCase().includes("rejected")
    )

    const projectedQty = validStocks.reduce(
      (total, stock) => total + (stock.adjusted_projected_qty || 0),
      0
    )

    return {
      success: true,
      projected_qty: projectedQty,
    }
  } catch (error) {
    console.error("Error fetching item stock:", error)
    return {
      success: false,
      projected_qty: 0,
      message: "An error occurred while fetching item stock",
    }
  }
}

/**
 * Get enriched product data with price and UOM for display
 */
export interface IEnrichedProduct {
  item_code: string
  item_name: string
  item_group: string
  image: string | null
  stock_uom: string
  sales_uom: string | null
  price_list_rate: number
  uom_conversion_factor: number
  base_rate: number // price_list_rate * uom_conversion_factor
  projected_qty: number
  available_qty: number // projected_qty / uom_conversion_factor
}

export async function getEnrichedProducts(
  itemCodes: string[]
): Promise<{ success: boolean; data: Map<string, { price_list_rate: number; uom_factor: number }> }> {
  try {
    const [pricesRes, uomRes] = await Promise.all([
      getItemPrices(),
      getUOMConversionFactors(),
    ])

    const priceMap = new Map<string, number>()
    if (pricesRes.success) {
      pricesRes.data.forEach((p) => {
        priceMap.set(p.item_code, p.price_list_rate)
      })
    }

    const uomMap = new Map<string, number>()
    if (uomRes.success) {
      uomRes.data.forEach((u) => {
        uomMap.set(u.from_uom, u.value)
      })
    }

    const result = new Map<string, { price_list_rate: number; uom_factor: number }>()
    itemCodes.forEach((code) => {
      result.set(code, {
        price_list_rate: priceMap.get(code) || 0,
        uom_factor: 1, // Will be set based on sales_uom later
      })
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("Error enriching products:", error)
    return { success: false, data: new Map() }
  }
}
