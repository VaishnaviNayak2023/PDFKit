<template>
  <BaseToolPage
    title="Image to PDF"
    description="Convert images (JPG, PNG, WebP) to PDF documents"
    accepted-file-types=".jpg,.jpeg,.png,.webp,.bmp"
    :supports-multiple-files="true"
    action-label="Convert to PDF"
    success-message="Conversion Complete!"
    download-filename="converted.pdf"
    preview-component="image"
    @files-selected="handleFilesSelected"
    @process-files="convertToPDF"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">PDF Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="page-size-selector">
              <label class="field-label">Page Size</label>
              <q-select
                v-model="pageSize"
                :options="pageSizes"
                label="Select Page Size"
                filled
                dark
                color="primary"
              />
            </div>

            <div class="orientation-selector q-mt-md">
              <label class="field-label">Orientation</label>
              <q-btn-toggle
                v-model="orientation"
                toggle-color="primary"
                :options="[
                  { label: 'Portrait', value: 'portrait' },
                  { label: 'Landscape', value: 'landscape' }
                ]"
                spread
              />
            </div>

            <div class="image-options q-mt-md">
              <q-checkbox
                v-model="imageOptions.fitToPage"
                label="Fit Images to Page"
                color="primary"
                dark
              />
              <q-checkbox
                v-model="imageOptions.maintainAspectRatio"
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
      <div v-if="convertedResult" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>Conversion Complete!</h3>
          <p>Created PDF from {{ files.length }} image(s)</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download PDF"
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
import { imagesToPDF } from '@/services/conversion/conversionService'

const files = ref<File[]>([])
const pageSize = ref('A4')
const orientation = ref<'portrait' | 'landscape'>('portrait')
const imageOptions = ref({
  fitToPage: true,
  maintainAspectRatio: true
})
const convertedResult = ref<Uint8Array | null>(null)
const error = ref<string | null>(null)

const pageSizes = ['A4', 'Letter', 'Legal', 'A3', 'A5']

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

async function convertToPDF() {
  error.value = null
  convertedResult.value = null
  
  if (files.value.length === 0) {
    error.value = 'Please select at least one image file'
    return
  }

  try {
    convertedResult.value = await imagesToPDF(files.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to convert images to PDF'
  }
}

function downloadResult() {
  if (!convertedResult.value) return

  const blob = new Blob([convertedResult.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'converted.pdf'
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

.field-label {
  display: block;
  margin-bottom: 8px;
  color: #a0a0a0;
  font-size: 14px;
  font-weight: 500;
}

.image-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
</style>
