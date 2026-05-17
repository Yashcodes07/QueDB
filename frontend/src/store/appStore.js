import { create } from 'zustand'

export const useAppStore = create((set) => ({
  selectedConnection: null,
  setSelectedConnection: (conn) => set({ selectedConnection: conn }),
  activeTab: 'chat',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
