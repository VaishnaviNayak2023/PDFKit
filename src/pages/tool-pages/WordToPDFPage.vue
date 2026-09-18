<template>
  <BaseToolPage
    title="Word to PDF"
    description="Convert Word DOCX files to PDF format"
    accepted-file-types=".docx,.doc"
    action-label="Convert to PDF"
    success-message="Conversion Complete!"
    download-filename="converted.pdf"
    @files-selected="handleFilesSelected"
    @process-files="convertToPDF"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Conversion Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="conversion-options">
              <q-checkbox
                v-model="conversionOptions.preserveFormatting"
                label="Preserve Original Formatting"
                color="primary"
                dark
              />
              <q-checkbox
                v-model="conversionOptions.embedFonts"
                label="Embed Fonts"
                color="primary"
                dark
              />
            </div>

            <div class="info-box q-mt-md">
              <q-icon name="info" color="info" />
              <span>Supports .docx and .doc file formats. Formatting is preserved as closely as possible.</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="convertedResult" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>Conversion Complete!</h3>
          <p>Your Word document has been converted to PDF</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download PDF"
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
import { wordToPDF } from '@/services/conversion/conversionService'

const files = ref<File[]>([])
const conversionOptions = ref({
  preserveFormatting: true,
  embedFonts: true
})
const convertedResult = ref<Uint8Array | null>(null)
const error = ref<string | null>(null)

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

async function convertToPDF() {
  error.value = null
  convertedResult.value = null
  
  if (files.value.length === 0) {
    error.value = 'Please select a Word file'
    return
  }

  try {
    const file = files.value[0]
    convertedResult.value = await wordToPDF(file)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to convert Word to PDF'
  }
}

function downloadResult() {
  if (!convertedResult.value) return

  const blob = new Blob([convertedResult.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'converted.pdf'
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

.conversion-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 8px;
  color: #808080;
  font-size: 14px;
}
</style>
