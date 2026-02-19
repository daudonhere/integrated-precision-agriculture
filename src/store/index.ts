import { create } from 'zustand'

interface AppState {
  count: number
  setCount: (count: number) => void
  increment: () => void
}

export const useAppStore = create<AppState>((set) => ({
  count: 0,
  setCount: (count) => set({ count }),
  increment: () => set((state) => ({ count: state.count + 1 })),
}))
