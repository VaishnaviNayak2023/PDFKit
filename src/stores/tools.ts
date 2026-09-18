import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Tool, ToolCategory } from '@/types'
import { TOOLS, filterTools } from '@/config/tools'

const STORAGE_KEY = 'pdfkit_tool_stats'
const FAVORITES_KEY = 'pdfkit_tool_favorites'
const RECENT_TOOLS_KEY = 'pdfkit_recent_tools'

interface ToolStats { [toolId: string]: number }

export const useToolsStore = defineStore('tools', () => {
  const usageStats = ref<ToolStats>(
    JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  )
  const favoriteIds = ref<string[]>(
    JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]')
  )
  const recentToolIds = ref<string[]>(
    JSON.parse(localStorage.getItem(RECENT_TOOLS_KEY) ?? '[]')
  )
  const selectedCategory = ref<ToolCategory | 'all'>('all')
  const searchQuery = ref('')
  const searchInputEl = ref<HTMLInputElement | null>(null)

  function recordToolUsage(toolId: string) {
    usageStats.value[toolId] = (usageStats.value[toolId] ?? 0) + 1
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usageStats.value))
    recentToolIds.value = [
      toolId,
      ...recentToolIds.value.filter(id => id !== toolId)
    ].slice(0, 20)
    localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(recentToolIds.value))
  }

  function toggleFavorite(toolId: string) {
    if (favoriteIds.value.includes(toolId)) {
      favoriteIds.value = favoriteIds.value.filter(id => id !== toolId)
    } else {
      favoriteIds.value.push(toolId)
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds.value))
  }

  function isFavorite(toolId: string): boolean {
    return favoriteIds.value.includes(toolId)
  }

  function setCategory(category: ToolCategory | 'all') {
    selectedCategory.value = category
  }

  function focusSearch() {
    searchInputEl.value?.focus()
    searchInputEl.value?.select()
  }

  const recentTools = computed(() =>
    recentToolIds.value
      .map(id => TOOLS.find(t => t.id === id))
      .filter(Boolean) as Tool[]
  )

  const favoriteTools = computed(() =>
    favoriteIds.value
      .map(id => TOOLS.find(t => t.id === id))
      .filter(Boolean) as Tool[]
  )

  const popularTools = computed(() =>
    Object.entries(usageStats.value)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([id]) => TOOLS.find(t => t.id === id))
      .filter(Boolean) as Tool[]
  )

  const catalogTools = computed(() =>
    filterTools(searchQuery.value, selectedCategory.value)
  )

  const isCatalogFiltered = computed(
    () => Boolean(searchQuery.value.trim()) || selectedCategory.value !== 'all'
  )

  return {
    usageStats,
    favoriteIds,
    recentToolIds,
    recentTools,
    favoriteTools,
    popularTools,
    selectedCategory,
    searchQuery,
    searchInputEl,
    catalogTools,
    isCatalogFiltered,
    setCategory,
    focusSearch,
    recordToolUsage,
    toggleFavorite,
    isFavorite
  }
})
