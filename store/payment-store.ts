import { create } from "zustand"

interface PaymentState {
  // Customer
  customer: string
  customerName: string
  // Address
  customerAddress: string
  addressDisplay: string
  // Payment details
  postingDate: string
  amount: string
  modeOfPayment: string
  customerBalance: number | null
  paidToAccount: string
  // Cheque fields
  referenceNo: string
  referenceDate: string
  // Loading
  isSubmitting: boolean

  // Actions
  setCustomer: (customer: string, customerName: string) => void
  setCustomerAddress: (address: string, display: string) => void
  setPostingDate: (date: string) => void
  setAmount: (amount: string) => void
  setModeOfPayment: (mode: string) => void
  setCustomerBalance: (balance: number | null) => void
  setPaidToAccount: (account: string) => void
  setReferenceNo: (ref: string) => void
  setReferenceDate: (date: string) => void
  setIsSubmitting: (loading: boolean) => void
  clearPayment: () => void
}

const initialState = {
  customer: "",
  customerName: "",
  customerAddress: "",
  addressDisplay: "",
  postingDate: "",
  amount: "",
  modeOfPayment: "",
  customerBalance: null,
  paidToAccount: "",
  referenceNo: "",
  referenceDate: "",
  isSubmitting: false,
}

export const usePaymentStore = create<PaymentState>((set) => ({
  ...initialState,

  setCustomer: (customer, customerName) =>
    set({
      customer,
      customerName,
      customerAddress: "",
      addressDisplay: "",
      customerBalance: null,
    }),

  setCustomerAddress: (address, display) =>
    set({ customerAddress: address, addressDisplay: display }),

  setPostingDate: (date) => set({ postingDate: date }),

  setAmount: (amount) => set({ amount }),

  setModeOfPayment: (mode) =>
    set({
      modeOfPayment: mode,
      // Clear cheque fields if not cheque
      ...(mode !== "Cheque" ? { referenceNo: "", referenceDate: "" } : {}),
    }),

  setCustomerBalance: (balance) => set({ customerBalance: balance }),

  setPaidToAccount: (account) => set({ paidToAccount: account }),

  setReferenceNo: (ref) => set({ referenceNo: ref }),

  setReferenceDate: (date) => set({ referenceDate: date }),

  setIsSubmitting: (loading) => set({ isSubmitting: loading }),

  clearPayment: () => set(initialState),
}))
