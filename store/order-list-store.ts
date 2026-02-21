import { create } from "zustand"
import { OrderStatusFilter, ISalesOrderFilters } from "@/app/actions/sales-order-list-action"

interface OrderListState {
  filters: ISalesOrderFilters
  isLoading: boolean
  setStatusFilter: (status: OrderStatusFilter) => void
  setDeliveryDateFilter: (date: string) => void
  setCustomerNameFilter: (name: string) => void
  setIsLoading: (loading: boolean) => void
  resetFilters: () => void
}

const initialFilters: ISalesOrderFilters = {
  status: "all",
  deliveryDate: "",
  customerName: "",
}

export const useOrderListStore = create<OrderListState>((set) => ({
  filters: initialFilters,
  isLoading: false,

  setStatusFilter: (status) =>
    set((state) => ({
      filters: { ...state.filters, status },
    })),

  setDeliveryDateFilter: (date) =>
    set((state) => ({
      filters: { ...state.filters, deliveryDate: date },
    })),

  setCustomerNameFilter: (name) =>
    set((state) => ({
      filters: { ...state.filters, customerName: name },
    })),

  setIsLoading: (loading) => set({ isLoading: loading }),

  resetFilters: () => set({ filters: initialFilters }),
}))
