<template>
  <div class="document-preview">
    <div v-if="loading" class="loading-state">
      <q-spinner color="primary" size="48px" />
      <p class="loading-text">Loading document...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <q-icon name="error" size="48px" color="negative" />
      <p class="error-text">{{ error }}</p>
      <q-btn flat label="Retry" @click="loadDocument" />
    </div>

    <div v-else-if="!documentContent" class="empty-state">
      <q-icon name="description" size="48px" class="empty-icon" />
      <p class="empty-text">No document loaded</p>
    </div>

    <div v-else class="document-content">
      <div class="document-toolbar">
        <q-btn
          flat
          dense
          icon="zoom_in"
          @click="zoomIn"
        />
        <q-btn
          flat
          dense
          icon="zoom_out"
          @click="zoomOut"
        />
        <q-space />
        <span class="document-info">{{ documentInfo }}</span>
      </div>

      <div class="document-container" :style="containerStyle">
        <div class="document-page" :style="pageStyle">
          <div v-html="documentContent" class="document-html"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import mammoth from 'mammoth'

interface Props {
  documentData?: ArrayBuffer
  fileUrl?: string
  fileName?: string
  fileType?: string
}

const props = defineProps<Props>()

const loading = ref(true)
const error = ref<string | null>(null)
const documentContent = ref<string | null>(null)
const scale = ref(1.0)

const containerStyle = computed(() => ({
  fontSize: `${16 * scale.value}px`
}))

const pageStyle = computed(() => ({
  transform: `scale(${scale.value})`,
  transformOrigin: 'top left'
}))

const documentInfo = computed(() => {
  if (!props.fileName) return ''
  return props.fileName
})

async function loadDocument() {
  loading.value = true
  error.value = null

  try {
    if (!props.documentData) {
      throw new Error('No document data provided')
    }

    // Handle different document types
    if (props.fileType?.includes('word') || props.fileType?.includes('document')) {
      await loadWordDocument()
    } else if (props.fileType?.includes('text')) {
      await loadTextDocument()
    } else {
      throw new Error('Unsupported document type')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load document'
    console.error('Document loading error:', err)
  } finally {
    loading.value = false
  }
}

async function loadWordDocument() {
  if (!props.documentData) return

  const result = await mammoth.convertToHtml({ arrayBuffer: props.documentData })
  documentContent.value = result.value

  if (result.messages.length > 0) {
    console.warn('Document conversion messages:', result.messages)
  }
}

async function loadTextDocument() {
  if (!props.documentData) return

  const decoder = new TextDecoder('utf-8')
  const text = decoder.decode(props.documentData)
  documentContent.value = `<pre>${escapeHtml(text)}</pre>`
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function zoomIn() {
  scale.value = Math.min(scale.value + 0.1, 2.0)
}

function zoomOut() {
  scale.value = Math.max(scale.value - 0.1, 0.5)
}
</script>

<style scoped>
.document-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 32px;
}

.loading-text,
.error-text,
.empty-text {
  margin-top: 16px;
  color: #808080;
}

.empty-icon {
  color: #4a4a4a;
}

.document-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.document-toolbar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #0f0f0f;
  border-bottom: 1px solid #2a2a2a;
  gap: 8px;
}

.document-info {
  font-size: 12px;
  color: #808080;
  white-space: nowrap;
}

.document-container {
  flex: 1;
  overflow: auto;
  padding: 32px;
  background: #0a0a0a;
}

.document-page {
  background: white;
  color: black;
  min-height: 297mm;
  min-width: 210mm;
  padding: 25mm;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.document-html {
  line-height: 1.6;
}

.document-html :deep(pre) {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', monospace;
}
</style>
