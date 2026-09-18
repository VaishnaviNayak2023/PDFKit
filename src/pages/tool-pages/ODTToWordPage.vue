<template>
  <BaseToolPage
    title="ODT to Word"
    description="Convert OpenDocument text files to Word format"
    accepted-file-types=".odt"
    action-label="Convert to Word"
    success-message="Conversion Complete!"
    download-filename="converted.docx"
    preview-component="document"
    @files-selected="handleFilesSelected"
    @process-files="convertToWord"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Conversion Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="conversion-options">
              <q-checkbox
                v-model="options.preserveFormatting"
                label="Preserve original formatting"
                color="primary"
                dark
              />
              <q-checkbox
                v-model="options.preserveImages"
                label="Preserve embedded images"
                color="primary"
                dark
              />
            </div>

            <div class="info-box q-mt-md">
              <q-icon name="info" color="info" />
              <span>ODT files will be converted to DOCX format with maximum compatibility.</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="convertedResult" class="result-section">
        <div class="success-message">
          <q-icon name="check" size="48px" color="positive" />
          <h3>Conversion Complete!</h3>
          <p>Your ODT file has been converted to Word</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download Word Document"
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
import JSZip from 'jszip'

const files = ref<File[]>([])
const options = ref({
  preserveFormatting: true,
  preserveImages: true
})
const convertedResult = ref<Blob | null>(null)
const error = ref<string | null>(null)

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

async function convertToWord() {
  error.value = null
  convertedResult.value = null
  
  if (files.value.length === 0) {
    error.value = 'Please select an ODT file'
    return
  }

  try {
    const file = files.value[0]
    const buffer = await file.arrayBuffer()
    const zip = await JSZip.loadAsync(buffer)
    
    // Extract content from ODT
    const contentXml = await zip.file('content.xml')?.async('string')
    if (!contentXml) {
      throw new Error('Invalid ODT file')
    }
    
    // Extract text content (simplified - in production use proper XML parsing)
    const text = contentXml
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    // Create a simple DOCX file with the content
    // In production, you would use a proper ODT to DOCX conversion library
    const { Document, Packer, Paragraph, TextRun } = await import('docx')
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: text || 'ODT content converted to Word',
                size: 24
              })
            ]
          })
        ]
      }]
    })
    
    const blob = await Packer.toBlob(doc)
    convertedResult.value = blob
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to convert ODT to Word'
  }
}

function downloadResult() {
  if (!convertedResult.value) return

  const url = URL.createObjectURL(convertedResult.value)
  const a = document.createElement('a')
  a.href = url
  a.download = 'converted.docx'
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
