<template>
  <BaseToolPage
    title="OCR Images"
    description="Extract text from images using optical character recognition"
    accepted-file-types=".jpg,.jpeg,.png,.webp,.bmp,.tiff"
    :supports-multiple-files="true"
    action-label="Extract Text"
    success-message="Text Extracted Successfully!"
    download-filename="extracted-text.txt"
    preview-component="image"
    @files-selected="handleFilesSelected"
    @process-files="performOCR"
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
                v-model="ocrOptions.preserveLayout"
                label="Preserve Layout"
                color="primary"
                dark
              />
              <q-checkbox
                v-model="ocrOptions.enhanceContrast"
                label="Enhance Contrast"
                color="primary"
                dark
              />
            </div>

            <div class="info-box q-mt-md">
              <q-icon name="info" color="info" />
              <span>Supports JPG, PNG, WebP, BMP, and TIFF formats</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="ocrResults.length > 0" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>Text Extracted Successfully!</h3>
          <p>Processed {{ ocrResults.length }} image(s)</p>
        </div>
        
        <div class="results-list">
          <div v-for="(result, index) in ocrResults" :key="index" class="result-item">
            <div class="result-header">
              <span>{{ files[index]?.name || `Image ${index + 1}` }}</span>
              <span class="confidence">{{ result.confidence.toFixed(1) }}% confidence</span>
            </div>
            <q-input
              v-model="result.text"
              type="textarea"
              label="Extracted Text"
              filled
              dark
              color="primary"
              rows="4"
              readonly
              class="q-mt-sm"
            />
          </div>
        </div>
        
        <div class="download-actions">
          <q-btn
            color="primary"
            label="Download All as TXT"
            @click="downloadAllAsTXT"
            size="lg"
          >
            <template v-slot:after>
              <q-icon name="download" />
            </template>
          </q-btn>
          
          <q-btn
            color="secondary"
            label="Download Individual Files"
            @click="downloadIndividual"
            size="lg"
          >
            <template v-slot:after>
              <q-icon name="file_download" />
            </template>
          </q-btn>
        </div>
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
  { label: 'Portuguese', value: 'por' },
  { label: 'Chinese (Simplified)', value: 'chi_sim' },
  { label: 'Japanese', value: 'jpn' },
  { label: 'Korean', value: 'kor' }
])
const ocrOptions = ref({
  preserveLayout: true,
  enhanceContrast: false
})
const ocrResults = ref<{ text: string; confidence: number }[]>([])
const error = ref<string | null>(null)

async function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

async function performOCR() {
  error.value = null
  ocrResults.value = []
  
  if (files.value.length === 0) {
    error.value = 'Please select at least one image file'
    return
  }

  try {
    const results = await OCRService.batchRecognize(files.value, {
      language: selectedLanguage.value,
      preserveInterwordSpaces: ocrOptions.value.preserveLayout
    })
    
    ocrResults.value = results
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to perform OCR on images'
  }
}

function downloadAllAsTXT() {
  if (ocrResults.value.length === 0) return

  const combinedText = ocrResults.value
    .map((result, index) => `--- ${files.value[index]?.name || `Image ${index + 1}`} ---\n${result.text}`)
    .join('\n\n')
  
  const blob = new Blob([combinedText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'extracted-text.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function downloadIndividual() {
  ocrResults.value.forEach((result, index) => {
    const blob = new Blob([result.text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${files.value[index]?.name.replace(/\.[^/.]+$/, '') || `image-${index + 1}`}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  })
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
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  max-height: 400px;
  overflow-y: auto;
}

.result-item {
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.result-header span:first-child {
  color: #ffffff;
  font-weight: 600;
}

.confidence {
  color: #4ade80;
  font-size: 12px;
  font-weight: 500;
}

.download-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
