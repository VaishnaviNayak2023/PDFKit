import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { AppNotification } from '@/types'
import { Dark } from 'quasar'

export const useAppStore = defineStore('app', () => {
  // Initialize dark mode from localStorage or default to true
  const savedDarkMode = localStorage.getItem('darkMode')
  const isDarkMode = ref(savedDarkMode !== null ? savedDarkMode === 'true' : true)
  const isOffline = ref(!navigator.onLine)
  const sidebarOpen = ref(true)
  const commandPaletteOpen = ref(false)
  const globalSearchQuery = ref('')
  const notifications = ref<AppNotification[]>([])

  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
    Dark.set(isDarkMode.value)
    localStorage.setItem('darkMode', String(isDarkMode.value))
  }

  // Initialize dark mode on store creation
  Dark.set(isDarkMode.value)

  // Watch for dark mode changes and persist to localStorage
  watch(isDarkMode, (newValue) => {
    Dark.set(newValue)
    localStorage.setItem('darkMode', String(newValue))
  })

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setOfflineStatus(status: boolean) {
    isOffline.value = status
  }

  function openCommandPalette() {
    commandPaletteOpen.value = true
  }

  function closeCommandPalette() {
    commandPaletteOpen.value = false
    globalSearchQuery.value = ''
  }

  function toggleCommandPalette() {
    commandPaletteOpen.value = !commandPaletteOpen.value
    if (!commandPaletteOpen.value) {
      globalSearchQuery.value = ''
    }
  }

  function addNotification(notification: Omit<AppNotification, 'id'>) {
    const id = crypto.randomUUID()
    const n: AppNotification = { ...notification, id }
    notifications.value.push(n)
    if (n.duration !== 0) {
      setTimeout(() => removeNotification(id), n.duration ?? 4000)
    }
    return id
  }

  function removeNotification(id: string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  // Listen for online/offline events
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => setOfflineStatus(false))
    window.addEventListener('offline', () => setOfflineStatus(true))
  }

  return {
    isDarkMode,
    isOffline,
    sidebarOpen,
    commandPaletteOpen,
    globalSearchQuery,
    notifications,
    toggleDarkMode,
    toggleSidebar,
    setOfflineStatus,
    openCommandPalette,
    closeCommandPalette,
    toggleCommandPalette,
    addNotification,
    removeNotification
  }
})
