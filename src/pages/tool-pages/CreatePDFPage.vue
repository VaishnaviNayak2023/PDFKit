<template>
  <BaseToolPage
    title="Create PDF"
    description="Create a new PDF from images, text, or blank pages"
    accepted-file-types=".jpg,.jpeg,.png,.webp,.txt"
    :supports-multiple-files="true"
    action-label="Create PDF"
    success-message="PDF Created Successfully!"
    download-filename="created.pdf"
    @files-selected="handleFilesSelected"
    @process-files="createPDF"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">PDF Creation Options</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="creation-mode">
              <q-btn-toggle
                v-model="creationMode"
                toggle-color="primary"
                :options="[
                  { label: 'From Images', value: 'images' },
                  { label: 'From Text', value: 'text' },
                  { label: 'Blank PDF', value: 'blank' }
                ]"
                spread
              />
            </div>

            <div v-if="creationMode === 'text'" class="text-input q-mt-md">
              <q-input
                v-model="textContent"
                label="Text Content"
                hint="Enter the text you want to convert to PDF"
                type="textarea"
                filled
                dark
                color="primary"
                rows="6"
              />
            </div>

            <div v-if="creationMode === 'blank'" class="blank-options q-mt-md">
              <div class="option-row">
                <q-input
                  v-model.number="blankOptions.pageCount"
                  label="Number of Pages"
                  type="number"
                  filled
                  dark
                  color="primary"
                  min="1"
                  max="100"
                />
              </div>
              <div class="option-row">
                <q-select
                  v-model="blankOptions.pageSize"
                  label="Page Size"
                  :options="pageSizes"
                  filled
                  dark
                  color="primary"
                />
              </div>
            </div>

            <div v-if="creationMode === 'images'" class="image-options q-mt-md">
              <div class="option-row">
                <q-select
                  v-model="imageOptions.pageSize"
                  label="Page Size"
                  :options="pageSizes"
                  filled
                  dark
                  color="primary"
                />
              </div>
              <div class="option-row">
                <q-checkbox
                  v-model="imageOptions.fitToPage"
                  label="Fit images to page"
                  color="primary"
                  dark
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="createdResult" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>PDF Created Successfully!</h3>
          <p v-if="creationMode === 'blank'">
            Created {{ blankOptions.pageCount }} blank page(s)
          </p>
          <p v-else-if="creationMode === 'text'">
            Created PDF from text content
          </p>
          <p v-else>
            Created PDF from {{ files.length }} image(s)
          </p>
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
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { imagesToPDF, textToPDF } from '@/services/conversion/conversionService'

const files = ref<File[]>([])
const creationMode = ref<'images' | 'text' | 'blank'>('images')
const textContent = ref('')
const blankOptions = ref({
  pageCount: 1,
  pageSize: 'A4'
})
const imageOptions = ref({
  pageSize: 'A4',
  fitToPage: true
})
const createdResult = ref<Uint8Array | null>(null)
const error = ref<string | null>(null)

const pageSizes = ['A4', 'Letter', 'Legal', 'A3', 'A5']

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

async function createPDF() {
  error.value = null
  createdResult.value = null
  
  try {
    if (creationMode.value === 'images') {
      if (files.value.length === 0) {
        error.value = 'Please select at least one image file'
        return
      }
      createdResult.value = await imagesToPDF(files.value)
    } else if (creationMode.value === 'text') {
      if (!textContent.value.trim()) {
        error.value = 'Please enter some text content'
        return
      }
      createdResult.value = await textToPDF(textContent.value)
    } else if (creationMode.value === 'blank') {
      createdResult.value = await createBlankPDF()
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create PDF'
  }
}

async function createBlankPDF(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const pageSizesMap: Record<string, [number, number]> = {
    'A4': [595.28, 841.89],
    'Letter': [612, 792],
    'Legal': [612, 1008],
    'A3': [841.89, 1190.55],
    'A5': [420.94, 595.28]
  }
  
  const pageSize = pageSizesMap[blankOptions.value.pageSize] || pageSizesMap['A4']
  
  for (let i = 0; i < blankOptions.value.pageCount; i++) {
    pdfDoc.addPage(pageSize)
  }
  
  return pdfDoc.save()
}

function downloadResult() {
  if (!createdResult.value) return

  const blob = new Blob([createdResult.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'created.pdf'
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

.creation-mode {
  display: flex;
  justify-content: center;
}

.option-row {
  margin-bottom: 16px;
}
</style>
