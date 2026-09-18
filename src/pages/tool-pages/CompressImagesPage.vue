<template>
  <BaseToolPage
    title="Compress Images"
    description="Reduce image file size without losing quality"
    accepted-file-types=".jpg,.jpeg,.png,.webp"
    :supports-multiple-files="true"
    action-label="Compress Images"
    success-message="Images Compressed Successfully!"
    download-filename="compressed.jpg"
    preview-component="image"
    @files-selected="handleFilesSelected"
    @process-files="compressImages"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Compression Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="quality-selector">
              <label class="field-label">Compression Quality</label>
              <q-slider
                v-model="compressionQuality"
                :min="10"
                :max="100"
                :step="5"
                label
                label-always
                color="primary"
                dark
              />
              <div class="quality-description">
                <span v-if="compressionQuality > 80">High quality, larger file</span>
                <span v-else-if="compressionQuality > 50">Balanced quality and size</span>
                <span v-else>Maximum compression, smaller file</span>
              </div>
            </div>

            <div class="format-selector q-mt-md">
              <label class="field-label">Output Format</label>
              <q-btn-toggle
                v-model="outputFormat"
                toggle-color="primary"
                :options="[
                  { label: 'Keep Original', value: 'original' },
                  { label: 'JPG', value: 'jpeg' },
                  { label: 'PNG', value: 'png' },
                  { label: 'WebP', value: 'webp' }
                ]"
                spread
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
      <div v-if="compressedResults.length > 0" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>Images Compressed Successfully!</h3>
          <p>Processed {{ compressedResults.length }} image(s)</p>
        </div>
        
        <div class="compression-summary">
          <div class="summary-item">
            <span class="label">Total Original:</span>
            <span class="value">{{ formatFileSize(totalOriginalSize) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Total Compressed:</span>
            <span class="value">{{ formatFileSize(totalCompressedSize) }}</span>
          </div>
          <div class="summary-item highlight">
            <span class="label">Total Saved:</span>
            <span class="value">{{ calculateTotalSavings() }}</span>
          </div>
        </div>

        <div class="results-list">
          <div v-for="(result, index) in compressedResults" :key="index" class="result-item">
            <div class="result-info">
              <span class="filename">{{ files[index]?.name || `Image ${index + 1}` }}</span>
              <span class="size-info">
                {{ formatFileSize(result.originalSize) }} <q-icon name="arrow_forward" size="16px" /> {{ formatFileSize(result.compressedSize) }}
                ({{ calculateSavings(result.originalSize, result.compressedSize) }})
              </span>
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
import { ref, computed } from 'vue'
import BaseToolPage from '@/components/tools/BaseToolPage.vue'
import { compressImage, formatFileSize, getCompressionRatio } from '@/services/image/imageService'
import JSZip from 'jszip'

const files = ref<File[]>([])
const compressionQuality = ref(75)
const outputFormat = ref<'original' | 'jpeg' | 'png' | 'webp'>('original')
const compressedResults = ref<{ blob: Blob; originalSize: number; compressedSize: number }[]>([])
const error = ref<string | null>(null)

const totalOriginalSize = computed(() => compressedResults.value.reduce((sum, r) => sum + r.originalSize, 0))
const totalCompressedSize = computed(() => compressedResults.value.reduce((sum, r) => sum + r.compressedSize, 0))

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

async function compressImages() {
  error.value = null
  compressedResults.value = []
  
  if (files.value.length === 0) {
    error.value = 'Please select at least one image file'
    return
  }

  try {
    const results = await Promise.all(files.value.map(async (file) => {
      const originalSize = file.size
      const quality = compressionQuality.value / 100
      const blob = await compressImage(file, quality)
      
      return {
        blob,
        originalSize,
        compressedSize: blob.size
      }
    }))
    
    compressedResults.value = results
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to compress images'
  }
}

function calculateSavings(original: number, compressed: number): string {
  return getCompressionRatio(original, compressed)
}

function calculateTotalSavings(): string {
  return getCompressionRatio(totalOriginalSize.value, totalCompressedSize.value)
}

function downloadSingle(result: { blob: Blob }, index: number) {
  const url = URL.createObjectURL(result.blob)
  const a = document.createElement('a')
  a.href = url
  const ext = outputFormat.value === 'original' ? files.value[index]?.name.split('.').pop() : outputFormat.value
  a.download = `compressed-${index + 1}.${ext === 'jpeg' ? 'jpg' : ext}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function downloadAllAsZip() {
  if (compressedResults.value.length === 0) return

  try {
    const zip = new JSZip()
    
    compressedResults.value.forEach((result, index) => {
      const ext = outputFormat.value === 'original' ? files.value[index]?.name.split('.').pop() : outputFormat.value
      const filename = `compressed-${index + 1}.${ext === 'jpeg' ? 'jpg' : ext}`
      zip.file(filename, result.blob)
    })
    
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'compressed-images.zip'
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

.quality-description {
  text-align: center;
  color: #808080;
  font-size: 13px;
  margin-top: 8px;
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

.compression-summary {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  justify-content: center;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  min-width: 120px;
}

.summary-item.highlight {
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.summary-item .label {
  font-size: 12px;
  color: #808080;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-item .value {
  font-size: 18px;
  font-weight: 600;
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
  color: #4ade80;
  font-size: 13px;
}

.download-actions {
  display: flex;
  justify-content: center;
}
</style>
