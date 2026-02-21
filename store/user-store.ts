import { create } from 'zustand'
import { IUser } from '@/lib/schema'

interface UserState {
  user: IUser | null
  isHydrated: boolean
  setUser: (user: IUser | null) => void
  hydrate: (user: IUser | null) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isHydrated: false,
  setUser: (user) => set({ user }),
  hydrate: (user) => set({ user, isHydrated: true }),
}))