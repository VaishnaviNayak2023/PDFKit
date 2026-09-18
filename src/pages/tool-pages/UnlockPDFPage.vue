<template>
  <BaseToolPage
    title="Unlock PDF"
    description="Remove password protection from PDF files"
    accepted-file-types=".pdf"
    action-label="Unlock PDF"
    success-message="PDF Unlocked Successfully!"
    download-filename="unlocked.pdf"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="unlockPDF"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Password Required</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="password-input">
              <q-input
                v-model="password"
                label="Enter PDF Password"
                :type="showPassword ? 'text' : 'password'"
                filled
                dark
                color="primary"
                @keyup.enter="unlockPDF"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>
            </div>

            <div class="info-box q-mt-md">
              <q-icon name="info" color="info" />
              <span>Enter the password that was used to protect this PDF</span>
            </div>

            <div class="warning-box q-mt-md">
              <q-icon name="warning" color="warning" />
              <span>Make sure you have the right to remove the password protection from this document</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="unlockedResult" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>PDF Unlocked Successfully!</h3>
          <p>Password protection has been removed</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download Unlocked PDF"
          @click="downloadResult"
          size="lg"
        >
          <template v-slot:after>
            <q-icon name="download" />
          </template>
        </q-btn>
      </div>
    </template>
  </BaseToolPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseToolPage from '@/components/tools/BaseToolPage.vue'
import { PDFService } from '@/services/pdf/pdfService'

const files = ref<File[]>([])
const password = ref('')
const showPassword = ref(false)
const unlockedResult = ref<ArrayBuffer | null>(null)
const error = ref<string | null>(null)

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

async function unlockPDF() {
  error.value = null
  unlockedResult.value = null
  
  if (files.value.length === 0) {
    error.value = 'Please select a PDF file'
    return
  }

  if (!password.value) {
    error.value = 'Please enter the PDF password'
    return
  }

  try {
    const file = files.value[0]
    const buffer = await file.arrayBuffer()
    
    unlockedResult.value = await PDFService.unlockPDF(buffer, password.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to unlock PDF. Please check the password and try again.'
  }
}

function downloadResult() {
  if (!unlockedResult.value) return

  const blob = new Blob([unlockedResult.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'unlocked.pdf'
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

.info-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 8px;
  color: #808080;
}

.warning-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: rgba(251, 191, 36, 0.1);
  border-radius: 8px;
  color: #fbbf24;
  font-size: 14px;
  line-height: 1.5;
}
</style>
