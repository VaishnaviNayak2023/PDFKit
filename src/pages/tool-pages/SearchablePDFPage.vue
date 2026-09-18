<template>
  <BaseToolPage
    title="Searchable PDF"
    description="Make a scanned PDF fully text-searchable"
    accepted-file-types=".pdf"
    action-label="Create Searchable PDF"
    success-message="Searchable PDF Created Successfully!"
    download-filename="searchable.pdf"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="createSearchablePDF"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">OCR Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="language-selector">
              <label class="field-label">Language</label>
              <q-select
                v-model="selectedLanguage"
                :options="availableLanguages"
                label="Select Language"
                filled
                dark
                color="primary"
                emit-value
                map-options
              />
            </div>

            <div class="ocr-options q-mt-md">
              <q-checkbox
                v-model="ocrOptions.preserveOriginalImages"
                label="Preserve Original Images"
                color="primary"
                dark
              />
              <q-checkbox
                v-model="ocrOptions.invisibleTextLayer"
                label="Invisible Text Layer"
                color="primary"
                dark
              />
            </div>

            <div class="info-box q-mt-md">
              <q-icon name="info" color="info" />
              <span>This will add an invisible text layer over the original images, making the PDF searchable while preserving the original appearance.</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="searchableResult" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>Searchable PDF Created Successfully!</h3>
          <p>Your PDF is now fully text-searchable</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download Searchable PDF"
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
import { OCRService } from '@/services/ocr/ocrService'

const files = ref<File[]>([])
const selectedLanguage = ref('eng')
const availableLanguages = ref([
  { label: 'English', value: 'eng' },
  { label: 'Spanish', value: 'spa' },
  { label: 'French', value: 'fra' },
  { label: 'German', value: 'deu' },
  { label: 'Italian', value: 'ita' },
  { label: 'Portuguese', value: 'por' }
])
const ocrOptions = ref({
  preserveOriginalImages: true,
  invisibleTextLayer: true
})
const searchableResult = ref<ArrayBuffer | null>(null)
const error = ref<string | null>(null)

async function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

async function createSearchablePDF() {
  error.value = null
  searchableResult.value = null
  
  if (files.value.length === 0) {
    error.value = 'Please select a PDF file'
    return
  }

  try {
    const file = files.value[0]
    const buffer = await file.arrayBuffer()
    
    searchableResult.value = await OCRService.createSearchablePDF(buffer, {
      language: selectedLanguage.value
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create searchable PDF'
  }
}

function downloadResult() {
  if (!searchableResult.value) return

  const blob = new Blob([searchableResult.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'searchable.pdf'
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

.ocr-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
