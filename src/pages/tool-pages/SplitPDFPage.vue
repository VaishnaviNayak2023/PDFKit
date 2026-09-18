<template>
  <BaseToolPage
    title="Split PDF"
    description="Split a PDF into multiple documents by page ranges"
    long-description="Extract specific pages or split a PDF into individual pages. Define custom ranges like '1-3, 5, 7-9' or split every page into a separate file."
    accepted-file-types=".pdf"
    action-label="Split PDF"
    success-message="PDF Split Successfully!"
    download-filename="split.pdf"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="splitPDF"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Split Options</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="split-mode-selector">
              <q-btn-toggle
                v-model="splitMode"
                toggle-color="primary"
                :options="[
                  { label: 'Custom Range', value: 'range' },
                  { label: 'Every Page', value: 'single' },
                  { label: 'Specific Pages', value: 'specific' }
                ]"
                spread
              />
            </div>

            <div v-if="splitMode === 'range'" class="range-input q-mt-md">
              <q-input
                v-model="pageRange"
                label="Page Range (e.g., 1-3, 5, 7-9)"
                hint="Enter page ranges separated by commas"
                filled
                dark
                color="primary"
              />
            </div>

            <div v-if="splitMode === 'specific'" class="specific-pages q-mt-md">
              <q-input
                v-model="specificPages"
                label="Specific Pages (e.g., 1,3,5,7)"
                hint="Enter specific page numbers separated by commas"
                filled
                dark
                color="primary"
              />
            </div>

            <div class="info-box q-mt-md">
              <q-icon name="info" color="info" />
              <span v-if="pdfMetadata">
                PDF has {{ pdfMetadata.pageCount }} pages
              </span>
              <span v-else>
                Upload a PDF to see page count
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="results.length > 0" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>PDF Split Successfully!</h3>
          <p>Created {{ results.length }} separate file(s)</p>
        </div>
        
        <div class="results-list">
          <div v-for="(result, index) in results" :key="index" class="result-item">
            <span>Part {{ index + 1 }}</span>
            <q-btn
              color="primary"
              label="Download"
              @click="downloadResult(result, index)"
              size="sm"
            />
          </div>
        </div>

        <q-btn
          v-if="results.length > 1"
          color="secondary"
          label="Download All as ZIP"
          @click="downloadAllAsZip"
          size="lg"
        />
      </div>
    </template>
  </BaseToolPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseToolPage from '@/components/tools/BaseToolPage.vue'
import { PDFService } from '@/services/pdf/pdfService'
import JSZip from 'jszip'

const baseToolPage = ref()
const files = ref<File[]>([])
const splitMode = ref<'range' | 'single' | 'specific'>('range')
const pageRange = ref('')
const specificPages = ref('')
const pdfMetadata = ref<{ pageCount: number } | null>(null)
const results = ref<ArrayBuffer[]>([])
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

function parsePageRanges(rangeString: string, totalPages: number): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = []
  const parts = rangeString.split(',').map(p => p.trim())
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(n => parseInt(n.trim()))
      if (!isNaN(start) && !isNaN(end) && start > 0 && end <= totalPages && start <= end) {
        ranges.push({ start: start - 1, end })
      }
    } else {
      const page = parseInt(part)
      if (!isNaN(page) && page > 0 && page <= totalPages) {
        ranges.push({ start: page - 1, end: page })
      }
    }
  }
  
  return ranges
}

function parseSpecificPages(pagesString: string, totalPages: number): Array<{ start: number; end: number }> {
  const pageNumbers = pagesString.split(',').map(p => parseInt(p.trim())).filter(n => !isNaN(n) && n > 0 && n <= totalPages)
  return pageNumbers.map(page => ({ start: page - 1, end: page }))
}

async function splitPDF() {
  error.value = null
  results.value = []
  
  if (files.value.length === 0) {
    error.value = 'Please select a PDF file'
    return
  }

  try {
    const file = files.value[0]
    const buffer = await file.arrayBuffer()
    const metadata = await PDFService.getPDFMetadata(buffer)
    
    let ranges: Array<{ start: number; end: number }> = []
    
    if (splitMode.value === 'range') {
      if (!pageRange.value.trim()) {
        error.value = 'Please enter a page range'
        return
      }
      ranges = parsePageRanges(pageRange.value, metadata.pageCount)
    } else if (splitMode.value === 'single') {
      for (let i = 0; i < metadata.pageCount; i++) {
        ranges.push({ start: i, end: i + 1 })
      }
    } else if (splitMode.value === 'specific') {
      if (!specificPages.value.trim()) {
        error.value = 'Please enter specific page numbers'
        return
      }
      ranges = parseSpecificPages(specificPages.value, metadata.pageCount)
    }
    
    if (ranges.length === 0) {
      error.value = 'Invalid page range. Please check your input.'
      return
    }

    results.value = await PDFService.splitPDF({
      file: buffer,
      ranges
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to split PDF'
  }
}

function downloadResult(result: ArrayBuffer, index: number) {
  const blob = new Blob([result], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `split-part-${index + 1}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function downloadAllAsZip() {
  try {
    const zip = new JSZip()
    
    results.value.forEach((result, index) => {
      zip.file(`split-part-${index + 1}.pdf`, result)
    })
    
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'split-files.zip'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create ZIP file'
  }
}
</script>

<style scoped>
.settings-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.split-mode-selector {
  display: flex;
  justify-content: center;
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
  gap: 12px;
  width: 100%;
  max-width: 400px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: #ffffff;
}
</style>
