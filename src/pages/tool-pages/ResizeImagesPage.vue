<template>
  <BaseToolPage
    title="Resize Images"
    description="Resize images to any dimension while preserving aspect ratio"
    accepted-file-types=".jpg,.jpeg,.png,.webp"
    :supports-multiple-files="true"
    action-label="Resize Images"
    success-message="Images Resized Successfully!"
    download-filename="resized.jpg"
    preview-component="image"
    @files-selected="handleFilesSelected"
    @process-files="resizeImages"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Resize Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="resize-mode-selector">
              <label class="field-label">Resize Mode</label>
              <q-btn-toggle
                v-model="resizeMode"
                toggle-color="primary"
                :options="[
                  { label: 'Percentage', value: 'percentage' },
                  { label: 'Dimensions', value: 'dimensions' },
                  { label: 'Max Dimension', value: 'max' }
                ]"
                spread
              />
            </div>

            <div v-if="resizeMode === 'percentage'" class="percentage-input q-mt-md">
              <label class="field-label">Scale Percentage</label>
              <q-slider
                v-model="scalePercentage"
                :min="10"
                :max="200"
                :step="5"
                label
                label-always
                color="primary"
                dark
              />
            </div>

            <div v-if="resizeMode === 'dimensions'" class="dimensions-input q-mt-md">
              <div class="option-row">
                <q-input
                  v-model.number="dimensions.width"
                  label="Width (px)"
                  type="number"
                  filled
                  dark
                  color="primary"
                  min="1"
                />
                <q-input
                  v-model.number="dimensions.height"
                  label="Height (px)"
                  type="number"
                  filled
                  dark
                  color="primary"
                  min="1"
                />
              </div>
            </div>

            <div v-if="resizeMode === 'max'" class="max-dimension-input q-mt-md">
              <q-input
                v-model.number="maxDimension"
                label="Max Dimension (px)"
                type="number"
                filled
                dark
                color="primary"
                min="1"
              />
            </div>

            <div class="aspect-ratio-option q-mt-md">
              <q-checkbox
                v-model="maintainAspectRatio"
                label="Maintain Aspect Ratio"
                color="primary"
                dark
              />
            </div>

            <div class="file-count q-mt-md">
              <div class="count-info">
                <q-icon name="image" color="primary" />
                <span>{{ files.length }} image(s) selected</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="resizedResults.length > 0" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>Images Resized Successfully!</h3>
          <p>Processed {{ resizedResults.length }} image(s)</p>
        </div>
        
        <div class="results-list">
          <div v-for="(result, index) in resizedResults" :key="index" class="result-item">
            <div class="result-info">
              <span class="filename">{{ files[index]?.name || `Image ${index + 1}` }}</span>
              <span class="size-info">{{ result.width }}x{{ result.height }}px</span>
            </div>
            <q-btn
              flat
              dense
              label="Download"
              @click="downloadSingle(result, index)"
              color="primary"
              size="sm"
            />
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
import { resizeImage, getImageDimensions } from '@/services/image/imageService'
import JSZip from 'jszip'

const files = ref<File[]>([])
const resizeMode = ref<'percentage' | 'dimensions' | 'max'>('percentage')
const scalePercentage = ref(100)
const dimensions = ref({ width: 800, height: 600 })
const maxDimension = ref(1920)
const maintainAspectRatio = ref(true)
const resizedResults = ref<{ blob: Blob; width: number; height: number }[]>([])
const error = ref<string | null>(null)

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

async function resizeImages() {
  error.value = null
  resizedResults.value = []
  
  if (files.value.length === 0) {
    error.value = 'Please select at least one image file'
    return
  }

  try {
    const results = await Promise.all(files.value.map(async (file) => {
      let options: any = { keepAspectRatio: maintainAspectRatio.value }
      
      if (resizeMode.value === 'percentage') {
        const originalDims = await getImageDimensions(file)
        options.width = Math.round(originalDims.width * (scalePercentage.value / 100))
        options.height = Math.round(originalDims.height * (scalePercentage.value / 100))
      } else if (resizeMode.value === 'dimensions') {
        options.width = dimensions.value.width
        options.height = dimensions.value.height
      } else if (resizeMode.value === 'max') {
        const originalDims = await getImageDimensions(file)
        const scale = maxDimension.value / Math.max(originalDims.width, originalDims.height)
        options.width = Math.round(originalDims.width * scale)
        options.height = Math.round(originalDims.height * scale)
      }
      
      const blob = await resizeImage(file, options)
      const newDims = await getImageDimensions(blob)
      
      return {
        blob,
        width: newDims.width,
        height: newDims.height
      }
    }))
    
    resizedResults.value = results
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to resize images'
  }
}

function downloadSingle(result: { blob: Blob }, index: number) {
  const url = URL.createObjectURL(result.blob)
  const a = document.createElement('a')
  a.href = url
  const ext = files.value[index]?.name.split('.').pop() || 'jpg'
  a.download = `resized-${index + 1}.${ext}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function downloadAllAsZip() {
  if (resizedResults.value.length === 0) return

  try {
    const zip = new JSZip()
    
    resizedResults.value.forEach((result, index) => {
      const ext = files.value[index]?.name.split('.').pop() || 'jpg'
      zip.file(`resized-${index + 1}.${ext}`, result.blob)
    })
    
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resized-images.zip'
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

.option-row {
  display: flex;
  gap: 12px;
}

.option-row > * {
  flex: 1;
}

.aspect-ratio-option {
  margin-top: 16px;
}

.file-count {
  margin-top: 16px;
}

.count-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  max-height: 300px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filename {
  color: #ffffff;
  font-weight: 600;
}

.size-info {
  color: #808080;
  font-size: 13px;
}

.download-actions {
  display: flex;
  justify-content: center;
}
</style>
