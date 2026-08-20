import { create } from 'zustand'
import { api, setAuthToken, ApiError } from '@/lib/api'

export type UserRole = 'admin' | 'instructor' | 'learner'
export type UserStatus = 'pending' | 'active' | 'suspended'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  status: UserStatus
  avatarUrl: string | null
  bio?: string | null
}

interface AuthState {
  user: UserProfile | null
  token: string | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null

  setUser: (user: UserProfile | null) => void
  setToken: (token: string | null) => void
  setError: (error: string | null) => void
  initAuth: () => Promise<void>
  login: (email: string, password: string) => Promise<{ user: UserProfile; token: string }>
  registerInstructor: (name: string, email: string, password: string, bio?: string) => Promise<{ status: string; message: string }>
  acceptInvite: (token: string, name: string, password: string) => Promise<{ user: UserProfile; token: string }>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isLoading: false,
  isInitialized: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    setAuthToken(token)
    set({ token })
  },
  setError: (error) => set({ error }),

  initAuth: async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      set({ isInitialized: true, user: null, token: null, isLoading: false })
      return
    }

    set({ isLoading: true, error: null })
    try {
      const res = await api.get<{ user: UserProfile }>('/api/auth/me')
      set({ user: res.user, isInitialized: true, isLoading: false })
    } catch {
      // Invalid or expired token
      setAuthToken(null)
      set({ user: null, token: null, isInitialized: true, isLoading: false })
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.post<{ user: UserProfile; token: string }>('/api/auth/login', { email, password })
      setAuthToken(res.token)
      set({ user: res.user, token: res.token, isLoading: false })
      return res
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Login failed'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  registerInstructor: async (name: string, email: string, password: string, bio?: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.post<{ status: string; message: string }>('/api/auth/register-instructor', {
        name,
        email,
        password,
        bio,
      })
      set({ isLoading: false })
      return res
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Registration failed'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  acceptInvite: async (token: string, name: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.post<{ user: UserProfile; token: string }>('/api/auth/accept-invite', {
        token,
        name,
        password,
      })
      setAuthToken(res.token)
      set({ user: res.user, token: res.token, isLoading: false })
      return res
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Failed to accept invitation'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  logout: () => {
    setAuthToken(null)
    set({ user: null, token: null, error: null })
  },
}))
