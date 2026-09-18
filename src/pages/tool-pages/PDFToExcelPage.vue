<template>
  <BaseToolPage
    title="PDF to Excel"
    description="Extract tables from PDF to Excel spreadsheets"
    accepted-file-types=".pdf"
    action-label="Convert to Excel"
    success-message="Conversion Complete!"
    download-filename="converted.xlsx"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="convertToExcel"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Conversion Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="conversion-options">
              <q-checkbox
                v-model="conversionOptions.preserveFormatting"
                label="Preserve Table Formatting"
                color="primary"
                dark
              />
              <q-checkbox
                v-model="conversionOptions.multipleSheets"
                label="Create Sheet Per Page"
                color="primary"
                dark
              />
            </div>

            <div class="info-box q-mt-md">
              <q-icon name="info" color="info" />
              <span>Works best with PDFs that contain tabular data. Complex layouts may not convert perfectly.</span>
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
          <p>Your PDF has been converted to an Excel spreadsheet</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download Excel File"
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
import { pdfToExcel } from '@/services/conversion/conversionService'

const files = ref<File[]>([])
const conversionOptions = ref({
  preserveFormatting: true,
  multipleSheets: false
})
const convertedResult = ref<Blob | null>(null)
const error = ref<string | null>(null)

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

async function convertToExcel() {
  error.value = null
  convertedResult.value = null
  
  if (files.value.length === 0) {
    error.value = 'Please select a PDF file'
    return
  }

  try {
    const file = files.value[0]
    convertedResult.value = await pdfToExcel(file)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to convert PDF to Excel'
  }
}

function downloadResult() {
  if (!convertedResult.value) return

  const url = URL.createObjectURL(convertedResult.value)
  const a = document.createElement('a')
  a.href = url
  a.download = 'converted.xlsx'
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

.conversion-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 8px;
  color: #808080;
  font-size: 14px;
}
</style>
