<template>
  <BaseToolPage
    title="Flashcard Generator"
    description="Create study flashcards from your PDF documents"
    long-description="AI-powered flashcard generation. Upload your study materials, notes, or textbooks and automatically generate flashcards for effective learning."
    accepted-file-types=".pdf,.docx,.txt"
    action-label="Generate Flashcards"
    success-message="Flashcards Generated!"
    preview-component="document"
    @files-selected="handleFilesSelected"
    @process-files="generateFlashcards"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">AI Flashcard Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="ai-warning">
              <q-icon name="warning" color="warning" size="32px" />
              <p class="warning-text">
                <strong>AI Feature Notice:</strong> This feature requires an AI integration for flashcard generation. 
                Document content may be transmitted to an external AI service for processing.
              </p>
            </div>

            <q-separator class="q-my-md" />

            <div class="flashcard-options">
              <label class="field-label">Card Count</label>
              <q-slider
                v-model="cardCount"
                :min="5"
                :max="50"
                :step="5"
                label
                label-always
                color="primary"
                dark
              />
            </div>

            <div class="format-option q-mt-md">
              <label class="field-label">Output Format</label>
              <q-btn-toggle
                v-model="outputFormat"
                toggle-color="primary"
                :options="[
                  { label: 'Anki', value: 'anki' },
                  { label: 'CSV', value: 'csv' },
                  { label: 'PDF', value: 'pdf' }
                ]"
                spread
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
          <p>This feature requires integration with an AI service to generate study flashcards from your documents.</p>
        </div>
      </div>
    </template>
  </BaseToolPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseToolPage from '@/components/tools/BaseToolPage.vue'

const files = ref<File[]>([])
const cardCount = ref(20)
const outputFormat = ref('anki')
const error = ref<string | null>(null)

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

function generateFlashcards() {
  error.value = null
  if (files.value.length === 0) {
    error.value = 'Please select a document file'
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

.format-option {
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
