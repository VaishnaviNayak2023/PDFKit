<template>
  <BaseToolPage
    title="Compress PDF"
    description="Reduce PDF file size while maintaining quality"
    long-description="Shrink your PDF files for easy sharing via email or upload. Choose from multiple compression levels to balance quality and file size."
    accepted-file-types=".pdf"
    action-label="Compress PDF"
    success-message="PDF Compressed Successfully!"
    download-filename="compressed.pdf"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="compressPDF"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Compression Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="compression-levels">
              <q-btn-toggle
                v-model="compressionLevel"
                toggle-color="primary"
                :options="[
                  { label: 'Low Compression', value: 'low' },
                  { label: 'Medium Compression', value: 'medium' },
                  { label: 'High Compression', value: 'high' }
                ]"
                spread
              />
            </div>

            <div class="compression-info q-mt-md">
              <div class="info-item">
                <q-icon name="info" color="info" />
                <span>Low: Best quality, larger file size</span>
              </div>
              <div class="info-item">
                <q-icon name="info" color="info" />
                <span>Medium: Balanced quality and size</span>
              </div>
              <div class="info-item">
                <q-icon name="info" color="info" />
                <span>High: Smallest file size, lower quality</span>
              </div>
            </div>

            <div v-if="originalFileSize" class="file-info q-mt-md">
              <div class="info-row">
                <span>Original size:</span>
                <span>{{ formatFileSize(originalFileSize) }}</span>
              </div>
              <div v-if="compressedFileSize" class="info-row">
                <span>Compressed size:</span>
                <span>{{ formatFileSize(compressedFileSize) }}</span>
              </div>
              <div v-if="compressedFileSize" class="info-row highlight">
                <span>Reduction:</span>
                <span>{{ calculateReduction() }}</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="compressedResult" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>PDF Compressed Successfully!</h3>
        </div>
        
        <div class="compression-stats">
          <div class="stat-item">
            <span class="stat-label">Original</span>
            <span class="stat-value">{{ formatFileSize(originalFileSize) }}</span>
          </div>
          <q-icon name="arrow_forward" size="24px" color="primary" />
          <div class="stat-item">
            <span class="stat-label">Compressed</span>
            <span class="stat-value">{{ formatFileSize(compressedFileSize) }}</span>
          </div>
          <div class="stat-item highlight">
            <span class="stat-label">Saved</span>
            <span class="stat-value">{{ calculateReduction() }}</span>
          </div>
        </div>
        
        <q-btn
          color="primary"
          label="Download Compressed PDF"
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
const compressionLevel = ref<'low' | 'medium' | 'high'>('medium')
const originalFileSize = ref(0)
const compressedFileSize = ref(0)
const compressedResult = ref<ArrayBuffer | null>(null)
const error = ref<string | null>(null)

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
  if (selectedFiles.length > 0) {
    originalFileSize.value = selectedFiles[0].size
  }
}

async function compressPDF() {
  error.value = null
  compressedResult.value = null
  compressedFileSize.value = 0
  
  if (files.value.length === 0) {
    error.value = 'Please select a PDF file'
    return
  }

  try {
    const file = files.value[0]
    const buffer = await file.arrayBuffer()
    
    compressedResult.value = await PDFService.compressPDF({
      file: buffer,
      quality: compressionLevel.value
    })
    
    compressedFileSize.value = compressedResult.value.byteLength
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to compress PDF'
  }
}

function downloadResult() {
  if (!compressedResult.value) return

  const blob = new Blob([compressedResult.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'compressed.pdf'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function calculateReduction(): string {
  if (!originalFileSize.value || !compressedFileSize.value) return '0%'
  const saved = ((originalFileSize.value - compressedFileSize.value) / originalFileSize.value) * 100
  return `${saved.toFixed(1)}%`
}
</script>

<style scoped>
.settings-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.compression-levels {
  display: flex;
  justify-content: center;
}

.compression-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 6px;
  color: #808080;
  font-size: 14px;
}

.file-info {
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  color: #a0a0a0;
}

.info-row.highlight {
  color: #4ade80;
  font-weight: 600;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 8px;
  padding-top: 12px;
}

.compression-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  justify-content: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  min-width: 100px;
}

.stat-item.highlight {
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.stat-label {
  font-size: 12px;
  color: #808080;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}
</style>
