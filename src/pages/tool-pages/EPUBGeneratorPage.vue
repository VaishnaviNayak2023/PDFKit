<template>
  <BaseToolPage
    title="EPUB Generator"
    description="Create EPUB ebooks from text, Markdown, or HTML files"
    accepted-file-types=".txt,.md,.html"
    action-label="Generate EPUB"
    success-message="EPUB Generated Successfully!"
    download-filename="generated.epub"
    @files-selected="handleFilesSelected"
    @process-files="generateEPUB"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">EPUB Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="metadata-input">
              <q-input
                v-model="epubMetadata.title"
                label="Book Title"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              
              <q-input
                v-model="epubMetadata.author"
                label="Author"
                filled
                dark
                color="primary"
                class="q-mb-md"
              />
              
              <q-input
                v-model="epubMetadata.description"
                label="Description"
                type="textarea"
                filled
                dark
                color="primary"
                rows="3"
                class="q-mb-md"
              />
            </div>

            <div v-if="files.length > 0" class="content-input q-mt-md">
              <label class="field-label">Content</label>
              <q-input
                v-model="contentText"
                type="textarea"
                label="Book Content"
                filled
                dark
                color="primary"
                rows="12"
                hint="Edit the content before generating EPUB"
              />
            </div>

            <div class="formatting-options q-mt-md">
              <label class="field-label">EPUB Options</label>
              <q-checkbox
                v-model="epubOptions.includeTableOfContents"
                label="Include Table of Contents"
                color="primary"
                dark
              />
              <q-checkbox
                v-model="epubOptions.enableChapters"
                label="Enable Chapter Detection"
                color="primary"
                dark
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="generatedResult" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>EPUB Generated Successfully!</h3>
          <p>Your ebook is ready for download</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download EPUB"
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
import { EPub } from 'epub'

const files = ref<File[]>([])
const epubMetadata = ref({
  title: 'My Ebook',
  author: 'Unknown Author',
  description: ''
})
const epubOptions = ref({
  includeTableOfContents: true,
  enableChapters: true
})
const contentText = ref('')
const generatedResult = ref<Blob | null>(null)
const error = ref<string | null>(null)

async function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
  
  if (selectedFiles.length > 0) {
    try {
      const content = await selectedFiles[0].text()
      contentText.value = content
      
      // Try to extract title from first line
      const lines = content.split('\n')
      if (lines.length > 0 && lines[0].trim()) {
        epubMetadata.value.title = lines[0].trim().substring(0, 100)
      }
    } catch (err) {
      console.error('Error reading file:', err)
    }
  }
}

async function generateEPUB() {
  error.value = null
  generatedResult.value = null
  
  if (!contentText.value.trim()) {
    error.value = 'Please enter some content for the ebook'
    return
  }

  try {
    const epub = new EPub()
    
    epub.metadata.title = epubMetadata.value.title
    epub.metadata.author = epubMetadata.value.author
    epub.metadata.description = epubMetadata.value.description
    
    // Add content as chapters
    const chapters = epubOptions.value.enableChapters 
      ? contentText.value.split(/\n\n+/).filter(c => c.trim())
      : [contentText.value]
    
    chapters.forEach((chapter, index) => {
      const chapterContent = chapter.trim()
      const title = chapterContent.split('\n')[0].substring(0, 50) || `Chapter ${index + 1}`
      const content = chapterContent.replace(/^[^\n]+\n/, '').trim()
      
      epub.addChapter(title, content, `chapter-${index + 1}.xhtml`)
    })
    
    if (epubOptions.value.includeTableOfContents) {
      epub.generateTOC()
    }
    
    const epubBuffer = await epub.generateAsync({ type: 'blob' })
    generatedResult.value = epubBuffer
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to generate EPUB'
  }
}

function downloadResult() {
  if (!generatedResult.value) return

  const url = URL.createObjectURL(generatedResult.value)
  const a = document.createElement('a')
  a.href = url
  a.download = `${epubMetadata.value.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.epub`
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

.formatting-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
