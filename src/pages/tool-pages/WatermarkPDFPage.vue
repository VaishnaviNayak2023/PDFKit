<template>
  <BaseToolPage
    title="Watermark PDF"
    description="Add text or image watermarks to your PDF"
    accepted-file-types=".pdf"
    action-label="Add Watermark"
    success-message="Watermark Added Successfully!"
    download-filename="watermarked.pdf"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="addWatermark"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Watermark Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="watermark-type-selector">
              <q-btn-toggle
                v-model="watermarkType"
                toggle-color="primary"
                :options="[
                  { label: 'Text Watermark', value: 'text' },
                  { label: 'Image Watermark', value: 'image' }
                ]"
                spread
              />
            </div>

            <div v-if="watermarkType === 'text'" class="text-watermark-options q-mt-md">
              <q-input
                v-model="textWatermark.text"
                label="Watermark Text"
                filled
                dark
                color="primary"
              />
              
              <div class="option-row q-mt-md">
                <q-input
                  v-model.number="textWatermark.fontSize"
                  label="Font Size"
                  type="number"
                  filled
                  dark
                  color="primary"
                  min="8"
                  max="200"
                />
                <q-input
                  v-model.number="textWatermark.opacity"
                  label="Opacity (0-1)"
                  type="number"
                  filled
                  dark
                  color="primary"
                  min="0"
                  max="1"
                  step="0.1"
                />
              </div>

              <div class="option-row q-mt-md">
                <q-input
                  v-model.number="textWatermark.rotation"
                  label="Rotation (degrees)"
                  type="number"
                  filled
                  dark
                  color="primary"
                  min="0"
                  max="360"
                />
                <q-select
                  v-model="textWatermark.position"
                  label="Position"
                  :options="positionOptions"
                  filled
                  dark
                  color="primary"
                />
              </div>
            </div>

            <div v-if="watermarkType === 'image'" class="image-watermark-options q-mt-md">
              <FileDropZone
                accept=".jpg,.jpeg,.png,.webp"
                :multiple="false"
                @files-selected="handleImageSelected"
              />
              
              <div v-if="imageFile" class="image-preview q-mt-md">
                <div class="image-info">
                  <span>{{ imageFile.name }}</span>
                  <q-btn flat icon="close" @click="clearImage" size="sm" color="negative" />
                </div>
              </div>

              <div class="option-row q-mt-md">
                <q-input
                  v-model.number="imageWatermark.opacity"
                  label="Opacity (0-1)"
                  type="number"
                  filled
                  dark
                  color="primary"
                  min="0"
                  max="1"
                  step="0.1"
                />
                <q-select
                  v-model="imageWatermark.position"
                  label="Position"
                  :options="positionOptions"
                  filled
                  dark
                  color="primary"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="watermarkedResult" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>Watermark Added Successfully!</h3>
        </div>
        
        <q-btn
          color="primary"
          label="Download Watermarked PDF"
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
import FileDropZone from '@/components/upload/FileDropZone.vue'
import { PDFService } from '@/services/pdf/pdfService'

const files = ref<File[]>([])
const watermarkType = ref<'text' | 'image'>('text')
const textWatermark = ref({
  text: 'CONFIDENTIAL',
  fontSize: 48,
  opacity: 0.3,
  rotation: 45,
  position: 'center'
})
const imageWatermark = ref({
  opacity: 0.5,
  position: 'center'
})
const imageFile = ref<File | null>(null)
const watermarkedResult = ref<ArrayBuffer | null>(null)
const error = ref<string | null>(null)

const positionOptions = [
  'center',
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
  'tile'
]

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

function handleImageSelected(selectedFiles: File[]) {
  if (selectedFiles.length > 0) {
    imageFile.value = selectedFiles[0]
  }
}

function clearImage() {
  imageFile.value = null
}

async function addWatermark() {
  error.value = null
  watermarkedResult.value = null
  
  if (files.value.length === 0) {
    error.value = 'Please select a PDF file'
    return
  }

  if (watermarkType.value === 'image' && !imageFile.value) {
    error.value = 'Please select an image for the watermark'
    return
  }

  if (watermarkType.value === 'text' && !textWatermark.value.text.trim()) {
    error.value = 'Please enter watermark text'
    return
  }

  try {
    const file = files.value[0]
    const buffer = await file.arrayBuffer()
    
    if (watermarkType.value === 'text') {
      watermarkedResult.value = await PDFService.addWatermark(buffer, {
        type: 'text',
        text: textWatermark.value.text,
        opacity: textWatermark.value.opacity,
        rotation: textWatermark.value.rotation,
        position: textWatermark.value.position as any
      })
    } else {
      const imageBuffer = await imageFile.value!.arrayBuffer()
      watermarkedResult.value = await PDFService.addWatermark(buffer, {
        type: 'image',
        imageData: imageBuffer,
        opacity: imageWatermark.value.opacity,
        position: imageWatermark.value.position as any
      })
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to add watermark'
  }
}

function downloadResult() {
  if (!watermarkedResult.value) return

  const blob = new Blob([watermarkedResult.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'watermarked.pdf'
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

.watermark-type-selector {
  display: flex;
  justify-content: center;
}

.option-row {
  display: flex;
  gap: 12px;
}

.option-row > * {
  flex: 1;
}

.image-preview {
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.image-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #ffffff;
}
</style>
