<template>
  <BaseToolPage
    title="TXT to PDF"
    description="Convert plain text files to PDF documents"
    accepted-file-types=".txt"
    action-label="Convert to PDF"
    success-message="Conversion Complete!"
    download-filename="converted.pdf"
    @files-selected="handleFilesSelected"
    @process-files="convertToPDF"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Text Content</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div v-if="files.length > 0" class="file-info">
              <div class="file-item">
                <span class="label">Selected file:</span>
                <span class="value">{{ files[0].name }}</span>
              </div>
            </div>

            <div class="text-input q-mt-md">
              <q-input
                v-model="textContent"
                label="Text Content"
                type="textarea"
                filled
                dark
                color="primary"
                rows="12"
                hint="Edit the text content before conversion"
              />
            </div>

            <div class="formatting-options q-mt-md">
              <label class="field-label">Page Settings</label>
              <div class="option-row">
                <q-select
                  v-model="pageSettings.pageSize"
                  label="Page Size"
                  :options="pageSizes"
                  filled
                  dark
                  color="primary"
                />
                <q-input
                  v-model.number="pageSettings.fontSize"
                  label="Font Size"
                  type="number"
                  filled
                  dark
                  color="primary"
                  min="8"
                  max="24"
                />
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
          <p>Your text file has been converted to PDF</p>
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
import { textToPDF } from '@/services/conversion/conversionService'

const files = ref<File[]>([])
const textContent = ref('')
const pageSettings = ref({
  pageSize: 'A4',
  fontSize: 11
})
const convertedResult = ref<Uint8Array | null>(null)
const error = ref<string | null>(null)

const pageSizes = ['A4', 'Letter', 'Legal']

async function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
  
  if (selectedFiles.length > 0) {
    try {
      const content = await selectedFiles[0].text()
      textContent.value = content
    } catch (err) {
      console.error('Error reading text file:', err)
    }
  }
}

async function convertToPDF() {
  error.value = null
  convertedResult.value = null
  
  if (!textContent.value.trim()) {
    error.value = 'Please enter some text content'
    return
  }

  try {
    convertedResult.value = await textToPDF(textContent.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to convert text to PDF'
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

.file-info {
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 16px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-item .label {
  color: #808080;
  font-weight: 500;
}

.file-item .value {
  color: #ffffff;
  font-weight: 600;
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
</style>
