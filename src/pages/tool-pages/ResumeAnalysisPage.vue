<template>
  <BaseToolPage
    title="Resume Analysis"
    description="AI-powered resume review and improvement suggestions"
    long-description="Upload your resume and get AI-powered feedback on formatting, content, keywords, and suggestions for improvement to help you land your dream job."
    accepted-file-types=".pdf,.docx,.doc"
    action-label="Analyze Resume"
    success-message="Analysis Complete!"
    preview-component="document"
    @files-selected="handleFilesSelected"
    @process-files="analyzeResume"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">AI Analysis Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="ai-warning">
              <q-icon name="warning" color="warning" size="32px" />
              <p class="warning-text">
                <strong>AI Feature Notice:</strong> This feature requires an AI integration for resume analysis. 
                Your resume content may be transmitted to an external AI service for processing.
              </p>
            </div>

            <q-separator class="q-my-md" />

            <div class="analysis-options">
              <q-checkbox
                v-model="options.checkFormatting"
                label="Check formatting and structure"
                color="primary"
                dark
              />
              <q-checkbox
                v-model="options.checkKeywords"
                label="Analyze keywords and skills"
                color="primary"
                dark
              />
              <q-checkbox
                v-model="options.suggestImprovements"
                label="Provide improvement suggestions"
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
          <p>This feature requires integration with an AI service to analyze resumes and provide feedback.</p>
        </div>
      </div>
    </template>
  </BaseToolPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseToolPage from '@/components/tools/BaseToolPage.vue'

const files = ref<File[]>([])
const options = ref({
  checkFormatting: true,
  checkKeywords: true,
  suggestImprovements: true
})
const error = ref<string | null>(null)

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

function analyzeResume() {
  error.value = null
  if (files.value.length === 0) {
    error.value = 'Please select a resume file'
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

.analysis-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
