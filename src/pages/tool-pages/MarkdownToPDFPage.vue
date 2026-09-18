<template>
  <BaseToolPage
    title="Markdown to PDF"
    description="Convert Markdown files to beautifully formatted PDFs"
    accepted-file-types=".md,.markdown"
    action-label="Convert to PDF"
    success-message="Conversion Complete!"
    download-filename="converted.pdf"
    @files-selected="handleFilesSelected"
    @process-files="convertToPDF"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Markdown Content</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div v-if="files.length > 0" class="file-info">
              <div class="file-item">
                <span class="label">Selected file:</span>
                <span class="value">{{ files[0].name }}</span>
              </div>
            </div>

            <div class="markdown-input q-mt-md">
              <q-input
                v-model="markdownContent"
                label="Markdown Content"
                type="textarea"
                filled
                dark
                color="primary"
                rows="12"
                hint="Edit the markdown content before conversion"
              />
            </div>

            <div class="formatting-options q-mt-md">
              <label class="field-label">Formatting Options</label>
              <q-checkbox
                v-model="formattingOptions.enableCodeHighlighting"
                label="Enable Code Highlighting"
                color="primary"
                dark
              />
              <q-checkbox
                v-model="formattingOptions.includeTableOfContents"
                label="Include Table of Contents"
                color="primary"
                dark
              />
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
          <p>Your Markdown has been converted to PDF</p>
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
import { markdownToPDF } from '@/services/conversion/conversionService'

const files = ref<File[]>([])
const markdownContent = ref('')
const formattingOptions = ref({
  enableCodeHighlighting: true,
  includeTableOfContents: false
})
const convertedResult = ref<Uint8Array | null>(null)
const error = ref<string | null>(null)

async function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
  
  if (selectedFiles.length > 0) {
    try {
      const content = await selectedFiles[0].text()
      markdownContent.value = content
    } catch (err) {
      console.error('Error reading markdown file:', err)
    }
  }
}

async function convertToPDF() {
  error.value = null
  convertedResult.value = null
  
  if (!markdownContent.value.trim()) {
    error.value = 'Please enter some markdown content'
    return
  }

  try {
    convertedResult.value = await markdownToPDF(markdownContent.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to convert Markdown to PDF'
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

.formatting-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
