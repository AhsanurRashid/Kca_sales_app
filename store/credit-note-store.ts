import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ICreditNoteItem {
  item_code: string
  item_name: string
  quantity: number
  rate: number
  price_list_rate: number
  amount: number
  sales_uom: string
}

export interface ICreditNoteDetails {
  customer: string
  customer_name: string
  customer_address: string
  customer_address_display: string
  return_against: string
}

interface CreditNoteState {
  creditNoteDetails: ICreditNoteDetails
  items: ICreditNoteItem[]
  setCustomer: (customer: string, customer_name: string) => void
  setCustomerAddress: (address: string, address_display: string) => void
  setReturnAgainst: (returnAgainst: string) => void
  addItem: (item: Omit<ICreditNoteItem, "amount">) => void
  removeItem: (index: number) => void
  updateItemQuantity: (index: number, quantity: number) => void
  updateItemRate: (index: number, rate: number) => void
  clearItems: () => void
  clearCreditNote: () => void
  getTotal: () => number
  getItemCount: () => number
}

const initialDetails: ICreditNoteDetails = {
  customer: "",
  customer_name: "",
  customer_address: "",
  customer_address_display: "",
  return_against: "",
}

export const useCreditNoteStore = create<CreditNoteState>()(
  persist(
    (set, get) => ({
      creditNoteDetails: initialDetails,
      items: [],

      setCustomer: (customer, customer_name) =>
        set((state) => ({
          creditNoteDetails: {
            ...state.creditNoteDetails,
            customer,
            customer_name,
            // Reset address when customer changes
            customer_address: "",
            customer_address_display: "",
          },
        })),

      setCustomerAddress: (address, address_display) =>
        set((state) => ({
          creditNoteDetails: {
            ...state.creditNoteDetails,
            customer_address: address,
            customer_address_display: address_display,
          },
        })),

      setReturnAgainst: (return_against) =>
        set((state) => ({
          creditNoteDetails: {
            ...state.creditNoteDetails,
            return_against,
          },
        })),

      addItem: (item) => {
        const amount = item.rate * item.quantity
        const newItem: ICreditNoteItem = { ...item, amount }

        set((state) => {
          // Check if item already exists
          const existingIndex = state.items.findIndex(
            (i) => i.item_code === item.item_code
          )

          if (existingIndex >= 0) {
            // Update existing item quantity
            const updatedItems = [...state.items]
            const existingItem = updatedItems[existingIndex]
            const newQuantity = existingItem.quantity + item.quantity
            const newAmount = item.rate * newQuantity

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

      removeItem: (index) =>
        set((state) => ({
          items: state.items.filter((_, i) => i !== index),
        })),

      updateItemQuantity: (index, quantity) =>
        set((state) => ({
          items: state.items.map((item, i) => {
            if (i === index) {
              return { ...item, quantity, amount: item.rate * quantity }
            }
            return item
          }),
        })),

      updateItemRate: (index, rate) =>
        set((state) => ({
          items: state.items.map((item, i) => {
            if (i === index) {
              return { ...item, rate, amount: rate * item.quantity }
            }
            return item
          }),
        })),

      clearItems: () => set({ items: [] }),

      clearCreditNote: () =>
        set({
          creditNoteDetails: initialDetails,
          items: [],
        }),

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.amount, 0)
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: "credit-note-storage",
    }
  )
)
