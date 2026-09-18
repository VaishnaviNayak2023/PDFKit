<template>
  <BaseToolPage
    title="Markdown Document"
    description="Edit and export Markdown files for publishing"
    accepted-file-types=".md,.markdown"
    action-label="Export Document"
    success-message="Document Exported Successfully!"
    download-filename="document.pdf"
    @files-selected="handleFilesSelected"
    @process-files="exportDocument"
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
                hint="Edit the markdown content before export"
              />
            </div>

            <div class="export-options q-mt-md">
              <label class="field-label">Export Format</label>
              <q-btn-toggle
                v-model="exportFormat"
                toggle-color="primary"
                :options="[
                  { label: 'PDF', value: 'pdf' },
                  { label: 'HTML', value: 'html' },
                  { label: 'Markdown', value: 'md' }
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
import { markdownToPDF } from '@/services/conversion/conversionService'

const files = ref<File[]>([])
const markdownContent = ref('')
const exportFormat = ref<'pdf' | 'html' | 'md'>('pdf')
const exportedResult = ref<Blob | null>(null)
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

async function exportDocument() {
  error.value = null
  exportedResult.value = null
  
  if (!markdownContent.value.trim()) {
    error.value = 'Please enter some markdown content'
    return
  }

  try {
    if (exportFormat.value === 'pdf') {
      const pdfData = await markdownToPDF(markdownContent.value)
      exportedResult.value = new Blob([pdfData], { type: 'application/pdf' })
    } else if (exportFormat.value === 'md') {
      exportedResult.value = new Blob([markdownContent.value], { type: 'text/markdown' })
    } else {
      // Simple markdown to HTML conversion
      const html = markdownToHTML(markdownContent.value)
      exportedResult.value = new Blob([html], { type: 'text/html' })
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to export document'
  }
}

function markdownToHTML(markdown: string): string {
  // Simple markdown to HTML conversion
  let html = markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/`(.*)`/gim, '<code>$1</code>')
    .replace(/\n/gim, '<br>')
  
  return `<!DOCTYPE html><html><head><title>Document</title></head><body>${html}</body></html>`
}

function downloadResult() {
  if (!exportedResult.value) return

  const url = URL.createObjectURL(exportedResult.value)
  const a = document.createElement('a')
  a.href = url
  const ext = exportFormat.value === 'pdf' ? 'pdf' : exportFormat.value === 'html' ? 'html' : 'md'
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
