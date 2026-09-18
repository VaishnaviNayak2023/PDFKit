<template>
  <BaseToolPage
    title="Metadata Cleaner"
    description="Strip all metadata and hidden data from PDFs"
    long-description="Remove all hidden metadata including author, creation date, modification history, and other hidden information from your PDF files."
    accepted-file-types=".pdf"
    action-label="Clean Metadata"
    success-message="Metadata Cleaned Successfully!"
    download-filename="cleaned.pdf"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="cleanMetadata"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Metadata Removal Options</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div v-if="currentMetadata" class="current-metadata">
              <h4>Current Metadata Found:</h4>
              <div class="metadata-item">
                <span class="label">Title:</span>
                <span class="value">{{ currentMetadata.title || 'None' }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Author:</span>
                <span class="value">{{ currentMetadata.author || 'None' }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Subject:</span>
                <span class="value">{{ currentMetadata.subject || 'None' }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Keywords:</span>
                <span class="value">{{ currentMetadata.keywords || 'None' }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Creator:</span>
                <span class="value">{{ currentMetadata.creator || 'None' }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Producer:</span>
                <span class="value">{{ currentMetadata.producer || 'None' }}</span>
              </div>
            </div>

            <div v-else class="placeholder">
              <q-icon name="info" size="32px" color="grey-6" />
              <p>Upload a PDF to scan for metadata</p>
            </div>

            <div class="cleaning-options q-mt-md">
              <label class="field-label">Data to Remove</label>
              
              <div class="options-grid">
                <q-checkbox
                  v-model="cleaningOptions.title"
                  label="Title"
                  color="primary"
                  dark
                />
                <q-checkbox
                  v-model="cleaningOptions.author"
                  label="Author"
                  color="primary"
                  dark
                />
                <q-checkbox
                  v-model="cleaningOptions.subject"
                  label="Subject"
                  color="primary"
                  dark
                />
                <q-checkbox
                  v-model="cleaningOptions.keywords"
                  label="Keywords"
                  color="primary"
                  dark
                />
                <q-checkbox
                  v-model="cleaningOptions.creator"
                  label="Creator"
                  color="primary"
                  dark
                />
                <q-checkbox
                  v-model="cleaningOptions.producer"
                  label="Producer"
                  color="primary"
                  dark
                />
                <q-checkbox
                  v-model="cleaningOptions.creationDate"
                  label="Creation Date"
                  color="primary"
                  dark
                />
                <q-checkbox
                  v-model="cleaningOptions.modificationDate"
                  label="Modification Date"
                  color="primary"
                  dark
                />
              </div>

              <div class="quick-actions q-mt-md">
                <q-btn
                  flat
                  label="Select All"
                  @click="selectAll"
                  color="primary"
                  size="sm"
                />
                <q-btn
                  flat
                  label="Select None"
                  @click="selectNone"
                  color="grey-6"
                  size="sm"
                />
              </div>
            </div>

            <div class="info-box q-mt-md">
              <q-icon name="privacy_tip" color="info" />
              <span>Removing metadata helps protect your privacy and prevents tracking</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="cleanedResult" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>Metadata Cleaned Successfully!</h3>
          <p>All selected metadata has been removed from your PDF</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download Cleaned PDF"
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
const currentMetadata = ref<any>(null)
const cleaningOptions = ref({
  title: true,
  author: true,
  subject: true,
  keywords: true,
  creator: true,
  producer: true,
  creationDate: true,
  modificationDate: true
})
const cleanedResult = ref<ArrayBuffer | null>(null)
const error = ref<string | null>(null)

async function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
  
  if (selectedFiles.length > 0) {
    try {
      const buffer = await selectedFiles[0].arrayBuffer()
      const metadata = await PDFService.getPDFMetadata(buffer)
      currentMetadata.value = {
        ...metadata,
        creator: 'Unknown', // pdf-lib doesn't expose creator directly
        producer: 'Unknown'
      }
    } catch (err) {
      console.error('Error getting PDF metadata:', err)
    }
  }
}

function selectAll() {
  Object.keys(cleaningOptions.value).forEach(key => {
    cleaningOptions.value[key as keyof typeof cleaningOptions.value] = true
  })
}

function selectNone() {
  Object.keys(cleaningOptions.value).forEach(key => {
    cleaningOptions.value[key as keyof typeof cleaningOptions.value] = false
  })
}

async function cleanMetadata() {
  error.value = null
  cleanedResult.value = null
  
  if (files.value.length === 0) {
    error.value = 'Please select a PDF file'
    return
  }

  try {
    const file = files.value[0]
    const buffer = await file.arrayBuffer()
    
    cleanedResult.value = await PDFService.cleanMetadata(buffer)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to clean metadata'
  }
}

function downloadResult() {
  if (!cleanedResult.value) return

  const blob = new Blob([cleanedResult.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'cleaned.pdf'
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

.current-metadata {
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  margin-bottom: 16px;
}

.current-metadata h4 {
  color: #ffffff;
  margin-bottom: 12px;
  font-size: 16px;
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.metadata-item:last-child {
  border-bottom: none;
}

.metadata-item .label {
  color: #808080;
  font-weight: 500;
}

.metadata-item .value {
  color: #ffffff;
  font-weight: 600;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px;
  color: #606060;
}

.field-label {
  display: block;
  margin-bottom: 12px;
  color: #a0a0a0;
  font-size: 14px;
  font-weight: 500;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quick-actions {
  display: flex;
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
  margin-top: 16px;
}
</style>
