<template>
  <BaseToolPage
    title="Organize PDF"
    description="Drag, reorder, rotate, and delete pages visually"
    accepted-file-types=".pdf"
    action-label="Apply Changes"
    success-message="PDF Organized Successfully!"
    download-filename="organized.pdf"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="organizePDF"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Page Organization</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div v-if="pdfMetadata" class="page-grid">
              <div
                v-for="(page, index) in pdfMetadata.pageCount"
                :key="index"
                class="page-thumbnail"
                :class="{ selected: selectedPages.has(index) }"
                @click="togglePageSelection(index)"
              >
                <div class="page-number">{{ index + 1 }}</div>
                <div class="page-actions">
                  <q-btn
                    flat
                    dense
                    icon="rotate_right"
                    @click.stop="rotatePage(index)"
                    size="sm"
                  />
                  <q-btn
                    flat
                    dense
                    icon="delete"
                    @click.stop="deletePage(index)"
                    size="sm"
                    color="negative"
                  />
                </div>
              </div>
            </div>

            <div v-else class="placeholder">
              <q-icon name="picture_as_pdf" size="48px" color="grey-6" />
              <p>Upload a PDF to organize pages</p>
            </div>

            <div v-if="pageRotations.size > 0" class="actions-bar q-mt-md">
              <span>Rotations: {{ pageRotations.size }} page(s)</span>
              <q-btn flat label="Clear Rotations" @click="clearRotations" size="sm" />
            </div>

            <div v-if="pagesToDelete.size > 0" class="actions-bar q-mt-md">
              <span>Deletions: {{ pagesToDelete.size }} page(s)</span>
              <q-btn flat label="Clear Deletions" @click="clearDeletions" size="sm" color="negative" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="organizedResult" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>PDF Organized Successfully!</h3>
          <p v-if="pageRotations.size > 0">Rotated {{ pageRotations.size }} page(s)</p>
          <p v-if="pagesToDelete.size > 0">Deleted {{ pagesToDelete.size }} page(s)</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download Organized PDF"
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
import { ref } from 'vue'
import BaseToolPage from '@/components/tools/BaseToolPage.vue'
import { PDFService } from '@/services/pdf/pdfService'

const files = ref<File[]>([])
const pdfMetadata = ref<{ pageCount: number } | null>(null)
const selectedPages = ref<Set<number>>(new Set())
const pageRotations = ref<Map<number, number>>(new Map())
const pagesToDelete = ref<Set<number>>(new Set())
const organizedResult = ref<ArrayBuffer | null>(null)
const error = ref<string | null>(null)

async function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
  selectedPages.value.clear()
  pageRotations.value.clear()
  pagesToDelete.value.clear()
  
  if (selectedFiles.length > 0) {
    try {
      const buffer = await selectedFiles[0].arrayBuffer()
      const metadata = await PDFService.getPDFMetadata(buffer)
      pdfMetadata.value = metadata
    } catch (err) {
      console.error('Error getting PDF metadata:', err)
    }
  }
}

function togglePageSelection(index: number) {
  if (selectedPages.value.has(index)) {
    selectedPages.value.delete(index)
  } else {
    selectedPages.value.add(index)
  }
}

function rotatePage(index: number) {
  const currentRotation = pageRotations.value.get(index) || 0
  const newRotation = (currentRotation + 90) % 360
  pageRotations.value.set(index, newRotation)
}

function deletePage(index: number) {
  pagesToDelete.value.add(index)
}

function clearRotations() {
  pageRotations.value.clear()
}

function clearDeletions() {
  pagesToDelete.value.clear()
}

async function organizePDF() {
  error.value = null
  organizedResult.value = null
  
  if (files.value.length === 0) {
    error.value = 'Please select a PDF file'
    return
  }

  try {
    const file = files.value[0]
    let buffer = await file.arrayBuffer()
    
    // Apply deletions first
    if (pagesToDelete.value.size > 0) {
      const pagesArray = Array.from(pagesToDelete.value).map(p => p + 1)
      buffer = await PDFService.deletePages(buffer, pagesArray)
    }
    
    // Apply rotations
    if (pageRotations.value.size > 0) {
      const rotations = Array.from(pageRotations.value.entries()).map(([page, degrees]) => ({
        page: page + 1,
        degrees
      }))
      buffer = await PDFService.rotatePages(buffer, rotations)
    }
    
    organizedResult.value = buffer
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to organize PDF'
  }
}

function downloadResult() {
  if (!organizedResult.value) return

  const blob = new Blob([organizedResult.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'organized.pdf'
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

.page-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.page-thumbnail {
  position: relative;
  aspect-ratio: 0.707;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-thumbnail:hover {
  border-color: rgba(74, 158, 255, 0.5);
  background: rgba(74, 158, 255, 0.1);
}

.page-thumbnail.selected {
  border-color: #4a9eff;
  background: rgba(74, 158, 255, 0.2);
}

.page-number {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.page-actions {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.page-thumbnail:hover .page-actions {
  opacity: 1;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
  color: #606060;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: #a0a0a0;
}
</style>
