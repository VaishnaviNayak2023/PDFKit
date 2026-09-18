<template>
  <div
    class="drop-zone"
    :class="{
      'drop-zone--active': isDragging,
      'drop-zone--has-error': hasError
    }"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
    @click="triggerInput"
  >
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      class="hidden-input"
      @change="onInputChange"
    />

    <div class="drop-zone-inner">
      <div class="drop-icon-wrap" :class="{ 'drop-icon-wrap--active': isDragging }">
        <q-icon
          :name="isDragging ? 'file_download' : 'upload_file'"
          size="40px"
          :style="{ color: isDragging ? '#6366f1' : '#4b5563' }"
        />
      </div>

      <div class="drop-title">
        <span v-if="isDragging">Drop files here</span>
        <span v-else>
          <span class="drop-action">Click to upload</span>
          or drag & drop
        </span>
      </div>

      <div class="drop-meta">
        <span v-if="acceptLabel">{{ acceptLabel }}</span>
        <span v-if="acceptLabel && maxSizeMB"><q-icon name="circle" size="4px" class="q-mx-xs" /></span>
        <span v-if="maxSizeMB">Max {{ maxSizeMB }} MB per file</span>
      </div>

      <div v-if="multiple" class="drop-multiple-hint">
        <q-icon name="library_add" size="12px" class="q-mr-xs" />
        Multiple files supported
      </div>
    </div>

    <div v-if="hasError" class="drop-error">
      <q-icon name="error_outline" size="14px" class="q-mr-xs" />
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  accept?: string
  multiple?: boolean
  maxSizeMB?: number
}

const props = withDefaults(defineProps<Props>(), {
  accept: '*/*',
  multiple: false,
  maxSizeMB: 500
})

const emit = defineEmits<{
  filesSelected: [files: File[]]
}>()

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const hasError = ref(false)
const errorMessage = ref('')

const acceptLabel = computed(() => {
  if (!props.accept || props.accept === '*/*') return 'All files supported'
  return props.accept
    .split(',')
    .map(ext => ext.trim().replace('.', '').toUpperCase())
    .join(', ')
})

function triggerInput() {
  fileInput.value?.click()
}

function onDragOver() {
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files ?? [])
  validateAndEmit(files)
}

function onInputChange(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  validateAndEmit(files)
  // Reset input so same file can be selected again
  if (fileInput.value) fileInput.value.value = ''
}

function validateAndEmit(files: File[]) {
  hasError.value = false
  errorMessage.value = ''

  if (!files.length) return

  // Filter by accept
  const accepted = files.filter(file => isAccepted(file))
  if (accepted.length < files.length) {
    hasError.value = true
    errorMessage.value = `${files.length - accepted.length} file(s) have unsupported format`
  }

  // Check size
  const maxBytes = props.maxSizeMB * 1024 * 1024
  const tooBig = accepted.filter(f => f.size > maxBytes)
  if (tooBig.length > 0) {
    hasError.value = true
    errorMessage.value = `${tooBig[0].name} exceeds the ${props.maxSizeMB} MB limit`
    return
  }

  if (accepted.length > 0) {
    emit('filesSelected', props.multiple ? accepted : [accepted[0]])
  }
}

function isAccepted(file: File): boolean {
  if (!props.accept || props.accept === '*/*') return true
  const accepts = props.accept.split(',').map(a => a.trim().toLowerCase())
  return accepts.some(a => {
    if (a.startsWith('.')) return file.name.toLowerCase().endsWith(a)
    if (a.endsWith('/*')) return file.type.startsWith(a.replace('/*', '/'))
    return file.type === a
  })
}
</script>

<style scoped>
.drop-zone {
  border: 2px dashed rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  padding: 48px 24px;
  cursor: pointer;
  transition: all 0.25s ease;
  text-align: center;
  position: relative;
  user-select: none;
}

.drop-zone:hover {
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(99, 102, 241, 0.06);
}

.drop-zone--active {
  border-color: #6366f1 !important;
  background: rgba(99, 102, 241, 0.1) !important;
  transform: scale(1.02);
}

.drop-zone--has-error {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.05);
}

.hidden-input {
  display: none;
}

.drop-zone-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.drop-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s;
  margin-bottom: 8px;
}

.drop-icon-wrap--active {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.4);
}

.drop-title {
  font-size: 16px;
  font-weight: 500;
  color: #d1d5db;
}

.drop-action {
  color: #818cf8;
  font-weight: 600;
}

.drop-meta {
  font-size: 12px;
  color: #4b5563;
}

.drop-multiple-hint {
  font-size: 11px;
  color: #374151;
  display: flex;
  align-items: center;
}

.drop-error {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #ef4444;
  display: flex;
  align-items: center;
  white-space: nowrap;
}
</style>
