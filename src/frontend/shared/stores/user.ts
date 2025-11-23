import { create } from 'zustand'
import { httpClient } from '@/frontend/core/http'
import { userAPI } from '@/features/user/frontend'
import type { User } from '@/frontend/core/types'

interface UserState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAuthLoading: boolean

  setUser: (user: User) => void
  setToken: (token: string) => void
  loginSuccess: (data: { token: string; user: User }) => void
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isAuthLoading: true,

  setUser: (user: User) => set({ user, isAuthenticated: true }),

  setToken: (token: string) => {
    localStorage.setItem('token', token)
    httpClient.defaults.headers.common.Authorization = `Bearer ${token}`
    set({ token })
  },

  loginSuccess: (data: { token: string; user: User }) => {
    localStorage.setItem('token', data.token)
    httpClient.defaults.headers.common.Authorization = `Bearer ${data.token}`
    set({ token: data.token, user: data.user, isAuthenticated: true, isAuthLoading: false })
  },

  logout: () => {
    localStorage.removeItem('token')
    delete httpClient.defaults.headers.common.Authorization
    set({ user: null, token: null, isAuthenticated: false, isAuthLoading: false })
  },

  checkAuth: async () => {
    const { token, logout } = get()
    if (!token) {
      set({ isAuthLoading: false })
      return
    }
    try {
      httpClient.defaults.headers.common.Authorization = `Bearer ${token}`
      const user = await userAPI.getCurrentUser()
      set({ user, isAuthenticated: true, isAuthLoading: false })
    } catch {
      logout()
    }
  },
}))
