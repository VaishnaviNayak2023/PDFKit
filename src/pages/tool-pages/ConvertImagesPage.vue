<template>
  <BaseToolPage
    title="Convert Images"
    description="Convert images between JPG, PNG, WebP, GIF, and more"
    accepted-file-types=".jpg,.jpeg,.png,.webp,.gif,.bmp"
    :supports-multiple-files="true"
    action-label="Convert Images"
    success-message="Images Converted Successfully!"
    download-filename="converted.jpg"
    preview-component="image"
    @files-selected="handleFilesSelected"
    @process-files="convertImages"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Conversion Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="format-selector">
              <label class="field-label">Output Format</label>
              <q-btn-toggle
                v-model="outputFormat"
                toggle-color="primary"
                :options="[
                  { label: 'JPG', value: 'jpeg' },
                  { label: 'PNG', value: 'png' },
                  { label: 'WebP', value: 'webp' }
                ]"
                spread
              />
            </div>

            <div class="quality-selector q-mt-md">
              <label class="field-label">Quality</label>
              <q-slider
                v-model="conversionQuality"
                :min="10"
                :max="100"
                :step="5"
                label
                label-always
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
      <div v-if="convertedResults.length > 0" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>Images Converted Successfully!</h3>
          <p>Converted {{ convertedResults.length }} image(s) to {{ outputFormat.toUpperCase() }}</p>
        </div>
        
        <div class="results-list">
          <div v-for="(result, index) in convertedResults" :key="index" class="result-item">
            <div class="result-info">
              <span class="filename">{{ files[index]?.name || `Image ${index + 1}` }}</span>
              <span class="size-info">{{ formatFileSize(result.size) }}</span>
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
import { convertImageFormat, formatFileSize } from '@/services/image/imageService'
import JSZip from 'jszip'

const files = ref<File[]>([])
const outputFormat = ref<'jpeg' | 'png' | 'webp'>('jpeg')
const conversionQuality = ref(92)
const convertedResults = ref<Blob[]>([])
const error = ref<string | null>(null)

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

async function convertImages() {
  error.value = null
  convertedResults.value = []
  
  if (files.value.length === 0) {
    error.value = 'Please select at least one image file'
    return
  }

  try {
    const results = await Promise.all(files.value.map(async (file) => {
      return await convertImageFormat(file, {
        format: outputFormat.value,
        quality: conversionQuality.value / 100
      })
    }))
    
    convertedResults.value = results
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to convert images'
  }
}

function downloadSingle(result: Blob, index: number) {
  const url = URL.createObjectURL(result)
  const a = document.createElement('a')
  a.href = url
  const ext = outputFormat.value === 'jpeg' ? 'jpg' : outputFormat.value
  a.download = `converted-${index + 1}.${ext}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function downloadAllAsZip() {
  if (convertedResults.value.length === 0) return

  try {
    const zip = new JSZip()
    const ext = outputFormat.value === 'jpeg' ? 'jpg' : outputFormat.value
    
    convertedResults.value.forEach((result, index) => {
      zip.file(`converted-${index + 1}.${ext}`, result)
    })
    
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'converted-images.zip'
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
