<template>
  <BaseToolPage
    title="Summarize PDF"
    description="Get intelligent summaries of long PDF documents"
    long-description="AI-powered PDF summarization. Upload any PDF and get a concise, accurate summary of its key points, main arguments, and important information."
    accepted-file-types=".pdf"
    action-label="Summarize"
    success-message="Summary Generated!"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="summarizePDF"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">AI Summary Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="ai-warning">
              <q-icon name="warning" color="warning" size="32px" />
              <p class="warning-text">
                <strong>AI Feature Notice:</strong> This feature requires an AI integration for document summarization. 
                The extracted text may be transmitted to an external AI service for processing.
              </p>
            </div>

            <q-separator class="q-my-md" />

            <div class="summary-options">
              <label class="field-label">Summary Length</label>
              <q-btn-toggle
                v-model="summaryLength"
                toggle-color="primary"
                :options="[
                  { label: 'Brief', value: 'brief' },
                  { label: 'Standard', value: 'standard' },
                  { label: 'Detailed', value: 'detailed' }
                ]"
                spread
              />
            </div>

            <div class="language-option q-mt-md">
              <label class="field-label">Summary Language</label>
              <q-select
                v-model="language"
                :options="languages"
                label="Select Language"
                filled
                dark
                color="primary"
                emit-value
                map-options
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
          <p>This feature requires integration with an AI service to generate intelligent summaries of PDF documents.</p>
          <p class="setup-info">To enable this feature:</p>
          <ol class="setup-steps">
            <li>Sign up for an AI provider account (OpenAI, Anthropic, etc.)</li>
            <li>Get an API key</li>
            <li>Configure the API key in settings</li>
            <li>Upload PDFs to get AI-powered summaries</li>
          </ol>
        </div>
      </div>
    </template>
  </BaseToolPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseToolPage from '@/components/tools/BaseToolPage.vue'

const files = ref<File[]>([])
const summaryLength = ref('standard')
const language = ref('en')
const error = ref<string | null>(null)

const languages = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' }
]

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

function summarizePDF() {
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

.language-option {
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

.setup-info {
  color: #a0a0a0;
  font-weight: 600;
  margin-top: 8px;
}

.setup-steps {
  color: #808080;
  text-align: left;
  margin-top: 12px;
  padding-left: 20px;
}

.setup-steps li {
  margin-bottom: 8px;
}
</style>
