<template>
  <BaseToolPage
    title="PDF to TXT"
    description="Extract all text from a PDF as a plain text file"
    accepted-file-types=".pdf"
    action-label="Extract Text"
    success-message="Text Extracted Successfully!"
    download-filename="extracted.txt"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="extractText"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Extraction Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="extraction-options">
              <q-checkbox
                v-model="extractionOptions.preserveLayout"
                label="Preserve Original Layout"
                color="primary"
                dark
              />
              <q-checkbox
                v-model="extractionOptions.includePageBreaks"
                label="Include Page Breaks"
                color="primary"
                dark
              />
              <q-checkbox
                v-model="extractionOptions.removeHeadersFooters"
                label="Remove Headers/Footers"
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
const extractionOptions = ref({
  preserveLayout: true,
  includePageBreaks: true,
  removeHeadersFooters: false
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
    
    if (!extractionOptions.value.includePageBreaks) {
      text = text.replace(/--- Page \d+ ---/g, '')
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
  a.download = 'extracted.txt'
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
