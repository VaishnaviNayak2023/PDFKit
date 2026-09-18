<template>
  <BaseToolPage
    title="Repair PDF"
    description="Fix corrupted or damaged PDF files"
    accepted-file-types=".pdf"
    action-label="Repair PDF"
    success-message="PDF Repaired Successfully!"
    download-filename="repaired.pdf"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="repairPDF"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Repair Options</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="repair-info">
              <q-icon name="build" size="32px" color="warning" />
              <p>This tool attempts to repair corrupted PDF files by reconstructing the document structure.</p>
            </div>

            <div class="repair-options q-mt-md">
              <q-checkbox
                v-model="options.recoverObjects"
                label="Recover embedded objects"
                color="primary"
                dark
              />
              <q-checkbox
                v-model="options.recoverStreams"
                label="Recover content streams"
                color="primary"
                dark
              />
              <q-checkbox
                v-model="options.recoverMetadata"
                label="Recover document metadata"
                color="primary"
                dark
              />
            </div>

            <div class="warning-box q-mt-md">
              <q-icon name="warning" color="warning" />
              <span>Not all corrupted PDFs can be repaired. The success rate depends on the type and extent of damage.</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="repairedResult" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>PDF Repaired Successfully!</h3>
          <p v-if="repairReport">
            {{ repairReport }}
          </p>
        </div>
        
        <q-btn
          color="primary"
          label="Download Repaired PDF"
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
const options = ref({
  recoverObjects: true,
  recoverStreams: true,
  recoverMetadata: false
})
const repairedResult = ref<ArrayBuffer | null>(null)
const repairReport = ref<string>('')
const error = ref<string | null>(null)

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

async function repairPDF() {
  error.value = null
  repairedResult.value = null
  repairReport.value = ''
  
  if (files.value.length === 0) {
    error.value = 'Please select a PDF file'
    return
  }

  try {
    const file = files.value[0]
    const buffer = await file.arrayBuffer()
    
    // Try to load the PDF with different recovery options
    try {
      const pdf = await PDFService.loadPDFWithRecovery(buffer, options.value)
      repairedResult.value = await pdf.save()
      repairReport.value = 'PDF structure successfully reconstructed'
    } catch (initialError) {
      // Fallback: try to extract what we can
      console.warn('Initial repair failed, attempting fallback:', initialError)
      const fallbackResult = await PDFService.attemptFallbackRepair(buffer)
      repairedResult.value = fallbackResult.data
      repairReport.value = fallbackResult.report
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to repair PDF. The file may be too badly damaged.'
  }
}

function downloadResult() {
  if (!repairedResult.value) return

  const blob = new Blob([repairedResult.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'repaired.pdf'
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

.repair-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  padding: 20px;
  background: rgba(251, 191, 36, 0.1);
  border-radius: 8px;
  color: #a0a0a0;
}

.repair-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
