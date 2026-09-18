<template>
  <div class="pdf-preview">
    <div v-if="loading" class="loading-state">
      <q-spinner color="primary" size="48px" />
      <p class="loading-text">Loading PDF...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <q-icon name="error" size="48px" color="negative" />
      <p class="error-text">{{ error }}</p>
      <q-btn flat label="Retry" @click="loadPDF" />
    </div>

    <div v-else-if="!pdfDocument" class="empty-state">
      <q-icon name="picture_as_pdf" size="48px" class="empty-icon" />
      <p class="empty-text">No PDF loaded</p>
    </div>

    <div v-else class="pdf-content">
      <div class="pdf-toolbar">
        <q-btn
          flat
          dense
          icon="chevron_left"
          :disabled="currentPage <= 1"
          @click="previousPage"
        />
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <q-btn
          flat
          dense
          icon="chevron_right"
          :disabled="currentPage >= totalPages"
          @click="nextPage"
        />
        <q-space />
        <q-btn
          flat
          dense
          :icon="zoomInIcon"
          @click="zoomIn"
        />
        <q-btn
          flat
          dense
          :icon="zoomOutIcon"
          @click="zoomOut"
        />
        <q-btn
          flat
          dense
          icon="fit_screen"
          @click="fitToWidth"
        />
      </div>

      <div class="pdf-canvas-container" ref="canvasContainer">
        <canvas ref="pdfCanvas" class="pdf-canvas"></canvas>
      </div>

      <div class="pdf-thumbnails">
        <div
          v-for="page in totalPages"
          :key="page"
          class="thumbnail"
          :class="{ active: page === currentPage }"
          @click="goToPage(page)"
        >
          <canvas :ref="el => { if (el) thumbnailRefs[page] = el as HTMLCanvasElement }"></canvas>
          <span class="thumbnail-number">{{ page }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'

interface Props {
  pdfData?: ArrayBuffer
  fileUrl?: string
}

const props = defineProps<Props>()

const loading = ref(true)
const error = ref<string | null>(null)
const pdfDocument = ref<any>(null)
const currentPage = ref(1)
const totalPages = ref(0)
const scale = ref(1.0)
const pdfCanvas = ref<HTMLCanvasElement | null>(null)
const canvasContainer = ref<HTMLDivElement | null>(null)
const thumbnailRefs = ref<Record<number, HTMLCanvasElement>>({})

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

async function loadPDF() {
  loading.value = true
  error.value = null

  try {
    let loadingTask: any

    if (props.pdfData) {
      loadingTask = pdfjsLib.getDocument({ data: props.pdfData })
    } else if (props.fileUrl) {
      loadingTask = pdfjsLib.getDocument(props.fileUrl)
    } else {
      throw new Error('No PDF data or URL provided')
    }

    pdfDocument.value = await loadingTask.promise
    totalPages.value = pdfDocument.value.numPages
    currentPage.value = 1
    await renderPage(currentPage.value)
    await renderThumbnails()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load PDF'
    console.error('PDF loading error:', err)
  } finally {
    loading.value = false
  }
}

async function renderPage(pageNum: number) {
  if (!pdfDocument.value || !pdfCanvas.value) return

  const page = await pdfDocument.value.getPage(pageNum)
  const viewport = page.getViewport({ scale: scale.value })

  const canvas = pdfCanvas.value
  const context = canvas.getContext('2d')
  if (!context) return

  canvas.height = viewport.height
  canvas.width = viewport.width

  const renderContext = {
    canvasContext: context,
    viewport: viewport
  }

  await page.render(renderContext).promise
}

async function renderThumbnails() {
  if (!pdfDocument.value) return

  for (let i = 1; i <= totalPages.value; i++) {
    const page = await pdfDocument.value.getPage(i)
    const viewport = page.getViewport({ scale: 0.2 })

    const canvas = thumbnailRefs.value[i]
    if (!canvas) continue

    const context = canvas.getContext('2d')
    if (!context) continue

    canvas.height = viewport.height
    canvas.width = viewport.width

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    }

    await page.render(renderContext).promise
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    renderPage(currentPage.value)
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    renderPage(currentPage.value)
  }
}

function goToPage(page: number) {
  currentPage.value = page
  renderPage(page)
}

function zoomIn() {
  scale.value = Math.min(scale.value + 0.25, 3.0)
  renderPage(currentPage.value)
}

function zoomOut() {
  scale.value = Math.max(scale.value - 0.25, 0.5)
  renderPage(currentPage.value)
}

function fitToWidth() {
  if (!canvasContainer.value || !pdfDocument.value) return

  const containerWidth = canvasContainer.value.clientWidth - 32
  const page = pdfDocument.value.getPage(currentPage.value)
  const viewport = page.getViewport({ scale: 1.0 })
  
  scale.value = containerWidth / viewport.width
  renderPage(currentPage.value)
}

const zoomInIcon = ref('zoom_in')
const zoomOutIcon = ref('zoom_out')

watch(() => [props.pdfData, props.fileUrl], () => {
  loadPDF()
}, { immediate: true })

onMounted(() => {
  loadPDF()
})
</script>

<style scoped>
.pdf-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 32px;
}

.loading-text,
.error-text,
.empty-text {
  margin-top: 16px;
  color: #808080;
}

.empty-icon {
  color: #4a4a4a;
}

.pdf-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.pdf-toolbar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #0f0f0f;
  border-bottom: 1px solid #2a2a2a;
  gap: 8px;
}

.page-info {
  font-size: 14px;
  color: #b0b0b0;
  white-space: nowrap;
}

.pdf-canvas-container {
  flex: 1;
  overflow: auto;
  display: flex;
  justify-content: center;
  padding: 16px;
  background: #0a0a0a;
}

.pdf-canvas {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.pdf-thumbnails {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #0f0f0f;
  border-top: 1px solid #2a2a2a;
  overflow-x: auto;
}

.thumbnail {
  position: relative;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.thumbnail.active {
  border-color: #4a9eff;
}

.thumbnail canvas {
  display: block;
}

.thumbnail-number {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}
</style>
