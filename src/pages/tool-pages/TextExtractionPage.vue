<template>
  <BaseToolPage
    title="Text Extraction"
    description="Extract all text content from a PDF document"
    accepted-file-types=".pdf"
    action-label="Extract Text"
    success-message="Text Extracted Successfully!"
    download-filename="extracted-text.txt"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="extractText"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Extraction Options</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="extraction-mode-selector">
              <label class="field-label">Extraction Mode</label>
              <q-btn-toggle
                v-model="extractionMode"
                toggle-color="primary"
                :options="[
                  { label: 'Plain Text', value: 'plain' },
                  { label: 'With Layout', value: 'layout' },
                  { label: 'Page by Page', value: 'pages' }
                ]"
                spread
              />
            </div>

            <div class="extraction-options q-mt-md">
              <q-checkbox
                v-model="extractionOptions.preserveWhitespace"
                label="Preserve Whitespace"
                color="primary"
                dark
              />
              <q-checkbox
                v-model="extractionOptions.includePageNumbers"
                label="Include Page Numbers"
                color="primary"
                dark
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
      <div v-if="extractedText" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>Text Extracted Successfully!</h3>
          <p>Extracted {{ extractedText.split(/\s+/).length }} words</p>
        </div>
        
        <div class="text-preview">
          <q-input
            v-model="extractedText"
            type="textarea"
            label="Extracted Text"
            filled
            dark
            color="primary"
            rows="12"
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
import { PDFService } from '@/services/pdf/pdfService'

const files = ref<File[]>([])
const extractionMode = ref<'plain' | 'layout' | 'pages'>('plain')
const extractionOptions = ref({
  preserveWhitespace: true,
  includePageNumbers: false
})
const pdfMetadata = ref<{ pageCount: number } | null>(null)
const extractedText = ref('')
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

async function extractText() {
  error.value = null
  extractedText.value = ''
  
  if (files.value.length === 0) {
    error.value = 'Please select a PDF file'
    return
  }

  try {
    const file = files.value[0]
    const buffer = await file.arrayBuffer()
    
    let text = await PDFService.extractText(buffer)
    
    if (extractionMode.value === 'pages' && extractionOptions.value.includePageNumbers) {
      // Already includes page numbers from the service
    }
    
    if (!extractionOptions.value.preserveWhitespace) {
      text = text.replace(/\s+/g, ' ').trim()
    }
    
    extractedText.value = text
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to extract text from PDF'
  }
}

function downloadAsTXT() {
  if (!extractedText.value) return

  const blob = new Blob([extractedText.value], { type: 'text/plain' })
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
  if (!extractedText.value) return

  try {
    await navigator.clipboard.writeText(extractedText.value)
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

.extraction-options {
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
