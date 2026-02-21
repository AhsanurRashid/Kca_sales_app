import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ICartItem {
  item_code: string
  item_name: string
  quantity: number
  rate: number
  price_list_rate: number
  amount: number
  sales_uom: string
  uom_factor: number
  is_foc: boolean
}

interface CartState {
  items: ICartItem[]
  addItem: (item: Omit<ICartItem, "amount">) => void
  removeItem: (itemCode: string, isFoc: boolean) => void
  updateQuantity: (itemCode: string, isFoc: boolean, quantity: number) => void
  updateRate: (itemCode: string, rate: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const amount = item.is_foc ? 0 : item.rate * item.quantity
        const newItem: ICartItem = { ...item, amount }

        set((state) => {
          // Check if item already exists (same item_code and same FOC status)
          const existingIndex = state.items.findIndex(
            (i) => i.item_code === item.item_code && i.is_foc === item.is_foc
          )

          if (existingIndex >= 0) {
            // Update existing item
            const updatedItems = [...state.items]
            const existingItem = updatedItems[existingIndex]
            const newQuantity = existingItem.quantity + item.quantity
            const newAmount = item.is_foc ? 0 : item.rate * newQuantity
            
            updatedItems[existingIndex] = {
              ...existingItem,
              quantity: newQuantity,
              rate: item.rate,
              amount: newAmount,
            }
            return { items: updatedItems }
          }

          // Add new item
          return { items: [...state.items, newItem] }
        })
      },

      removeItem: (itemCode, isFoc) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.item_code === itemCode && item.is_foc === isFoc)
          ),
        }))
      },

      updateQuantity: (itemCode, isFoc, quantity) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.item_code === itemCode && item.is_foc === isFoc) {
              const newAmount = item.is_foc ? 0 : item.rate * quantity
              return { ...item, quantity, amount: newAmount }
            }
            return item
          }),
        }))
      },

      updateRate: (itemCode, rate) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.item_code === itemCode && !item.is_foc) {
              return { ...item, rate, amount: rate * item.quantity }
            }
            return item
          }),
        }))
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.amount, 0)
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: "cart-storage",
    }
  )
)
