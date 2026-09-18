<template>
  <BaseToolPage
    title="PDF to PNG"
    description="Convert each PDF page to a PNG image"
    accepted-file-types=".pdf"
    action-label="Convert to PNG"
    success-message="Conversion Complete!"
    download-filename="page-1.png"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="convertToPNG"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Image Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="quality-selector">
              <label class="field-label">Image Quality</label>
              <q-slider
                v-model="imageQuality"
                :min="10"
                :max="100"
                :step="10"
                label
                label-always
                color="primary"
                dark
              />
            </div>

            <div class="resolution-selector q-mt-md">
              <label class="field-label">Resolution (DPI)</label>
              <q-btn-toggle
                v-model="dpi"
                toggle-color="primary"
                :options="[
                  { label: '72 DPI', value: 72 },
                  { label: '150 DPI', value: 150 },
                  { label: '300 DPI', value: 300 }
                ]"
                spread
              />
            </div>

            <div v-if="pdfMetadata" class="info-box q-mt-md">
              <q-icon name="info" color="info" />
              <span>PDF has {{ pdfMetadata.pageCount }} pages - will create {{ pdfMetadata.pageCount }} PNG file(s)</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="convertedImages.length > 0" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>Conversion Complete!</h3>
          <p>Created {{ convertedImages.length }} PNG image(s)</p>
        </div>
        
        <div class="image-preview-grid">
          <div v-for="(image, index) in convertedImages" :key="index" class="image-preview-item">
            <img :src="image" :alt="`Page ${index + 1}`" />
            <div class="image-actions">
              <q-btn
                flat
                dense
                label="Download"
                @click="downloadSingleImage(image, index)"
                color="primary"
                size="sm"
              />
            </div>
          </div>
        </div>
        
        <div class="download-actions">
          <q-btn
            color="primary"
            label="Download All as ZIP"
            @click="downloadAllAsZip"
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
import { pdfToImages } from '@/services/conversion/conversionService'
import { PDFService } from '@/services/pdf/pdfService'
import JSZip from 'jszip'

const files = ref<File[]>([])
const imageQuality = ref(92)
const dpi = ref(150)
const pdfMetadata = ref<{ pageCount: number } | null>(null)
const convertedImages = ref<string[]>([])
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

async function convertToPNG() {
  error.value = null
  convertedImages.value = []
  
  if (files.value.length === 0) {
    error.value = 'Please select a PDF file'
    return
  }

  try {
    const file = files.value[0]
    convertedImages.value = await pdfToImages(file, 'png', dpi.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to convert PDF to PNG'
  }
}

function downloadSingleImage(image: string, index: number) {
  const a = document.createElement('a')
  a.href = image
  a.download = `page-${index + 1}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

async function downloadAllAsZip() {
  if (convertedImages.value.length === 0) return

  try {
    const zip = new JSZip()
    
    convertedImages.value.forEach((image, index) => {
      const base64Data = image.split(',')[1]
      const binaryData = atob(base64Data)
      const bytes = new Uint8Array(binaryData.length)
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i)
      }
      zip.file(`page-${index + 1}.png`, bytes)
    })
    
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pdf-images.zip'
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

.field-label {
  display: block;
  margin-bottom: 8px;
  color: #a0a0a0;
  font-size: 14px;
  font-weight: 500;
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

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  max-height: 400px;
  overflow-y: auto;
}

.image-preview-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-preview-item img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.image-actions {
  display: flex;
  justify-content: center;
}

.download-actions {
  display: flex;
  justify-content: center;
}
</style>
