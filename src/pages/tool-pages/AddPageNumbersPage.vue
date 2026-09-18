<template>
  <BaseToolPage
    title="Add Page Numbers"
    description="Add page numbers to any position on your PDF"
    accepted-file-types=".pdf"
    action-label="Add Page Numbers"
    success-message="Page Numbers Added Successfully!"
    download-filename="numbered.pdf"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="addPageNumbers"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Page Number Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="position-selector">
              <label class="field-label">Position</label>
              <div class="position-grid">
                <q-btn
                  v-for="pos in positionOptions"
                  :key="pos.value"
                  :class="{ active: pageNumberOptions.position === pos.value }"
                  @click="pageNumberOptions.position = pos.value"
                  outline
                  color="primary"
                  size="sm"
                >
                  {{ pos.label }}
                </q-btn>
              </div>
            </div>

            <div class="option-row q-mt-md">
              <q-input
                v-model.number="pageNumberOptions.startFrom"
                label="Start From"
                type="number"
                filled
                dark
                color="primary"
                min="1"
              />
              <q-input
                v-model.number="pageNumberOptions.fontSize"
                label="Font Size"
                type="number"
                filled
                dark
                color="primary"
                min="8"
                max="72"
              />
            </div>

            <div class="format-selector q-mt-md">
              <label class="field-label">Number Format</label>
              <q-btn-toggle
                v-model="pageNumberOptions.format"
                toggle-color="primary"
                :options="[
                  { label: '1', value: '1' },
                  { label: '1 of N', value: '1 of N' },
                  { label: 'Page 1', value: 'Page 1' }
                ]"
                spread
              />
            </div>

            <div v-if="pdfMetadata" class="info-box q-mt-md">
              <q-icon name="info" color="info" />
              <span>PDF has {{ pdfMetadata.pageCount }} pages</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="numberedResult" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>Page Numbers Added Successfully!</h3>
          <p>Added page numbers starting from {{ pageNumberOptions.startFrom }}</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download Numbered PDF"
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
const pageNumberOptions = ref({
  position: 'bottom-center' as any,
  startFrom: 1,
  fontSize: 12,
  format: '1' as any
})
const numberedResult = ref<ArrayBuffer | null>(null)
const error = ref<string | null>(null)

const positionOptions = [
  { label: 'Top Left', value: 'top-left' },
  { label: 'Top Center', value: 'top-center' },
  { label: 'Top Right', value: 'top-right' },
  { label: 'Bottom Left', value: 'bottom-left' },
  { label: 'Bottom Center', value: 'bottom-center' },
  { label: 'Bottom Right', value: 'bottom-right' }
]

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

async function addPageNumbers() {
  error.value = null
  numberedResult.value = null
  
  if (files.value.length === 0) {
    error.value = 'Please select a PDF file'
    return
  }

  try {
    const file = files.value[0]
    const buffer = await file.arrayBuffer()
    
    numberedResult.value = await PDFService.addPageNumbers(buffer, {
      position: pageNumberOptions.value.position,
      startFrom: pageNumberOptions.value.startFrom,
      format: pageNumberOptions.value.format,
      fontSize: pageNumberOptions.value.fontSize
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to add page numbers'
  }
}

function downloadResult() {
  if (!numberedResult.value) return

  const blob = new Blob([numberedResult.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'numbered.pdf'
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

.field-label {
  display: block;
  margin-bottom: 8px;
  color: #a0a0a0;
  font-size: 14px;
  font-weight: 500;
}

.position-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.position-grid .q-btn {
  border-color: rgba(255, 255, 255, 0.2);
}

.position-grid .q-btn.active {
  background: rgba(74, 158, 255, 0.2);
  border-color: #4a9eff;
}

.option-row {
  display: flex;
  gap: 12px;
}

.option-row > * {
  flex: 1;
}

.format-selector {
  margin-top: 16px;
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
