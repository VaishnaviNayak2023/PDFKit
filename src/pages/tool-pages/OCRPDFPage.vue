<template>
  <BaseToolPage
    title="OCR PDF"
    description="Extract text from scanned documents and images"
    long-description="Convert scanned PDFs into searchable, selectable text using Tesseract OCR. Supports 20+ languages. All processing happens locally in your browser."
    accepted-file-types=".pdf"
    action-label="Extract Text"
    success-message="Text Extracted Successfully!"
    download-filename="extracted-text.txt"
    preview-component="pdf"
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
                label="Preserve Document Layout"
                color="primary"
                dark
              />
              <q-checkbox
                v-model="ocrOptions.highQuality"
                label="High Quality Mode (slower)"
                color="primary"
                dark
              />
            </div>

            <div class="info-box q-mt-md">
              <q-icon name="local_fire_department" color="warning" />
              <span>OCR can be resource-intensive. Large files may take several minutes.</span>
            </div>

            <div class="privacy-note q-mt-md">
              <q-icon name="privacy_tip" color="positive" />
              <span>All OCR processing happens locally in your browser. No files are uploaded to any server.</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="ocrResult" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>Text Extracted Successfully!</h3>
          <p>Extracted {{ ocrResult.text.split(/\s+/).length }} words with {{ ocrResult.confidence.toFixed(1) }}% confidence</p>
        </div>
        
        <div class="text-preview">
          <q-input
            v-model="ocrResult.text"
            type="textarea"
            label="Extracted Text"
            filled
            dark
            color="primary"
            rows="10"
            readonly
          />
        </div>
        
        <div class="download-actions">
          <q-btn
            color="primary"
            label="Download as TXT"
            @click="downloadAsTXT"
            size="lg"
          >
            <template v-slot:after>
              <q-icon name="download" />
            </template>
          </q-btn>
          
          <q-btn
            color="secondary"
            label="Copy to Clipboard"
            @click="copyToClipboard"
            size="lg"
          >
            <template v-slot:after>
              <q-icon name="content_copy" />
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
  { label: 'Chinese (Traditional)', value: 'chi_tra' },
  { label: 'Japanese', value: 'jpn' },
  { label: 'Korean', value: 'kor' },
  { label: 'Russian', value: 'rus' },
  { label: 'Arabic', value: 'ara' }
])
const ocrOptions = ref({
  preserveLayout: true,
  highQuality: false
})
const ocrResult = ref<{ text: string; confidence: number } | null>(null)
const error = ref<string | null>(null)

async function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

async function performOCR() {
  error.value = null
  ocrResult.value = null
  
  if (files.value.length === 0) {
    error.value = 'Please select a PDF file'
    return
  }

  try {
    const file = files.value[0]
    const buffer = await file.arrayBuffer()
    
    const results = await OCRService.recognizePDF(buffer, {
      language: selectedLanguage.value,
      preserveInterwordSpaces: ocrOptions.value.preserveLayout
    })
    
    if (results.length > 0) {
      ocrResult.value = results[0]
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to perform OCR. The PDF might not contain extractable text or images.'
  }
}

function downloadAsTXT() {
  if (!ocrResult.value) return

  const blob = new Blob([ocrResult.value.text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'extracted-text.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function copyToClipboard() {
  if (!ocrResult.value) return

  try {
    await navigator.clipboard.writeText(ocrResult.value.text)
    // Show success message
  } catch (err) {
    error.value = 'Failed to copy to clipboard'
  }
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
  background: rgba(251, 191, 36, 0.1);
  border-radius: 8px;
  color: #fbbf24;
  font-size: 14px;
}

.privacy-note {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(74, 222, 128, 0.1);
  border-radius: 8px;
  color: #4ade80;
  font-size: 14px;
}

.text-preview {
  width: 100%;
  margin-bottom: 24px;
}

.download-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
