import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      selectedModelId: null,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      setSelectedModel: (id) => set({ selectedModelId: id }),
      logout: () => set({ token: null, user: null, selectedModelId: null }),
    }),
    { name: 'ai-sheriff-auth' }
  )
)