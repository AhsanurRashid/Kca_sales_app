import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts initials (first letter of first two words) from a string
 * Examples:
 * - "Sales_Agent6" → "SA"
 * - "John Doe" → "JD"
 * - "sales-manager" → "SM"
 * - "Administrator" → "AD"
 */
export function getInitials(str: string): string {
  if (!str) return ""
  
  // Remove numbers and split by common separators (space, underscore, hyphen, camelCase)
  const cleaned = str.replace(/[0-9]/g, "")
  const words = cleaned
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Split camelCase
    .split(/[\s_\-]+/) // Split by space, underscore, hyphen
    .filter(word => word.length > 0)
  
  if (words.length === 0) return ""
  if (words.length === 1) {
    // Return first two letters of single word
    return words[0].substring(0, 2).toUpperCase()
  }
  
  // Return first letter of first two words
  return (words[0][0] + words[1][0]).toUpperCase()
}

export const getImageUrl = (imagePath: string | null) => {
  if (!imagePath) return null
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`
  return `${process.env.NEXT_PUBLIC_API_URL}${cleanPath}`
}

/**
 * Format a number as currency (MYR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "-"
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export const menus =  {
  dashboard: [
    {
      name: "Sales Order",
      href: "/products",
      icon: "Package"
    },
    // { 
    //   name: "Sales Order", 
    //   href: "/sales-order", 
    //   icon: "ShoppingCart"
    // },
    { 
      name: "Order List", 
      href: "/order-list", 
      icon: "ClipboardList"
    },
    { 
      name: "Credit Note", 
      href: "/credit-note", 
      icon: "FileText"
    },
    { 
      name: "Credit Note List", 
      href: "/credit-note-list", 
      icon: "Files", 
     },
    { 
      name: "Payment", 
      href: "/payment", 
      icon: "CreditCard",
    },
    { 
      name: "Collection List", 
      href: "/collection-list", 
      icon: "Wallet"
    },
  ],
}