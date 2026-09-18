<template>
  <BaseToolPage
    title="Translate PDF"
    description="Translate PDF documents to any language with AI"
    long-description="AI-powered PDF translation. Upload any PDF and translate it to your desired language while preserving the original formatting and layout."
    accepted-file-types=".pdf"
    action-label="Translate PDF"
    success-message="Translation Complete!"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="translatePDF"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">AI Translation Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="ai-warning">
              <q-icon name="warning" color="warning" size="32px" />
              <p class="warning-text">
                <strong>AI Feature Notice:</strong> This feature requires an AI integration for document translation. 
                PDF content may be transmitted to an external AI service for processing.
              </p>
            </div>

            <q-separator class="q-my-md" />

            <div class="language-selector">
              <label class="field-label">Target Language</label>
              <q-select
                v-model="targetLanguage"
                :options="languages"
                label="Select Target Language"
                filled
                dark
                color="primary"
                emit-value
                map-options
              />
            </div>

            <div class="translation-options q-mt-md">
              <q-checkbox
                v-model="options.preserveFormatting"
                label="Preserve original formatting"
                color="primary"
                dark
              />
              <q-checkbox
                v-model="options.translateImages"
                label="Translate text in images (OCR)"
                color="primary"
                dark
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div class="result-section">
        <div class="demo-notice">
          <q-icon name="info" color="info" size="48px" />
          <h3>AI Integration Required</h3>
          <p>This feature requires integration with an AI service to translate PDF documents to other languages.</p>
        </div>
      </div>
    </template>
  </BaseToolPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseToolPage from '@/components/tools/BaseToolPage.vue'

const files = ref<File[]>([])
const targetLanguage = ref('es')
const options = ref({
  preserveFormatting: true,
  translateImages: false
})
const error = ref<string | null>(null)

const languages = [
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Italian', value: 'it' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Chinese (Simplified)', value: 'zh-CN' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'Arabic', value: 'ar' },
  { label: 'Hindi', value: 'hi' }
]

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

function translatePDF() {
  error.value = null
  if (files.value.length === 0) {
    error.value = 'Please select a PDF file'
    return
  }
  error.value = 'AI integration required for this feature'
}
</script>

<style scoped>
.settings-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ai-warning {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(251, 191, 36, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.warning-text {
  flex: 1;
  color: #fbbf24;
  font-size: 14px;
  line-height: 1.5;
}

.field-label {
  display: block;
  margin-bottom: 8px;
  color: #a0a0a0;
  font-size: 14px;
  font-weight: 500;
}

.translation-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.demo-notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
  text-align: center;
}

.demo-notice h3 {
  color: #ffffff;
  font-size: 24px;
}

.demo-notice p {
  color: #808080;
  max-width: 500px;
}
</style>
