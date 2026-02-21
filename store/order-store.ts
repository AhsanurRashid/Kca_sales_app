import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface IOrderDetails {
  customer: string
  customer_name: string
  customer_address: string
  customer_address_display: string
  delivery_date: string
  payment_terms_template: string
  custom_note: string
  custom_finalized: boolean
}

export interface IValidationErrors {
  customer: string
  customer_address: string
  delivery_date: string
  payment_terms_template: string
  cart: string
}

interface OrderState {
  orderDetails: IOrderDetails
  validationErrors: IValidationErrors
  setCustomer: (customer: string, customer_name: string) => void
  setCustomerAddress: (address: string, address_display: string) => void
  setDeliveryDate: (date: string) => void
  setPaymentTerms: (terms: string) => void
  setCustomNote: (note: string) => void
  setCustomFinalized: (finalized: boolean) => void
  setValidationErrors: (errors: Partial<IValidationErrors>) => void
  clearValidationErrors: () => void
  clearOrderDetails: () => void
  isOrderValid: () => boolean
}

const initialOrderDetails: IOrderDetails = {
  customer: "",
  customer_name: "",
  customer_address: "",
  customer_address_display: "",
  delivery_date: "",
  payment_terms_template: "",
  custom_note: "",
  custom_finalized: false,
}

const initialValidationErrors: IValidationErrors = {
  customer: "",
  customer_address: "",
  delivery_date: "",
  payment_terms_template: "",
  cart: "",
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orderDetails: initialOrderDetails,
      validationErrors: initialValidationErrors,

      setCustomer: (customer, customer_name) => {
        set((state) => ({
          orderDetails: {
            ...state.orderDetails,
            customer,
            customer_name,
            // Reset address when customer changes
            customer_address: "",
            customer_address_display: "",
          },
          validationErrors: {
            ...state.validationErrors,
            customer: "",
          },
        }))
      },

      setCustomerAddress: (address, address_display) => {
        set((state) => ({
          orderDetails: {
            ...state.orderDetails,
            customer_address: address,
            customer_address_display: address_display,
          },
          validationErrors: {
            ...state.validationErrors,
            customer_address: "",
          },
        }))
      },

      setDeliveryDate: (date) => {
        set((state) => ({
          orderDetails: {
            ...state.orderDetails,
            delivery_date: date,
          },
          validationErrors: {
            ...state.validationErrors,
            delivery_date: "",
          },
        }))
      },

      setPaymentTerms: (terms) => {
        set((state) => ({
          orderDetails: {
            ...state.orderDetails,
            payment_terms_template: terms,
          },
          validationErrors: {
            ...state.validationErrors,
            payment_terms_template: "",
          },
        }))
      },

      setCustomNote: (note) => {
        set((state) => ({
          orderDetails: {
            ...state.orderDetails,
            custom_note: note,
          },
        }))
      },

      setCustomFinalized: (finalized) => {
        set((state) => ({
          orderDetails: {
            ...state.orderDetails,
            custom_finalized: finalized,
          },
        }))
      },

      setValidationErrors: (errors) => {
        set((state) => ({
          validationErrors: {
            ...state.validationErrors,
            ...errors,
          },
        }))
      },

      clearValidationErrors: () => {
        set({ validationErrors: initialValidationErrors })
      },

      clearOrderDetails: () => {
        set({
          orderDetails: initialOrderDetails,
          validationErrors: initialValidationErrors,
        })
      },

      isOrderValid: () => {
        const { customer, customer_address, delivery_date, payment_terms_template } = get().orderDetails
        return !!(customer && customer_address && delivery_date && payment_terms_template)
      },
    }),
    {
      name: "order-storage",
      partialize: (state) => ({ orderDetails: state.orderDetails }),
    }
  )
)
