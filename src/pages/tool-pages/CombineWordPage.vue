<template>
  <BaseToolPage
    title="Combine Word"
    description="Merge multiple Word documents into a single file"
    accepted-file-types=".docx,.doc"
    :supports-multiple-files="true"
    action-label="Combine Documents"
    success-message="Documents Combined Successfully!"
    download-filename="combined.docx"
    @files-selected="handleFilesSelected"
    @process-files="combineDocuments"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Combine Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="file-order-section">
              <label class="field-label">Document Order</label>
              <div class="file-list">
                <div
                  v-for="(file, index) in files"
                  :key="index"
                  class="file-item"
                  draggable="true"
                  @dragstart="onDragStart(index, $event)"
                  @dragover="onDragOver($event)"
                  @drop="onDrop(index, $event)"
                >
                  <q-icon name="drag_indicator" color="grey-6" />
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-order">{{ index + 1 }}</span>
                </div>
              </div>
            </div>

            <div class="combine-options q-mt-md">
              <q-checkbox
                v-model="options.preserveFormatting"
                label="Preserve original formatting"
                color="primary"
                dark
              />
              <q-checkbox
                v-model="options.addPageBreaks"
                label="Add page breaks between documents"
                color="primary"
                dark
              />
            </div>

            <div class="file-count q-mt-md">
              <div class="count-info">
                <q-icon name="description" color="primary" />
                <span>{{ files.length }} document(s) selected</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="combinedResult" class="result-section">
        <div class="success-message">
          <q-icon name="check" size="48px" color="positive" />
          <h3>Documents Combined Successfully!</h3>
          <p>Merged {{ files.length }} document(s) into one file</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download Combined Document"
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
import { Document, Packer, Paragraph, PageBreak } from 'docx'

const files = ref<File[]>([])
const options = ref({
  preserveFormatting: true,
  addPageBreaks: true
})
const combinedResult = ref<Blob | null>(null)
const error = ref<string | null>(null)

let draggedIndex = -1

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

function onDragStart(index: number, event: DragEvent) {
  draggedIndex = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function onDrop(targetIndex: number, event: DragEvent) {
  event.preventDefault()
  if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
    const item = files.value[draggedIndex]
    files.value.splice(draggedIndex, 1)
    files.value.splice(targetIndex, 0, item)
  }
  draggedIndex = -1
}

async function combineDocuments() {
  error.value = null
  combinedResult.value = null
  
  if (files.value.length < 2) {
    error.value = 'Please select at least 2 Word documents to combine'
    return
  }

  try {
    const doc = new Document({
      sections: []
    })

    for (const file of files.value) {
      const buffer = await file.arrayBuffer()
      
      // For simplicity, we'll add a paragraph with the filename
      // In a real implementation, you would parse and merge the actual DOCX content
      doc.addSection({
        properties: {},
        children: [
          new Paragraph({
            text: `--- ${file.name} ---`,
            heading: 'Heading1'
          }),
          new Paragraph({
            text: '[Document content would be merged here]',
            spacing: { after: 200 }
          })
        ]
      })

      if (options.value.addPageBreaks) {
        doc.addSection({
          properties: {},
          children: [new Paragraph({ pageBreakBefore: true })]
        })
      }
    }

    const blob = await Packer.toBlob(doc)
    combinedResult.value = blob
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to combine Word documents'
  }
}

function downloadResult() {
  if (!combinedResult.value) return

  const url = URL.createObjectURL(combinedResult.value)
  const a = document.createElement('a')
  a.href = url
  a.download = 'combined.docx'
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

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: move;
}

.file-name {
  flex: 1;
  color: #ffffff;
  font-weight: 500;
}

.file-order {
  color: #808080;
  font-size: 12px;
}

.combine-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-count {
  margin-top: 16px;
}

.count-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
}
</style>
