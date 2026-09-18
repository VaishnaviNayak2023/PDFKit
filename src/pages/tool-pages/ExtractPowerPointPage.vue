<template>
  <BaseToolPage
    title="Extract PowerPoint"
    description="Extract slides, notes, and images from PowerPoint presentations"
    accepted-file-types=".pptx,.ppt"
    action-label="Extract Content"
    success-message="Content Extracted Successfully!"
    download-filename="extracted.zip"
    preview-component="document"
    @files-selected="handleFilesSelected"
    @process-files="extractContent"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Extraction Options</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="extraction-options">
              <q-checkbox
                v-model="options.extractSlides"
                label="Extract slides as images"
                color="primary"
                dark
              />
              <q-checkbox
                v-model="options.extractNotes"
                label="Extract speaker notes"
                color="primary"
                dark
              />
              <q-checkbox
                v-model="options.extractImages"
                label="Extract embedded images"
                color="primary"
                dark
              />
              <q-checkbox
                v-model="options.extractText"
                label="Extract text content"
                color="primary"
                dark
              />
            </div>

            <div class="image-format q-mt-md" v-if="options.extractSlides || options.extractImages">
              <label class="field-label">Image Format</label>
              <q-btn-toggle
                v-model="imageFormat"
                toggle-color="primary"
                :options="[
                  { label: 'PNG', value: 'png' },
                  { label: 'JPG', value: 'jpeg' }
                ]"
                spread
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="extractedResult" class="result-section">
        <div class="success-message">
          <q-icon name="check" size="48px" color="positive" />
          <h3>Content Extracted Successfully!</h3>
          <p>Extracted {{ extractedResult.count }} item(s)</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download Extracted Content"
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
  extractSlides: true,
  extractNotes: false,
  extractImages: false,
  extractText: true
})
const imageFormat = ref<'png' | 'jpeg'>('png')
const extractedResult = ref<{ count: number; blob: Blob } | null>(null)
const error = ref<string | null>(null)

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

async function extractContent() {
  error.value = null
  extractedResult.value = null
  
  if (files.value.length === 0) {
    error.value = 'Please select a PowerPoint file'
    return
  }

  try {
    const file = files.value[0]
    const buffer = await file.arrayBuffer()
    const zip = await JSZip.loadAsync(buffer)
    const outputZip = new JSZip()
    let count = 0

    // Extract text from slides
    if (options.value.extractText) {
      const slideFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'))
      for (const slideFile of slideFiles) {
        const content = await zip.file(slideFile)?.async('string')
        if (content) {
          // Simple text extraction - in production, use proper XML parsing
          const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
          outputZip.file(`slide-text/${slideFile.replace('.xml', '.txt')}`, text || 'No text found')
          count++
        }
      }
    }

    // Extract images
    if (options.value.extractImages) {
      const mediaFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/media/'))
      for (const mediaFile of mediaFiles) {
        const content = await zip.file(mediaFile)?.async('arraybuffer')
        if (content) {
          const ext = mediaFile.split('.').pop()
          outputZip.file(`images/${mediaFile.split('/').pop()}`, content)
          count++
        }
      }
    }

    // Extract notes
    if (options.value.extractNotes) {
      const notesFiles = Object.keys(zip.files).filter(name => name.includes('notes'))
      for (const notesFile of notesFiles) {
        const content = await zip.file(notesFile)?.async('string')
        if (content) {
          const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
          outputZip.file(`notes/${notesFile.replace('.xml', '.txt')}`, text || 'No notes found')
          count++
        }
      }
    }

    const zipBlob = await outputZip.generateAsync({ type: 'blob' })
    extractedResult.value = { count, blob: zipBlob }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to extract PowerPoint content'
  }
}

function downloadResult() {
  if (!extractedResult.value) return

  const url = URL.createObjectURL(extractedResult.value.blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'extracted-content.zip'
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

.extraction-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-format {
  margin-top: 16px;
}
</style>
