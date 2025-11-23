import { create } from 'zustand'

interface AppState {
  theme: 'light' | 'dark'
  isLoading: boolean
  isConnected: boolean
  setTheme: (theme: 'light' | 'dark') => void
  setLoading: (loading: boolean) => void
  setConnected: (connected: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  isLoading: false,
  isConnected: true,
  setTheme: (theme) => set({ theme }),
  setLoading: (isLoading) => set({ isLoading }),
  setConnected: (connected) => set({ isConnected: connected }),
}))
