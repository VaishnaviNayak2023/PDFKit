<template>
  <q-page class="bg-dark">
    <div class="tool-page">
      <div class="tool-header">
        <h1 class="tool-title">Merge PDF</h1>
        <p class="tool-description">Combine multiple PDF files into a single document</p>
      </div>

      <div class="tool-content">
        <FileDropZone
          accept=".pdf"
          :multiple="true"
          @files-selected="handleFilesSelected"
        />

        <div v-if="files.length > 0" class="file-section">
          <h3 class="section-title">Selected Files ({{ files.length }})</h3>
          
          <FileQueue
            :files="queuedFiles"
            action-label="Merge PDFs"
            action-color="primary"
            @remove-file="removeFile"
            @clear-all="clearFiles"
            @process-files="mergePDFs"
          />
        </div>

        <div v-if="result" class="result-section">
          <div class="success-message">
            <q-icon name="check_circle" size="48px" color="positive" />
            <h3>PDFs Merged Successfully!</h3>
          </div>
          
          <q-btn
            color="primary"
            label="Download Merged PDF"
            @click="downloadResult"
            size="lg"
          >
            <template v-slot:after>
              <q-icon name="download" />
            </template>
          </q-btn>
        </div>

        <div v-if="error" class="error-section">
          <q-banner class="bg-negative text-white" dense>
            <template v-slot:avatar>
              <q-icon name="error" />
            </template>
            {{ error }}
            <template v-slot:action>
              <q-btn flat color="white" @click="error = null">Dismiss</q-btn>
            </template>
          </q-banner>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FileDropZone from '@/components/upload/FileDropZone.vue'
import FileQueue from '@/components/upload/FileQueue.vue'
import { PDFService } from '@/services/pdf/pdfService'
import { useDocumentsStore } from '@/stores/documents'

interface QueuedFile {
  id: string
  name: string
  type: string
  size: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  data: ArrayBuffer
}

const documentsStore = useDocumentsStore()

const files = ref<File[]>([])
const queuedFiles = ref<QueuedFile[]>([])
const result = ref<ArrayBuffer | null>(null)
const error = ref<string | null>(null)

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
  
  queuedFiles.value = selectedFiles.map((file, index) => ({
    id: `file-${index}`,
    name: file.name,
    type: file.type,
    size: file.size,
    status: 'pending' as const,
    data: new ArrayBuffer(0) // Will be populated when processing
  }))
}

function removeFile(index: number) {
  queuedFiles.value.splice(index, 1)
  files.value.splice(index, 1)
}

function clearFiles() {
  queuedFiles.value = []
  files.value = []
  result.value = null
  error.value = null
}

async function mergePDFs() {
  error.value = null
  result.value = null

  // Update status to processing
  queuedFiles.value.forEach(file => {
    file.status = 'processing'
  })

  try {
    // Read all files as ArrayBuffers
    const fileBuffers: ArrayBuffer[] = []
    
    for (const file of files.value) {
      const buffer = await file.arrayBuffer()
      fileBuffers.push(buffer)
    }

    // Use PDF service to merge
    const mergedPdf = await PDFService.mergePDFs({
      files: fileBuffers,
      outputFileName: 'merged.pdf'
    })

    result.value = mergedPdf

    // Update status to completed
    queuedFiles.value.forEach(file => {
      file.status = 'completed'
    })

    // Add to recent files
    documentsStore.addRecentFile({
      id: crypto.randomUUID(),
      name: 'merged.pdf',
      type: 'application/pdf',
      size: mergedPdf.byteLength,
      lastModified: new Date(),
      data: mergedPdf
    })

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to merge PDFs'
    
    queuedFiles.value.forEach(file => {
      file.status = 'error'
    })
  }
}

function downloadResult() {
  if (!result.value) return

  const blob = new Blob([result.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'merged.pdf'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.tool-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.tool-header {
  text-align: center;
  margin-bottom: 48px;
}

.tool-title {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tool-description {
  font-size: 18px;
  color: #808080;
}

.tool-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.file-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16px;
}

.result-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 48px;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 16px;
}

.success-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.success-message h3 {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
}

.error-section {
  margin-top: 24px;
}
</style>
