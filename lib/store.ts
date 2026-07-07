import { create } from 'zustand'

interface AppState {
  // Sidebar state
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  
  // Theme state
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  
  // Dashboard filters
  selectedTier: string | null
  setSelectedTier: (tier: string | null) => void
  
  selectedEncirclement: string | null
  setSelectedEncirclement: (level: string | null) => void
  
  selectedRegion: string | null
  setSelectedRegion: (region: string | null) => void
  
  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void
  
  // Notifications
  notifications: Notification[]
  addNotification: (notification: Notification) => void
  clearNotifications: () => void
}

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  
  selectedTier: null,
  setSelectedTier: (tier) => set({ selectedTier: tier }),
  
  selectedEncirclement: null,
  setSelectedEncirclement: (level) => set({ selectedEncirclement: level }),
  
  selectedRegion: null,
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  notifications: [],
  addNotification: (notification) => set((state) => ({ 
    notifications: [...state.notifications, notification] 
  })),
  clearNotifications: () => set({ notifications: [] }),
}))