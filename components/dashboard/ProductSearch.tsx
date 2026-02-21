"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, X, Package, Loader2 } from "lucide-react"
import { searchProducts, IProduct } from "@/app/actions/product-action"
import { getImageUrl } from "@/lib/utils"
import Image from "next/image"

const DEBOUNCE_DELAY = 300

const ProductSearch = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [query, setQuery] = useState(searchParams.get("search") || "")
  const [results, setResults] = useState<IProduct[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await searchProducts(searchQuery, 8)
      if (response.success) {
        setResults(response.data)
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle input change with debounce
  const handleInputChange = (value: string) => {
    setQuery(value)
    setSelectedIndex(-1)
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (value.trim().length >= 2) {
      setIsOpen(true)
      setIsLoading(true)
      debounceRef.current = setTimeout(() => {
        performSearch(value)
      }, DEBOUNCE_DELAY)
    } else {
      setResults([])
      setIsOpen(false)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          selectProduct(results[selectedIndex])
        } else if (query.trim()) {
          submitSearch()
        }
        break
      case "Escape":
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  // Select a product from dropdown
  const selectProduct = (product: IProduct) => {
    setQuery(product.item_name)
    setIsOpen(false)
    // Navigate to search results with the product name
    const params = new URLSearchParams(searchParams.toString())
    params.set("search", product.item_name)
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  // Submit full search
  const submitSearch = () => {
    setIsOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    if (query.trim()) {
      params.set("search", query.trim())
      params.delete("page")
    } else {
      params.delete("search")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  // Clear search
  const clearSearch = () => {
    setQuery("")
    setResults([])
    setIsOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    params.delete("search")
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
    inputRef.current?.focus()
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  return (
    <div className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder="Search products..."
          className="w-full h-9 pl-9 pr-9 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 backdrop-blur-sm text-sm focus:outline-none transition-all"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-lg overflow-hidden z-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              {results.map((product, index) => (
                <button
                  key={product.item_code}
                  onClick={() => selectProduct(product)}
                  className={`w-full flex items-center gap-3 p-2.5 text-left transition-colors ${
                    index === selectedIndex
                      ? "bg-primary/10"
                      : "hover:bg-muted/50"
                  }`}
                >
                  {/* Product Image */}
                  <div className="relative h-10 w-10 rounded-md overflow-hidden bg-muted shrink-0">
                    {product.image ? (
                      <Image
                        src={getImageUrl(product.image) || "/assets/images/placeholder.webp"}
                        alt={product.item_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.item_name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{product.item_code}</p>
                  </div>

                  {/* Price & UOM */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-primary">{formatPrice(product.standard_rate)}</p>
                    <p className="text-[10px] text-muted-foreground">{product.stock_uom}</p>
                  </div>
                </button>
              ))}
              
              {/* View All Results */}
              {results.length >= 8 && (
                <button
                  onClick={submitSearch}
                  className="w-full py-2.5 text-xs text-primary hover:bg-primary/5 border-t border-border/50 transition-colors"
                >
                  View all results for &quot;{query}&quot;
                </button>
              )}
            </div>
          ) : query.trim().length >= 2 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No products found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default ProductSearch
