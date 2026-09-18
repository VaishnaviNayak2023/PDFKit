import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WorkspaceTab, WorkspaceLayout } from '@/types'

export const useWorkspaceStore = defineStore('workspace', () => {
  const tabs = ref<WorkspaceTab[]>([])
  const layout = ref<WorkspaceLayout>('single')
  const splitRatio = ref(50) // percentage for left panel
  const primaryTabId = ref<string | null>(null)
  const secondaryTabId = ref<string | null>(null)

  const activeTab = computed(() => tabs.value.find(t => t.isActive) ?? null)
  const pinnedTabs = computed(() => tabs.value.filter(t => t.isPinned))
  const unpinnedTabs = computed(() => tabs.value.filter(t => !t.isPinned))
  const tabCount = computed(() => tabs.value.length)

  function createTab(partial: Partial<WorkspaceTab> & { title: string }): WorkspaceTab {
    const tab: WorkspaceTab = {
      id: crypto.randomUUID(),
      title: partial.title,
      file: partial.file,
      documentId: partial.documentId,
      toolId: partial.toolId,
      isDirty: false,
      isActive: false,
      isPinned: false,
      previewUrl: partial.previewUrl,
      createdAt: new Date()
    }
    tabs.value.push(tab)
    setActiveTab(tab.id)
    return tab
  }

  function setActiveTab(id: string) {
    tabs.value.forEach(t => { t.isActive = t.id === id })
  }

  function closeTab(id: string) {
    const idx = tabs.value.findIndex(t => t.id === id)
    if (idx === -1) return
    tabs.value.splice(idx, 1)
    if (activeTab.value === null && tabs.value.length > 0) {
      setActiveTab(tabs.value[Math.min(idx, tabs.value.length - 1)].id)
    }
    // Clean up primary/secondary
    if (primaryTabId.value === id) primaryTabId.value = null
    if (secondaryTabId.value === id) secondaryTabId.value = null
  }

  function closeAllTabs() {
    tabs.value = []
    primaryTabId.value = null
    secondaryTabId.value = null
  }

  function pinTab(id: string) {
    const tab = tabs.value.find(t => t.id === id)
    if (tab) tab.isPinned = !tab.isPinned
  }

  function markDirty(id: string, dirty = true) {
    const tab = tabs.value.find(t => t.id === id)
    if (tab) tab.isDirty = dirty
  }

  function setLayout(l: WorkspaceLayout) {
    layout.value = l
  }

  function setSplitRatio(ratio: number) {
    splitRatio.value = Math.max(20, Math.min(80, ratio))
  }

  function reorderTabs(fromIdx: number, toIdx: number) {
    const [tab] = tabs.value.splice(fromIdx, 1)
    tabs.value.splice(toIdx, 0, tab)
  }

  function setPrimaryTab(id: string) {
    primaryTabId.value = id
  }

  function setSecondaryTab(id: string) {
    secondaryTabId.value = id
  }

  return {
    tabs,
    layout,
    splitRatio,
    primaryTabId,
    secondaryTabId,
    activeTab,
    pinnedTabs,
    unpinnedTabs,
    tabCount,
    createTab,
    setActiveTab,
    closeTab,
    closeAllTabs,
    pinTab,
    markDirty,
    setLayout,
    setSplitRatio,
    reorderTabs,
    setPrimaryTab,
    setSecondaryTab
  }
})
