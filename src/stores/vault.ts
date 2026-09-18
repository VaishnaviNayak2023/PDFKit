import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { VaultItem } from '@/types'

export const useVaultStore = defineStore('vault', () => {
  const items = ref<VaultItem[]>([])
  const isLoading = ref(false)
  const selectedIds = ref<string[]>([])
  const searchQuery = ref('')
  const selectedCollection = ref<string | null>(null)
  const showFavoritesOnly = ref(false)

  const filteredItems = computed(() => {
    let result = items.value
    if (showFavoritesOnly.value) {
      result = result.filter(i => i.isFavorite)
    }
    if (selectedCollection.value) {
      result = result.filter(i => i.collection === selectedCollection.value)
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.tags.some(t => t.toLowerCase().includes(q)) ||
        (i.description?.toLowerCase().includes(q) ?? false)
      )
    }
    return result
  })

  const collections = computed(() => {
    const colSet = new Set(
      items.value.map(i => i.collection).filter(Boolean) as string[]
    )
    return Array.from(colSet)
  })

  const allTags = computed(() => {
    const tagSet = new Set(items.value.flatMap(i => i.tags))
    return Array.from(tagSet)
  })

  const totalSize = computed(() =>
    items.value.reduce((sum, i) => sum + i.size, 0)
  )

  function setItems(newItems: VaultItem[]) {
    items.value = newItems
  }

  function addItem(item: VaultItem) {
    items.value.unshift(item)
  }

  function removeItem(id: string) {
    items.value = items.value.filter(i => i.id !== id)
    selectedIds.value = selectedIds.value.filter(s => s !== id)
  }

  function updateItem(id: string, updates: Partial<VaultItem>) {
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) {
      items.value[idx] = { ...items.value[idx], ...updates, updatedAt: new Date() }
    }
  }

  function toggleSelection(id: string) {
    if (selectedIds.value.includes(id)) {
      selectedIds.value = selectedIds.value.filter(s => s !== id)
    } else {
      selectedIds.value.push(id)
    }
  }

  function selectAll() {
    selectedIds.value = filteredItems.value.map(i => i.id)
  }

  function clearSelection() {
    selectedIds.value = []
  }

  function toggleFavorite(id: string) {
    updateItem(id, { isFavorite: !items.value.find(i => i.id === id)?.isFavorite })
  }

  return {
    items,
    isLoading,
    selectedIds,
    searchQuery,
    selectedCollection,
    showFavoritesOnly,
    filteredItems,
    collections,
    allTags,
    totalSize,
    setItems,
    addItem,
    removeItem,
    updateItem,
    toggleSelection,
    selectAll,
    clearSelection,
    toggleFavorite
  }
})
