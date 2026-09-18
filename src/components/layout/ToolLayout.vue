<template>
  <q-page class="tool-page bg-dark">
    <!-- Tool Header -->
    <div class="tool-header">
      <div class="tool-header-inner">
        <div class="tool-header-left">
          <router-link to="/tools" class="back-link">
            <q-icon name="arrow_back" size="18px" />
            <span>All Tools</span>
          </router-link>

          <div class="tool-identity">
            <div
              class="tool-icon-wrap"
              :style="{ backgroundColor: `${iconColor}20`, borderColor: `${iconColor}30` }"
            >
              <q-icon :name="icon" :style="{ color: iconColor }" size="24px" />
            </div>
            <div>
              <div class="tool-name">{{ name }}</div>
              <div class="tool-desc">{{ description }}</div>
            </div>
          </div>
        </div>

        <div class="tool-header-right">
          <q-chip
            v-if="category"
            dense
            outline
            :style="{ color: iconColor, borderColor: `${iconColor}40` }"
            class="category-chip"
          >
            {{ categoryLabel }}
          </q-chip>
          <privacy-badge />
        </div>
      </div>
    </div>

    <!-- Tool Content -->
    <div class="tool-content">
      <!-- Upload Zone (shown when no files loaded) -->
      <div v-if="!hasFiles && !isProcessing && !hasResult" class="upload-zone-wrap">
        <file-drop-zone
          :accept="accept"
          :multiple="multiple"
          :max-size-mb="maxSizeMB"
          @files-selected="handleFilesSelected"
        />
        <div v-if="$slots.hint" class="upload-hint">
          <slot name="hint" />
        </div>
      </div>

      <!-- File Queue + Options -->
      <div v-if="hasFiles && !isProcessing && !hasResult" class="tool-main">
        <div class="tool-main-left">
          <file-queue
            :files="processingFiles"
            @remove="removeFile"
            @clear="clearFiles"
            @add-more="triggerFileAdd"
          />
          <slot name="file-list-extra" />
        </div>

        <div v-if="$slots.options" class="tool-main-right">
          <q-card class="options-card" flat bordered>
            <q-card-section>
              <div class="options-title">
                <q-icon name="tune" size="16px" class="q-mr-xs" />
                Options
              </div>
              <slot name="options" />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Processing State -->
      <processing-status
        v-if="isProcessing"
        :progress="progress"
        :status-text="statusText"
        :can-cancel="canCancel"
        @cancel="$emit('cancel')"
      />

      <!-- Custom Preview Slot -->
      <div v-if="hasFiles && !isProcessing && !hasResult && $slots.preview" class="custom-preview">
        <slot name="preview" />
      </div>

      <!-- Result -->
      <div v-if="hasResult" class="result-wrap">
        <result-actions
          :results="results"
          :tool-name="name"
          @download="handleDownload"
          @save-to-vault="handleSaveToVault"
          @process-again="handleProcessAgain"
        />
        <slot name="result-extra" />
      </div>

      <!-- Process Button -->
      <div v-if="hasFiles && !isProcessing && !hasResult && showProcessButton" class="process-btn-wrap">
        <q-btn
          :label="processLabel"
          :icon="processIcon"
          color="indigo"
          size="md"
          unelevated
          class="process-btn"
          :loading="isProcessing"
          @click="$emit('process')"
        />
      </div>
    </div>

    <!-- Privacy Footer -->
    <div class="privacy-footer">
      <q-icon name="lock" size="14px" class="q-mr-xs" style="color: #10b981" />
      <span class="privacy-text">
        Your files are processed locally in your browser. Nothing is uploaded to any server.
      </span>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProcessingFile, ProcessingResult, ToolCategory } from '@/types'
import { getCategoryMeta } from '@/config/tools'
import FileDropZone from '@/components/upload/FileDropZone.vue'
import FileQueue from '@/components/upload/FileQueue.vue'
import ProcessingStatus from '@/components/processing/ProcessingStatus.vue'
import ResultActions from '@/components/processing/ResultActions.vue'
import PrivacyBadge from '@/components/common/PrivacyBadge.vue'

interface Props {
  name: string
  description: string
  icon: string
  iconColor?: string
  category?: ToolCategory
  accept?: string
  multiple?: boolean
  maxSizeMB?: number
  processingFiles?: ProcessingFile[]
  isProcessing?: boolean
  progress?: number
  statusText?: string
  canCancel?: boolean
  hasResult?: boolean
  results?: ProcessingResult[]
  processLabel?: string
  processIcon?: string
  showProcessButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: '#6366f1',
  multiple: false,
  maxSizeMB: 500,
  processingFiles: () => [],
  isProcessing: false,
  progress: 0,
  statusText: 'Processing...',
  canCancel: false,
  hasResult: false,
  results: () => [],
  processLabel: 'Process',
  processIcon: 'play_arrow',
  showProcessButton: true
})

const emit = defineEmits<{
  filesSelected: [files: File[]]
  removeFile: [id: string]
  clearFiles: []
  process: []
  cancel: []
  download: [result: ProcessingResult]
  saveToVault: [result: ProcessingResult]
  processAgain: []
}>()

const hasFiles = computed(() => props.processingFiles.length > 0)

const categoryLabel = computed(() => {
  if (!props.category) return ''
  return getCategoryMeta(props.category)?.label ?? props.category
})

function handleFilesSelected(files: File[]) {
  emit('filesSelected', files)
}

function removeFile(id: string) {
  emit('removeFile', id)
}

function clearFiles() {
  emit('clearFiles')
}

function triggerFileAdd() {
  // Trigger file input re-open (handled by parent via ref)
}

function handleDownload(result: ProcessingResult) {
  emit('download', result)
}

function handleSaveToVault(result: ProcessingResult) {
  emit('saveToVault', result)
}

function handleProcessAgain() {
  emit('processAgain')
}
</script>

<style scoped>
.tool-page {
  min-height: 100vh;
  background: #0a0a0a;
}

.tool-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.02);
  padding: 16px 24px;
}

.tool-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.tool-header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.15s;
  white-space: nowrap;
}

.back-link:hover { color: #d1d5db; }

.tool-identity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tool-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tool-name {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.2;
}

.tool-desc {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-chip {
  font-size: 11px;
  font-weight: 500;
}

.tool-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.upload-zone-wrap {
  max-width: 700px;
  margin: 0 auto;
}

.upload-hint {
  margin-top: 16px;
  text-align: center;
  color: #6b7280;
  font-size: 13px;
}

.tool-main {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: start;
}

.tool-main-left { flex: 1; min-width: 0; }

.tool-main-right {
  width: 280px;
  flex-shrink: 0;
}

.options-card {
  background: rgba(255, 255, 255, 0.04) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.options-title {
  font-size: 13px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.custom-preview { margin-top: 24px; }

.result-wrap { margin-top: 16px; }

.process-btn-wrap {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.process-btn {
  min-width: 180px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.privacy-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  margin-top: 40px;
}

.privacy-text {
  font-size: 12px;
  color: #4b5563;
}

@media (max-width: 768px) {
  .tool-main {
    grid-template-columns: 1fr;
  }

  .tool-main-right { width: 100%; }

  .tool-header {
    padding: 12px 16px;
  }

  .tool-content {
    padding: 20px 16px;
  }

  .tool-desc { display: none; }
}
</style>
