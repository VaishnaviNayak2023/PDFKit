<template>
  <BaseToolPage
    title="Chat with PDF"
    description="Ask questions and get answers from your PDF documents"
    long-description="AI-powered chat interface for PDF documents. Upload a PDF and ask questions about its content. The AI will analyze the document and provide accurate answers."
    accepted-file-types=".pdf"
    action-label="Start Chat"
    success-message="Chat Ready!"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="startChat"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">AI Chat Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="ai-warning">
              <q-icon name="warning" color="warning" size="32px" />
              <p class="warning-text">
                <strong>AI Feature Notice:</strong> This feature requires an AI integration for document analysis. 
                The extracted text may be transmitted to an external AI service for processing.
              </p>
            </div>

            <q-separator class="q-my-md" />

            <div class="ai-options">
              <label class="field-label">AI Provider</label>
              <q-select
                v-model="aiProvider"
                :options="aiProviders"
                label="Select AI Provider"
                filled
                dark
                color="primary"
                emit-value
                map-options
                hint="Choose an AI provider for document analysis"
              />
            </div>

            <div class="api-key-section q-mt-md">
              <q-input
                v-model="apiKey"
                label="API Key (optional)"
                filled
                dark
                color="primary"
                type="password"
                hint="Enter your API key for the selected provider"
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
          <p>This feature requires integration with an AI service (OpenAI, Anthropic, etc.) to analyze PDF content and answer questions.</p>
          <p class="setup-info">To enable this feature:</p>
          <ol class="setup-steps">
            <li>Sign up for an AI provider account</li>
            <li>Get an API key</li>
            <li>Configure the API key in settings</li>
            <li>The chat interface will analyze your PDF and answer questions</li>
          </ol>
          <q-btn
            flat
            label="Download PDF (Direct)"
            @click="downloadPDF"
            color="primary"
            class="q-mt-md"
          />
        </div>
      </div>
    </template>
  </BaseToolPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseToolPage from '@/components/tools/BaseToolPage.vue'

const files = ref<File[]>([])
const aiProvider = ref('openai')
const apiKey = ref('')
const error = ref<string | null>(null)

const aiProviders = [
  { label: 'OpenAI (GPT-4)', value: 'openai' },
  { label: 'Anthropic (Claude)', value: 'anthropic' },
  { label: 'Google (Gemini)', value: 'google' }
]

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

function startChat() {
  error.value = null
  
  if (files.value.length === 0) {
    error.value = 'Please select a PDF file'
    return
  }

  // This is a placeholder - actual implementation would:
  // 1. Extract text from PDF
  // 2. Send to AI API with user questions
  // 3. Display chat interface
  error.value = 'AI integration required for this feature'
}

function downloadPDF() {
  if (files.value.length === 0) return

  const url = URL.createObjectURL(files.value[0])
  const a = document.createElement('a')
  a.href = url
  a.download = files.value[0].name
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

.api-key-section {
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
