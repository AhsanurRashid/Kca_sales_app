import { create } from "zustand"
import {
  CreditNoteStatusFilter,
  ICreditNoteFilters,
} from "@/app/actions/credit-note-list-action"

interface CreditNoteListState {
  filters: ICreditNoteFilters
  isLoading: boolean
  setStatusFilter: (status: CreditNoteStatusFilter) => void
  setPostingDateFilter: (date: string) => void
  setCustomerNameFilter: (name: string) => void
  setIsLoading: (loading: boolean) => void
  resetFilters: () => void
}

const initialFilters: ICreditNoteFilters = {
  status: "all",
  postingDate: "",
  customerName: "",
}

export const useCreditNoteListStore = create<CreditNoteListState>((set) => ({
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
