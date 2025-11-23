import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark'
export type ColorPalette = 'blue' | 'purple' | 'green' | 'orange'

interface ThemeState {
  mode: ThemeMode
  palette: ColorPalette
  toggleMode: () => void
  setMode: (mode: ThemeMode) => void
  setPalette: (palette: ColorPalette) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      mode: 'light',
      palette: 'blue',
      toggleMode: () => set(state => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
      setMode: mode => set({ mode }),
      setPalette: palette => set({ palette }),
    }),
    {
      name: 'app-theme',
    }
  )
)
