<template>
  <div class="file-queue">
    <div v-if="files.length === 0" class="empty-state">
      <q-icon name="folder_open" size="48px" class="empty-icon" />
      <p class="empty-text">No files selected</p>
    </div>

    <q-list v-else class="file-list">
      <q-item
        v-for="(file, index) in files"
        :key="file.id"
        class="file-item"
      >
        <q-item-section avatar>
          <q-icon :name="getFileIcon(file.type)" class="file-icon" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="file-name">{{ file.name }}</q-item-label>
          <q-item-label caption class="file-size">
            {{ formatFileSize(file.size) }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="file-actions">
            <q-btn
              v-if="file.status === 'pending'"
              flat
              dense
              round
              icon="close"
              @click="removeFile(index)"
            />
            <q-spinner
              v-else-if="file.status === 'processing'"
              color="primary"
              size="20px"
            />
            <q-icon
              v-else-if="file.status === 'completed'"
              name="check_circle"
              color="positive"
              size="20px"
            />
            <q-icon
              v-else-if="file.status === 'error'"
              name="error"
              color="negative"
              size="20px"
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <div v-if="files.length > 0" class="queue-actions">
      <q-btn
        flat
        label="Clear All"
        @click="clearAll"
      />
      <q-space />
      <q-btn
        :label="actionLabel"
        :color="actionColor"
        :disabled="!canProcess"
        @click="processFiles"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface QueuedFile {
  id: string
  name: string
  type: string
  size: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress?: number
  error?: string
}

interface Props {
  files: QueuedFile[]
  actionLabel?: string
  actionColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  actionLabel: 'Process',
  actionColor: 'primary'
})

const emit = defineEmits<{
  'remove-file': [index: number]
  'clear-all': []
  'process-files': []
}>()

const canProcess = computed(() => {
  return props.files.some(f => f.status === 'pending') &&
         !props.files.some(f => f.status === 'processing')
})

function removeFile(index: number) {
  emit('remove-file', index)
}

function clearAll() {
  emit('clear-all')
}

function processFiles() {
  emit('process-files')
}

function getFileIcon(type: string): string {
  if (type.includes('pdf')) return 'picture_as_pdf'
  if (type.includes('image')) return 'image'
  if (type.includes('word') || type.includes('document')) return 'description'
  if (type.includes('excel') || type.includes('spreadsheet')) return 'table_chart'
  if (type.includes('powerpoint') || type.includes('presentation')) return 'slideshow'
  return 'insert_drive_file'
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped>
.file-queue {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 16px;
}

.empty-state {
  text-align: center;
  padding: 32px;
}

.empty-icon {
  color: #4a4a4a;
  margin-bottom: 16px;
}

.empty-text {
  color: #606060;
  font-size: 14px;
}

.file-list {
  background: transparent;
}

.file-item {
  background: #0f0f0f;
  border-radius: 8px;
  margin-bottom: 8px;
  padding: 12px;
}

.file-icon {
  color: #4a9eff;
}

.file-name {
  color: #ffffff;
  font-weight: 500;
}

.file-size {
  color: #808080;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.queue-actions {
  display: flex;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #2a2a2a;
  margin-top: 16px;
}
</style>
