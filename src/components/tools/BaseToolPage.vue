<template>
  <q-page class="bg-dark">
    <div class="tool-page">
      <div class="tool-header">
        <h1 class="tool-title">{{ title }}</h1>
        <p class="tool-description">{{ description }}</p>
        <div v-if="longDescription" class="tool-long-description">
          {{ longDescription }}
        </div>
      </div>

      <div class="tool-content">
        <slot name="upload-section">
          <FileDropZone
            :accept="acceptedFileTypes"
            :multiple="supportsMultipleFiles"
            @files-selected="handleFilesSelected"
          />
        </slot>

        <slot name="preview-section">
          <div v-if="showPreview && files.length > 0" class="preview-section">
            <h3 class="section-title">Preview</h3>
            <component
              :is="previewComponent"
              v-if="previewComponent"
              :file="files[0]"
              :files="files"
            />
          </div>
        </slot>

        <slot name="settings-section">
          <div v-if="showSettings && files.length > 0" class="settings-section">
            <h3 class="section-title">Settings</h3>
            <slot name="settings"></slot>
          </div>
        </slot>

        <slot name="file-section">
          <div v-if="files.length > 0" class="file-section">
            <h3 class="section-title">
              Selected Files ({{ files.length }})
            </h3>
            
            <FileQueue
              :files="queuedFiles"
              :action-label="actionLabel"
              :action-color="actionColor"
              :show-actions="showFileActions"
              @remove-file="removeFile"
              @clear-all="clearFiles"
              @process-files="processFiles"
            />
          </div>
        </slot>

        <slot name="result-section">
          <div v-if="result" class="result-section">
            <div class="success-message">
              <q-icon name="check" size="48px" color="positive" />
              <h3>{{ successMessage }}</h3>
            </div>
            
            <ResultActions
              :result="result"
              :download-filename="downloadFilename"
              :show-preview="showResultPreview"
              @download="downloadResult"
              @preview="previewResult"
            />
          </div>
        </slot>

        <div v-if="error" class="error-section">
          <q-banner class="bg-negative text-white" dense>
            <template v-slot:avatar>
              <q-icon name="error_outline" />
            </template>
            {{ error }}
            <template v-slot:action>
              <q-btn flat color="white" @click="error = null">Dismiss</q-btn>
            </template>
          </q-banner>
        </div>

        <div v-if="processing" class="processing-section">
          <ProcessingStatus :progress="processingProgress" :message="processingMessage" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FileDropZone from '@/components/upload/FileDropZone.vue'
import FileQueue from '@/components/upload/FileQueue.vue'
import ProcessingStatus from '@/components/processing/ProcessingStatus.vue'
import ResultActions from '@/components/processing/ResultActions.vue'
import PDFPreview from '@/components/preview/PDFPreview.vue'
import ImagePreview from '@/components/preview/ImagePreview.vue'
import DocumentPreview from '@/components/preview/DocumentPreview.vue'

interface Props {
  title: string
  description: string
  longDescription?: string
  acceptedFileTypes: string[]
  supportsMultipleFiles?: boolean
  actionLabel?: string
  actionColor?: string
  successMessage?: string
  downloadFilename?: string
  showPreview?: boolean
  showSettings?: boolean
  showFileActions?: boolean
  showResultPreview?: boolean
  previewComponent?: 'pdf' | 'image' | 'document'
}

const props = withDefaults(defineProps<Props>(), {
  supportsMultipleFiles: false,
  actionLabel: 'Process',
  actionColor: 'primary',
  successMessage: 'Processing Complete!',
  downloadFilename: 'result.pdf',
  showPreview: true,
  showSettings: false,
  showFileActions: true,
  showResultPreview: true,
  previewComponent: undefined
})

const emit = defineEmits<{
  filesSelected: [files: File[]]
  processFiles: [files: File[]]
  removeFile: [index: number]
  clearFiles: []
  downloadResult: []
  previewResult: []
}>()

const files = ref<File[]>([])
const queuedFiles = ref<any[]>([])
const result = ref<ArrayBuffer | Blob | Uint8Array | null>(null)
const error = ref<string | null>(null)
const processing = ref(false)
const processingProgress = ref(0)
const processingMessage = ref('')

const previewComponentMap = {
  pdf: PDFPreview,
  image: ImagePreview,
  document: DocumentPreview
}

const computedPreviewComponent = computed(() => {
  return props.previewComponent ? previewComponentMap[props.previewComponent] : undefined
})

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
  queuedFiles.value = selectedFiles.map((file, index) => ({
    id: `file-${index}`,
    name: file.name,
    type: file.type,
    size: file.size,
    status: 'pending' as const
  }))
  emit('filesSelected', selectedFiles)
}

function removeFile(index: number) {
  queuedFiles.value.splice(index, 1)
  files.value.splice(index, 1)
  emit('removeFile', index)
}

function clearFiles() {
  queuedFiles.value = []
  files.value = []
  result.value = null
  error.value = null
  emit('clearFiles')
}

async function processFiles() {
  error.value = null
  result.value = null
  processing.value = true
  processingProgress.value = 0
  processingMessage.value = 'Processing...'

  try {
    queuedFiles.value.forEach(file => {
      file.status = 'processing'
    })

    emit('processFiles', files.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Processing failed'
    queuedFiles.value.forEach(file => {
      file.status = 'error'
    })
  } finally {
    processing.value = false
  }
}

function downloadResult() {
  emit('downloadResult')
}

function previewResult() {
  emit('previewResult')
}

function setProcessingProgress(progress: number, message?: string) {
  processingProgress.value = progress
  if (message) processingMessage.value = message
}

function setResult(data: ArrayBuffer | Blob | Uint8Array) {
  result.value = data
  queuedFiles.value.forEach(file => {
    file.status = 'completed'
  })
}

function setError(message: string) {
  error.value = message
  queuedFiles.value.forEach(file => {
    file.status = 'error'
  })
}

defineExpose({
  files,
  queuedFiles,
  result,
  error,
  processing,
  processingProgress,
  processingMessage,
  setProcessingProgress,
  setResult,
  setError,
  clearFiles
})
</script>

<style scoped>
.tool-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
}

.tool-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.tool-title {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tool-description {
  font-size: 16px;
  color: #808080;
  margin-bottom: 8px;
  line-height: 1.5;
}

.tool-long-description {
  font-size: 14px;
  color: #606060;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

.tool-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.preview-section,
.settings-section,
.file-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16px;
}

.result-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 40px;
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid rgba(74, 222, 128, 0.2);
  border-radius: 12px;
}

.success-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.success-message h3 {
  font-size: 22px;
  font-weight: 600;
  color: #ffffff;
}

.error-section,
.processing-section {
  margin-top: 24px;
}
</style>
