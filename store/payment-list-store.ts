import { create } from "zustand"
import {
  PaymentStatusFilter,
  IPaymentFilters,
} from "@/app/actions/payment-list-action"

interface PaymentListState {
  filters: IPaymentFilters
  isLoading: boolean
  setStatusFilter: (status: PaymentStatusFilter) => void
  setPostingDateFilter: (date: string) => void
  setCustomerNameFilter: (name: string) => void
  setIsLoading: (loading: boolean) => void
  resetFilters: () => void
}

const initialFilters: IPaymentFilters = {
  status: "all",
  postingDate: "",
  customerName: "",
}

export const usePaymentListStore = create<PaymentListState>((set) => ({
  filters: initialFilters,
  isLoading: false,

  setStatusFilter: (status) =>
    set((state) => ({
      filters: { ...state.filters, status },
    })),

  setPostingDateFilter: (date) =>
    set((state) => ({
      filters: { ...state.filters, postingDate: date },
    })),

  setCustomerNameFilter: (name) =>
    set((state) => ({
      filters: { ...state.filters, customerName: name },
    })),

  setIsLoading: (loading) => set({ isLoading: loading }),

  resetFilters: () => set({ filters: initialFilters }),
}))
