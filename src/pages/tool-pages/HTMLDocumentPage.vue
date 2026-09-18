<template>
  <BaseToolPage
    title="HTML Document"
    description="Preview and export HTML files as clean documents"
    accepted-file-types=".html,.htm"
    action-label="Export Document"
    success-message="Document Exported Successfully!"
    download-filename="document.pdf"
    @files-selected="handleFilesSelected"
    @process-files="exportDocument"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">HTML Content</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div v-if="files.length > 0" class="file-info">
              <div class="file-item">
                <span class="label">Selected file:</span>
                <span class="value">{{ files[0].name }}</span>
              </div>
            </div>

            <div class="html-input q-mt-md">
              <q-input
                v-model="htmlContent"
                label="HTML Content"
                type="textarea"
                filled
                dark
                color="primary"
                rows="12"
                hint="Edit the HTML content before export"
              />
            </div>

            <div class="export-options q-mt-md">
              <label class="field-label">Export Format</label>
              <q-btn-toggle
                v-model="exportFormat"
                toggle-color="primary"
                :options="[
                  { label: 'PDF', value: 'pdf' },
                  { label: 'Word', value: 'docx' },
                  { label: 'HTML', value: 'html' }
                ]"
                spread
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="exportedResult" class="result-section">
        <div class="success-message">
          <q-icon name="check" size="48px" color="positive" />
          <h3>Document Exported Successfully!</h3>
        </div>
        
        <q-btn
          color="primary"
          label="Download Document"
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
import { htmlToPDF } from '@/services/conversion/conversionService'

const files = ref<File[]>([])
const htmlContent = ref('')
const exportFormat = ref<'pdf' | 'docx' | 'html'>('pdf')
const exportedResult = ref<Blob | null>(null)
const error = ref<string | null>(null)

async function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
  
  if (selectedFiles.length > 0) {
    try {
      const content = await selectedFiles[0].text()
      htmlContent.value = content
    } catch (err) {
      console.error('Error reading HTML file:', err)
    }
  }
}

async function exportDocument() {
  error.value = null
  exportedResult.value = null
  
  if (!htmlContent.value.trim()) {
    error.value = 'Please enter some HTML content'
    return
  }

  try {
    if (exportFormat.value === 'pdf') {
      const pdfData = await htmlToPDF(htmlContent.value)
      exportedResult.value = new Blob([pdfData], { type: 'application/pdf' })
    } else if (exportFormat.value === 'html') {
      exportedResult.value = new Blob([htmlContent.value], { type: 'text/html' })
    } else {
      // For docx, we'll create a simple HTML-based document
      exportedResult.value = new Blob([htmlContent.value], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to export document'
  }
}

function downloadResult() {
  if (!exportedResult.value) return

  const url = URL.createObjectURL(exportedResult.value)
  const a = document.createElement('a')
  a.href = url
  const ext = exportFormat.value === 'pdf' ? 'pdf' : exportFormat.value === 'docx' ? 'docx' : 'html'
  a.download = `document.${ext}`
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
</style>
