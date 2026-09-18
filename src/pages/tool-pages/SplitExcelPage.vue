<template>
  <BaseToolPage
    title="Split Excel"
    description="Split Excel workbooks into separate sheets or files"
    accepted-file-types=".xlsx,.xls,.csv"
    action-label="Split Workbook"
    success-message="Excel Split Successfully!"
    download-filename="split.zip"
    preview-component="document"
    @files-selected="handleFilesSelected"
    @process-files="splitExcel"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Split Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="split-mode-selector">
              <label class="field-label">Split Mode</label>
              <q-btn-toggle
                v-model="splitMode"
                toggle-color="primary"
                :options="[
                  { label: 'By Sheets', value: 'sheets' },
                  { label: 'By Rows', value: 'rows' },
                  { label: 'By Columns', value: 'columns' }
                ]"
                spread
              />
            </div>

            <div v-if="splitMode === 'rows'" class="split-params q-mt-md">
              <label class="field-label">Rows per File</label>
              <q-input
                v-model.number="rowsPerFile"
                type="number"
                filled
                dark
                color="primary"
                min="1"
              />
            </div>

            <div v-if="splitMode === 'columns'" class="split-params q-mt-md">
              <label class="field-label">Columns per File</label>
              <q-input
                v-model.number="columnsPerFile"
                type="number"
                filled
                dark
                color="primary"
                min="1"
              />
            </div>

            <div class="output-format q-mt-md">
              <label class="field-label">Output Format</label>
              <q-btn-toggle
                v-model="outputFormat"
                toggle-color="primary"
                :options="[
                  { label: 'XLSX', value: 'xlsx' },
                  { label: 'CSV', value: 'csv' }
                ]"
                spread
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="splitResult" class="result-section">
        <div class="success-message">
          <q-icon name="check" size="48px" color="positive" />
          <h3>Excel Split Successfully!</h3>
          <p>Created {{ splitResult.count }} file(s)</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download All Files"
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
import * as XLSX from 'xlsx'
import JSZip from 'jszip'

const files = ref<File[]>([])
const splitMode = ref<'sheets' | 'rows' | 'columns'>('sheets')
const rowsPerFile = ref(1000)
const columnsPerFile = ref(10)
const outputFormat = ref<'xlsx' | 'csv'>('xlsx')
const splitResult = ref<{ count: number; blob: Blob } | null>(null)
const error = ref<string | null>(null)

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

async function splitExcel() {
  error.value = null
  splitResult.value = null
  
  if (files.value.length === 0) {
    error.value = 'Please select an Excel file'
    return
  }

  try {
    const file = files.value[0]
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const zip = new JSZip()
    let count = 0

    if (splitMode.value === 'sheets') {
      workbook.SheetNames.forEach((sheetName, index) => {
        const worksheet = workbook.Sheets[sheetName]
        const newWorkbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(newWorkbook, worksheet, sheetName)
        
        const output = XLSX.write(newWorkbook, { 
          bookType: outputFormat.value,
          type: 'array'
        })
        
        const ext = outputFormat.value === 'csv' ? 'csv' : 'xlsx'
        zip.file(`sheet-${index + 1}.${ext}`, output)
        count++
      })
    } else if (splitMode.value === 'rows') {
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      for (let i = 0; i < jsonData.length; i += rowsPerFile.value) {
        const chunk = jsonData.slice(i, i + rowsPerFile.value)
        const newWorksheet = XLSX.utils.aoa_to_sheet(chunk)
        const newWorkbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Sheet1')
        
        const output = XLSX.write(newWorkbook, { 
          bookType: outputFormat.value,
          type: 'array'
        })
        
        const ext = outputFormat.value === 'csv' ? 'csv' : 'xlsx'
        zip.file(`chunk-${Math.floor(i / rowsPerFile.value) + 1}.${ext}`, output)
        count++
      }
    } else if (splitMode.value === 'columns') {
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      if (jsonData.length > 0) {
        const headers = jsonData[0]
        for (let i = 0; i < headers.length; i += columnsPerFile.value) {
          const chunkData = jsonData.map(row => row.slice(i, i + columnsPerFile.value))
          const newWorksheet = XLSX.utils.aoa_to_sheet(chunkData)
          const newWorkbook = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Sheet1')
          
          const output = XLSX.write(newWorkbook, { 
            bookType: outputFormat.value,
            type: 'array'
          })
          
          const ext = outputFormat.value === 'csv' ? 'csv' : 'xlsx'
          zip.file(`column-chunk-${Math.floor(i / columnsPerFile.value) + 1}.${ext}`, output)
          count++
        }
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    splitResult.value = { count, blob: zipBlob }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to split Excel file'
  }
}

function downloadResult() {
  if (!splitResult.value) return

  const url = URL.createObjectURL(splitResult.value.blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'split-excel.zip'
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

.field-label {
  display: block;
  margin-bottom: 8px;
  color: #a0a0a0;
  font-size: 14px;
  font-weight: 500;
}

.split-params {
  margin-top: 16px;
}
</style>
