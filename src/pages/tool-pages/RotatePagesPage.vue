<template>
  <BaseToolPage
    title="Rotate Pages"
    description="Rotate one or all pages in your PDF 90 or 180 degrees"
    accepted-file-types=".pdf"
    action-label="Rotate Pages"
    success-message="Pages Rotated Successfully!"
    download-filename="rotated.pdf"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="rotatePages"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Rotation Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="rotation-mode-selector">
              <q-btn-toggle
                v-model="rotationMode"
                toggle-color="primary"
                :options="[
                  { label: 'All Pages', value: 'all' },
                  { label: 'Specific Pages', value: 'specific' }
                ]"
                spread
              />
            </div>

            <div class="rotation-angle q-mt-md">
              <q-btn-toggle
                v-model="rotationAngle"
                toggle-color="primary"
                :options="[
                  { label: '90 Clockwise', value: 90 },
                  { label: '180', value: 180 },
                  { label: '90 Counter-Clockwise', value: 270 }
                ]"
                spread
              />
            </div>

            <div v-if="rotationMode === 'specific'" class="specific-pages q-mt-md">
              <q-input
                v-model="specificPages"
                label="Specific Pages (e.g., 1,3,5,7)"
                hint="Enter page numbers separated by commas"
                filled
                dark
                color="primary"
              />
            </div>

            <div class="info-box q-mt-md">
              <q-icon name="info" color="info" />
              <span v-if="pdfMetadata">
                PDF has {{ pdfMetadata.pageCount }} pages
              </span>
              <span v-else>
                Upload a PDF to see page count
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="rotatedResult" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>Pages Rotated Successfully!</h3>
          <p>Rotated {{ rotatedCount }} page(s) by {{ rotationAngle }} degrees</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download Rotated PDF"
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
const rotationMode = ref<'all' | 'specific'>('all')
const rotationAngle = ref(90)
const specificPages = ref('')
const pdfMetadata = ref<{ pageCount: number } | null>(null)
const rotatedResult = ref<ArrayBuffer | null>(null)
const rotatedCount = ref(0)
const error = ref<string | null>(null)

async function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
  
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

function parseSpecificPages(pagesString: string, totalPages: number): number[] {
  return pagesString
    .split(',')
    .map(p => parseInt(p.trim()))
    .filter(n => !isNaN(n) && n > 0 && n <= totalPages)
}

async function rotatePages() {
  error.value = null
  rotatedResult.value = null
  rotatedCount.value = 0
  
  if (files.value.length === 0) {
    error.value = 'Please select a PDF file'
    return
  }

  try {
    const file = files.value[0]
    const buffer = await file.arrayBuffer()
    const metadata = await PDFService.getPDFMetadata(buffer)
    
    let rotations: Array<{ page: number; degrees: number }> = []
    
    if (rotationMode.value === 'all') {
      for (let i = 1; i <= metadata.pageCount; i++) {
        rotations.push({ page: i, degrees: rotationAngle.value })
      }
      rotatedCount.value = metadata.pageCount
    } else {
      const pageNumbers = parseSpecificPages(specificPages.value, metadata.pageCount)
      if (pageNumbers.length === 0) {
        error.value = 'Please enter valid page numbers'
        return
      }
      rotations = pageNumbers.map(page => ({ page, degrees: rotationAngle.value }))
      rotatedCount.value = pageNumbers.length
    }
    
    rotatedResult.value = await PDFService.rotatePages(buffer, rotations)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to rotate pages'
  }
}

function downloadResult() {
  if (!rotatedResult.value) return

  const blob = new Blob([rotatedResult.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'rotated.pdf'
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

.rotation-mode-selector,
.rotation-angle {
  display: flex;
  justify-content: center;
}

.info-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 8px;
  color: #808080;
}
</style>
