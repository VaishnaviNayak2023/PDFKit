<template>
  <BaseToolPage
    title="Extract Pages"
    description="Extract selected pages from a PDF into a new file"
    accepted-file-types=".pdf"
    action-label="Extract Pages"
    success-message="Pages Extracted Successfully!"
    download-filename="extracted.pdf"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="extractPages"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Select Pages to Extract</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="extract-mode-selector">
              <q-btn-toggle
                v-model="extractMode"
                toggle-color="primary"
                :options="[
                  { label: 'Specific Pages', value: 'specific' },
                  { label: 'Range', value: 'range' },
                  { label: 'All Pages', value: 'all' }
                ]"
                spread
              />
            </div>

            <div v-if="extractMode === 'specific'" class="specific-pages q-mt-md">
              <q-input
                v-model="specificPages"
                label="Pages to extract (e.g., 1,3,5,7)"
                hint="Enter page numbers separated by commas"
                filled
                dark
                color="primary"
              />
            </div>

            <div v-if="extractMode === 'range'" class="range-input q-mt-md">
              <div class="range-row">
                <q-input
                  v-model.number="rangeStart"
                  label="From page"
                  type="number"
                  filled
                  dark
                  color="primary"
                  min="1"
                />
                <q-input
                  v-model.number="rangeEnd"
                  label="To page"
                  type="number"
                  filled
                  dark
                  color="primary"
                  min="1"
                />
              </div>
            </div>

            <div v-if="pdfMetadata" class="page-thumbnails q-mt-md">
              <div class="thumbnails-grid">
                <div
                  v-for="page in pdfMetadata.pageCount"
                  :key="page"
                  class="thumbnail"
                  :class="{ selected: isPageSelected(page) }"
                  @click="togglePageSelection(page)"
                >
                  <span>{{ page }}</span>
                </div>
              </div>
            </div>

            <div class="info-box q-mt-md">
              <q-icon name="info" color="info" />
              <span v-if="pdfMetadata">
                PDF has {{ pdfMetadata.pageCount }} pages. {{ selectedPagesCount }} selected for extraction.
              </span>
              <span v-else>
                Upload a PDF to select pages
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="extractedResult" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>Pages Extracted Successfully!</h3>
          <p>Extracted {{ selectedPagesCount }} page(s) into new PDF</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download Extracted PDF"
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
import { ref, computed } from 'vue'
import BaseToolPage from '@/components/tools/BaseToolPage.vue'
import { PDFService } from '@/services/pdf/pdfService'

const files = ref<File[]>([])
const extractMode = ref<'specific' | 'range' | 'all'>('specific')
const specificPages = ref('')
const rangeStart = ref(1)
const rangeEnd = ref(1)
const pdfMetadata = ref<{ pageCount: number } | null>(null)
const selectedPagesList = ref<Set<number>>(new Set())
const extractedResult = ref<ArrayBuffer | null>(null)
const error = ref<string | null>(null)

const selectedPagesCount = computed(() => selectedPagesList.value.size)

async function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
  selectedPagesList.value.clear()
  
  if (selectedFiles.length > 0) {
    try {
      const buffer = await selectedFiles[0].arrayBuffer()
      const metadata = await PDFService.getPDFMetadata(buffer)
      pdfMetadata.value = metadata
      rangeEnd.value = metadata.pageCount
    } catch (err) {
      console.error('Error getting PDF metadata:', err)
    }
  }
}

function isPageSelected(page: number): boolean {
  return selectedPagesList.value.has(page)
}

function togglePageSelection(page: number) {
  if (selectedPagesList.value.has(page)) {
    selectedPagesList.value.delete(page)
  } else {
    selectedPagesList.value.add(page)
  }
}

function parseSpecificPages(): number[] {
  return specificPages.value
    .split(',')
    .map(p => parseInt(p.trim()))
    .filter(n => !isNaN(n) && n > 0)
}

function parseRange(): number[] {
  const pages: number[] = []
  if (rangeStart.value && rangeEnd.value && rangeStart.value <= rangeEnd.value) {
    for (let i = rangeStart.value; i <= rangeEnd.value; i++) {
      pages.push(i)
    }
  }
  return pages
}

async function extractPages() {
  error.value = null
  extractedResult.value = null
  
  if (files.value.length === 0) {
    error.value = 'Please select a PDF file'
    return
  }

  try {
    let pagesToExtract: number[] = []
    
    if (extractMode.value === 'all') {
      if (!pdfMetadata.value) {
        error.value = 'Please upload a PDF first'
        return
      }
      pagesToExtract = Array.from({ length: pdfMetadata.value.pageCount }, (_, i) => i + 1)
    } else if (extractMode.value === 'specific') {
      pagesToExtract = parseSpecificPages()
      if (pagesToExtract.length === 0) {
        error.value = 'Please enter valid page numbers'
        return
      }
    } else {
      pagesToExtract = parseRange()
      if (pagesToExtract.length === 0) {
        error.value = 'Please enter a valid page range'
        return
      }
    }
    
    // Also include manually selected pages from thumbnails
    pagesToExtract = [...new Set([...pagesToExtract, ...Array.from(selectedPagesList.value)])]
    
    if (pagesToExtract.length === 0) {
      error.value = 'Please select at least one page to extract'
      return
    }

    const file = files.value[0]
    const buffer = await file.arrayBuffer()
    
    extractedResult.value = await PDFService.extractPages(buffer, pagesToExtract)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to extract pages'
  }
}

function downloadResult() {
  if (!extractedResult.value) return

  const blob = new Blob([extractedResult.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'extracted.pdf'
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

.extract-mode-selector {
  display: flex;
  justify-content: center;
}

.range-row {
  display: flex;
  gap: 12px;
}

.range-row > * {
  flex: 1;
}

.page-thumbnails {
  margin-top: 16px;
}

.thumbnails-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.thumbnail {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  color: #a0a0a0;
}

.thumbnail:hover {
  border-color: rgba(74, 158, 255, 0.5);
  background: rgba(74, 158, 255, 0.1);
}

.thumbnail.selected {
  border-color: #4a9eff;
  background: rgba(74, 158, 255, 0.2);
  color: #ffffff;
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
</style>
