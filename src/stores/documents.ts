import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RecentFile, PDFDocument } from '@/types'

const RECENT_KEY = 'pdfkit_recent_files'
const MAX_RECENT = 50

export const useDocumentsStore = defineStore('documents', () => {
  const recentFiles = ref<RecentFile[]>(
    (JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as RecentFile[])
      .map(f => ({ ...f, timestamp: new Date(f.timestamp) }))
  )
  const openDocuments = ref<PDFDocument[]>([])
  const activeDocumentId = ref<string | null>(null)

  const activeDocument = computed(() =>
    openDocuments.value.find(d => d.id === activeDocumentId.value) ?? null
  )

  const recentByDate = computed(() =>
    [...recentFiles.value].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  )

  function addRecentFile(file: Omit<RecentFile, 'id'>) {
    const id = crypto.randomUUID()
    const entry: RecentFile = { ...file, id, timestamp: new Date() }
    // Deduplicate by name + toolId
    recentFiles.value = [
      entry,
      ...recentFiles.value.filter(
        f => !(f.name === file.name && f.toolId === file.toolId)
      )
    ].slice(0, MAX_RECENT)
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentFiles.value))
  }

  function clearRecentFiles() {
    recentFiles.value = []
    localStorage.removeItem(RECENT_KEY)
  }

  function removeRecentFile(id: string) {
    recentFiles.value = recentFiles.value.filter(f => f.id !== id)
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentFiles.value))
  }

  function openDocument(doc: PDFDocument) {
    if (!openDocuments.value.find(d => d.id === doc.id)) {
      openDocuments.value.push(doc)
    }
    activeDocumentId.value = doc.id
  }

  function closeDocument(id: string) {
    openDocuments.value = openDocuments.value.filter(d => d.id !== id)
    if (activeDocumentId.value === id) {
      activeDocumentId.value = openDocuments.value[0]?.id ?? null
    }
  }

  return {
    recentFiles,
    openDocuments,
    activeDocumentId,
    activeDocument,
    recentByDate,
    addRecentFile,
    clearRecentFiles,
    removeRecentFile,
    openDocument,
    closeDocument
  }
})
