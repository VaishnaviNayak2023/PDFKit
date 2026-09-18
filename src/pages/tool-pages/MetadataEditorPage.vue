<template>
  <BaseToolPage
    title="Metadata Editor"
    description="Edit PDF metadata: title, author, subject, keywords"
    accepted-file-types=".pdf"
    action-label="Update Metadata"
    success-message="Metadata Updated Successfully!"
    download-filename="with-metadata.pdf"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="updateMetadata"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">PDF Metadata</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div v-if="currentMetadata" class="current-metadata">
              <div class="metadata-item">
                <span class="label">Current Title:</span>
                <span class="value">{{ currentMetadata.title || 'Not set' }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Current Author:</span>
                <span class="value">{{ currentMetadata.author || 'Not set' }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Current Subject:</span>
                <span class="value">{{ currentMetadata.subject || 'Not set' }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Current Keywords:</span>
                <span class="value">{{ currentMetadata.keywords || 'Not set' }}</span>
              </div>
            </div>

            <div class="metadata-form q-mt-md">
              <q-separator class="q-mb-md" />
              
              <q-input
                v-model="metadata.title"
                label="Title"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              
              <q-input
                v-model="metadata.author"
                label="Author"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              
              <q-input
                v-model="metadata.subject"
                label="Subject"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              
              <q-input
                v-model="metadata.keywords"
                label="Keywords (comma-separated)"
                filled
                dark
                color="primary"
                hint="Enter keywords separated by commas"
              />
            </div>

            <div class="actions q-mt-md">
              <q-btn
                flat
                label="Clear All"
                @click="clearMetadata"
                color="grey-6"
              />
              <q-btn
                flat
                label="Reset to Current"
                @click="resetToCurrent"
                color="primary"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="updatedResult" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>Metadata Updated Successfully!</h3>
        </div>
        
        <q-btn
          color="primary"
          label="Download PDF with New Metadata"
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
const currentMetadata = ref<{ title?: string; author?: string; subject?: string; keywords?: string } | null>(null)
const metadata = ref({
  title: '',
  author: '',
  subject: '',
  keywords: ''
})
const updatedResult = ref<ArrayBuffer | null>(null)
const error = ref<string | null>(null)

async function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
  
  if (selectedFiles.length > 0) {
    try {
      const buffer = await selectedFiles[0].arrayBuffer()
      const metadata = await PDFService.getPDFMetadata(buffer)
      currentMetadata.value = metadata
      
      // Pre-fill form with current metadata
      metadata.value = {
        title: metadata.title || '',
        author: metadata.author || '',
        subject: metadata.subject || '',
        keywords: metadata.keywords || ''
      }
    } catch (err) {
      console.error('Error getting PDF metadata:', err)
    }
  }
}

function clearMetadata() {
  metadata.value = {
    title: '',
    author: '',
    subject: '',
    keywords: ''
  }
}

function resetToCurrent() {
  if (currentMetadata.value) {
    metadata.value = {
      title: currentMetadata.value.title || '',
      author: currentMetadata.value.author || '',
      subject: currentMetadata.value.subject || '',
      keywords: currentMetadata.value.keywords || ''
    }
  }
}

async function updateMetadata() {
  error.value = null
  updatedResult.value = null
  
  if (files.value.length === 0) {
    error.value = 'Please select a PDF file'
    return
  }

  try {
    const file = files.value[0]
    const buffer = await file.arrayBuffer()
    
    updatedResult.value = await PDFService.editMetadata(buffer, {
      title: metadata.value.title || undefined,
      author: metadata.value.author || undefined,
      subject: metadata.value.subject || undefined,
      keywords: metadata.value.keywords || undefined
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update metadata'
  }
}

function downloadResult() {
  if (!updatedResult.value) return

  const blob = new Blob([updatedResult.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'with-metadata.pdf'
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

.metadata-form {
  padding: 16px 0;
}

.actions {
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
}
</style>
