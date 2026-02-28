import { create } from "zustand"

interface LocationTrackerState {
  isTracking: boolean
  /** Registered by the tracker page — clears watch + intervals */
  stopTracking: () => void
  setIsTracking: (value: boolean) => void
  registerStopFn: (fn: () => void) => void
}

export const useLocationTrackerStore = create<LocationTrackerState>((set) => ({
  isTracking: false,
  stopTracking: () => {},
  setIsTracking: (value) => set({ isTracking: value }),
  registerStopFn: (fn) => set({ stopTracking: fn }),
}))
