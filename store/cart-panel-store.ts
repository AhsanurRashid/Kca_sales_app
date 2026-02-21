import { create } from "zustand"

interface CartPanelState {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  toggle: () => void
}

export const useCartPanelStore = create<CartPanelState>((set) => ({
  isOpen: false,
  setIsOpen: (open) => set({ isOpen: open }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
