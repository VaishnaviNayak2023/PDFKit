<template>
  <BaseToolPage
    title="Batch OCR"
    description="Process multiple images or PDFs with OCR at once"
    accepted-file-types=".pdf,.jpg,.jpeg,.png,.webp"
    :supports-multiple-files="true"
    action-label="Process All Files"
    success-message="Batch Processing Complete!"
    download-filename="batch-results.zip"
    @files-selected="handleFilesSelected"
    @process-files="performBatchOCR"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Batch OCR Settings</h3>
        
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

            <div class="output-format q-mt-md">
              <label class="field-label">Output Format</label>
              <q-btn-toggle
                v-model="outputFormat"
                toggle-color="primary"
                :options="[
                  { label: 'TXT Files', value: 'txt' },
                  { label: 'Combined TXT', value: 'combined' },
                  { label: 'JSON', value: 'json' }
                ]"
                spread
              />
            </div>

            <div class="file-count q-mt-md">
              <div class="count-info">
                <q-icon name="folder_open" color="primary" />
                <span>{{ files.length }} file(s) selected</span>
              </div>
            </div>

            <div class="info-box q-mt-md">
              <q-icon name="local_fire_department" color="warning" />
              <span>Batch processing can be resource-intensive. Large files may take several minutes each.</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="batchResults.length > 0" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>Batch Processing Complete!</h3>
          <p>Successfully processed {{ batchResults.length }} file(s)</p>
        </div>
        
        <div class="results-summary">
          <div class="summary-item">
            <span class="label">Total Files:</span>
            <span class="value">{{ files.length }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Successful:</span>
            <span class="value success">{{ batchResults.length }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Failed:</span>
            <span class="value error">{{ files.length - batchResults.length }}</span>
          </div>
        </div>

        <div class="download-actions">
          <q-btn
            color="primary"
            label="Download All Results"
            @click="downloadAllResults"
            size="lg"
          >
            <template v-slot:after>
              <q-icon name="download" />
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
import JSZip from 'jszip'

const files = ref<File[]>([])
const selectedLanguage = ref('eng')
const availableLanguages = ref([
  { label: 'English', value: 'eng' },
  { label: 'Spanish', value: 'spa' },
  { label: 'French', value: 'fra' },
  { label: 'German', value: 'deu' },
  { label: 'Italian', value: 'ita' }
])
const outputFormat = ref<'txt' | 'combined' | 'json'>('txt')
const batchResults = ref<{ fileName: string; text: string; confidence: number }[]>([])
const error = ref<string | null>(null)

async function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

async function performBatchOCR() {
  error.value = null
  batchResults.value = []
  
  if (files.value.length === 0) {
    error.value = 'Please select at least one file'
    return
  }

  try {
    const results = await OCRService.batchRecognize(files.value, {
      language: selectedLanguage.value
    })
    
    batchResults.value = results.map((result, index) => ({
      fileName: files.value[index]?.name || `file-${index + 1}`,
      text: result.text,
      confidence: result.confidence
    }))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to process batch OCR'
  }
}

async function downloadAllResults() {
  if (batchResults.value.length === 0) return

  try {
    const zip = new JSZip()
    
    if (outputFormat.value === 'txt') {
      batchResults.value.forEach((result, index) => {
        const fileName = files.value[index]?.name.replace(/\.[^/.]+$/, '') || `file-${index + 1}`
        zip.file(`${fileName}.txt`, result.text)
      })
    } else if (outputFormat.value === 'combined') {
      const combinedText = batchResults.value
        .map(result => `--- ${result.fileName} ---\n${result.text}`)
        .join('\n\n')
      zip.file('combined-results.txt', combinedText)
    } else if (outputFormat.value === 'json') {
      zip.file('results.json', JSON.stringify(batchResults.value, null, 2))
    }
    
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'batch-results.zip'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create download file'
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

.file-count {
  margin-top: 16px;
}

.count-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
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

.results-summary {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  justify-content: center;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  min-width: 100px;
}

.summary-item .label {
  font-size: 12px;
  color: #808080;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-item .value {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
}

.summary-item .value.success {
  color: #4ade80;
}

.summary-item .value.error {
  color: #ef4444;
}

.download-actions {
  display: flex;
  justify-content: center;
}
</style>
