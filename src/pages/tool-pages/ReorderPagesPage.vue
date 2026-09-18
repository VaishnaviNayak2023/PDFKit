<template>
  <BaseToolPage
    title="Reorder Pages"
    description="Drag and drop to rearrange pages in your PDF"
    accepted-file-types=".pdf"
    action-label="Apply New Order"
    success-message="Pages Reordered Successfully!"
    download-filename="reordered.pdf"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="reorderPages"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Page Order</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div v-if="pdfMetadata" class="page-list">
              <div
                v-for="(page, index) in pageOrder"
                :key="page"
                class="page-item"
                draggable="true"
                @dragstart="onDragStart(index, $event)"
                @dragover="onDragOver($event)"
                @drop="onDrop(index, $event)"
                @dragend="onDragEnd"
              >
                <q-icon name="drag_indicator" color="grey-6" />
                <span class="page-number">Page {{ page }}</span>
                <q-icon name="swap_vert" color="primary" />
              </div>
            </div>

            <div v-else class="placeholder">
              <q-icon name="picture_as_pdf" size="48px" color="grey-6" />
              <p>Upload a PDF to reorder pages</p>
            </div>

            <div v-if="hasChanges" class="info-box q-mt-md">
              <q-icon name="info" color="info" />
              <span>New order: {{ pageOrder.join(', ') }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="reorderedResult" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>Pages Reordered Successfully!</h3>
          <p>Pages rearranged to: {{ pageOrder.join(', ') }}</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download Reordered PDF"
          @click="downloadResult"
          size="lg"
        >
          <template v-slot:after>
            <q-icon name="download" />
          </template>
        </q-btn>
      </div>
    </template>
  </BaseToolPage>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseToolPage from '@/components/tools/BaseToolPage.vue'
import { PDFService } from '@/services/pdf/pdfService'
// Removed draggable import due to compatibility issues
// Using simple drag and drop implementation instead

const files = ref<File[]>([])
const pdfMetadata = ref<{ pageCount: number } | null>(null)
const pageOrder = ref<number[]>([])
const originalOrder = ref<number[]>([])
const reorderedResult = ref<ArrayBuffer | null>(null)
const error = ref<string | null>(null)

const hasChanges = computed(() => {
  return JSON.stringify(pageOrder.value) !== JSON.stringify(originalOrder.value)
})

async function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
  
  if (selectedFiles.length > 0) {
    try {
      const buffer = await selectedFiles[0].arrayBuffer()
      const metadata = await PDFService.getPDFMetadata(buffer)
      pdfMetadata.value = metadata
      
      // Initialize page order
      pageOrder.value = Array.from({ length: metadata.pageCount }, (_, i) => i + 1)
      originalOrder.value = [...pageOrder.value]
    } catch (err) {
      console.error('Error getting PDF metadata:', err)
    }
  }
}

let draggedIndex = -1

function onDragStart(index: number, event: DragEvent) {
  draggedIndex = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function onDrop(targetIndex: number, event: DragEvent) {
  event.preventDefault()
  if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
    const item = pageOrder.value[draggedIndex]
    pageOrder.value.splice(draggedIndex, 1)
    pageOrder.value.splice(targetIndex, 0, item)
  }
  draggedIndex = -1
}

function onDragEnd() {
  draggedIndex = -1
}

async function reorderPages() {
  error.value = null
  reorderedResult.value = null
  
  if (files.value.length === 0) {
    error.value = 'Please select a PDF file'
    return
  }

  if (!hasChanges.value) {
    error.value = 'No changes to apply'
    return
  }

  try {
    const file = files.value[0]
    const buffer = await file.arrayBuffer()
    
    reorderedResult.value = await PDFService.reorderPages(buffer, pageOrder.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to reorder pages'
  }
}

function downloadResult() {
  if (!reorderedResult.value) return

  const blob = new Blob([reorderedResult.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'reordered.pdf'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.settings-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.page-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.page-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: move;
  transition: all 0.2s;
}

.page-item:hover {
  background: rgba(74, 158, 255, 0.1);
  border-color: rgba(74, 158, 255, 0.3);
}

.page-number {
  flex: 1;
  font-weight: 500;
  color: #ffffff;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
  color: #606060;
}

.info-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 8px;
  color: #808080;
  font-size: 14px;
}
</style>
