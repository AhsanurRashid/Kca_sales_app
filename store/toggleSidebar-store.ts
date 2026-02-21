import { create } from 'zustand'

interface SidebarState {
  isSidebarOpen: boolean
  setSidebarOpen: (isOpen: boolean) => void
}

export const useToggleSidebarStore = create<SidebarState>((set) => ({
  isSidebarOpen: false,
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
}))