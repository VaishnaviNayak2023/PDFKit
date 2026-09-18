<template>
  <BaseToolPage
    title="Document Templates"
    description="Start from reusable Word, Excel, and letter templates"
    accepted-file-types=""
    action-label="Use Template"
    success-message="Template Ready!"
    download-filename="template.docx"
    @files-selected="handleFilesSelected"
    @process-files="useTemplate"
  >
    <template #upload-section>
      <div class="no-upload-needed">
        <q-icon name="folder_open" size="48px" color="primary" />
        <p>Select a template from the options below</p>
      </div>
    </template>

    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Select Template</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="template-categories">
              <q-btn-toggle
                v-model="selectedCategory"
                toggle-color="primary"
                :options="[
                  { label: 'Word', value: 'word' },
                  { label: 'Excel', value: 'excel' },
                  { label: 'Letters', value: 'letters' }
                ]"
                spread
              />
            </div>

            <div class="templates-grid q-mt-md">
              <div
                v-for="template in filteredTemplates"
                :key="template.id"
                class="template-card"
                :class="{ selected: selectedTemplate?.id === template.id }"
                @click="selectedTemplate = template"
              >
                <q-icon :name="template.icon" size="32px" :color="template.color" />
                <div class="template-info">
                  <span class="template-name">{{ template.name }}</span>
                  <span class="template-desc">{{ template.description }}</span>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="templateResult" class="result-section">
        <div class="success-message">
          <q-icon name="check" size="48px" color="positive" />
          <h3>Template Ready!</h3>
          <p>{{ selectedTemplate?.name }} template is ready to use</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download Template"
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
import { ref, computed } from 'vue'
import BaseToolPage from '@/components/tools/BaseToolPage.vue'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import * as XLSX from 'xlsx'

const selectedCategory = ref<'word' | 'excel' | 'letters'>('word')
const selectedTemplate = ref<any>(null)
const templateResult = ref<Blob | null>(null)
const error = ref<string | null>(null)

const templates = [
  // Word templates
  { id: 'resume', category: 'word', name: 'Resume', description: 'Professional resume template', icon: 'person', color: 'blue' },
  { id: 'cover-letter', category: 'word', name: 'Cover Letter', description: 'Job application cover letter', icon: 'mail', color: 'green' },
  { id: 'report', category: 'word', name: 'Report', description: 'Business report template', icon: 'assessment', color: 'purple' },
  // Excel templates
  { id: 'budget', category: 'excel', name: 'Budget', description: 'Monthly budget tracker', icon: 'account_balance_wallet', color: 'orange' },
  { id: 'invoice', category: 'excel', name: 'Invoice', description: 'Simple invoice template', icon: 'receipt', color: 'red' },
  { id: 'inventory', category: 'excel', name: 'Inventory', description: 'Inventory tracking sheet', icon: 'inventory', color: 'teal' },
  // Letter templates
  { id: 'formal', category: 'letters', name: 'Formal Letter', description: 'Professional formal letter', icon: 'description', color: 'indigo' },
  { id: 'complaint', category: 'letters', name: 'Complaint Letter', description: 'Product complaint template', icon: 'report_problem', color: 'pink' },
  { id: 'recommendation', category: 'letters', name: 'Recommendation', description: 'Character reference letter', icon: 'star', color: 'amber' }
]

const filteredTemplates = computed(() => {
  return templates.filter(t => t.category === selectedCategory.value)
})

function handleFilesSelected() {
  // No file selection needed
}

async function useTemplate() {
  error.value = null
  templateResult.value = null
  
  if (!selectedTemplate.value) {
    error.value = 'Please select a template'
    return
  }

  try {
    if (selectedTemplate.value.category === 'word' || selectedTemplate.value.category === 'letters') {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: selectedTemplate.value.name,
                  bold: true,
                  size: 32
                })
              ]
            }),
            new Paragraph({
              text: 'This is a template for ' + selectedTemplate.value.description,
              spacing: { after: 200 }
            }),
            new Paragraph({
              text: '[Your content goes here]',
              spacing: { after: 200 }
            })
          ]
        }]
      })
      
      const blob = await Packer.toBlob(doc)
      templateResult.value = blob
    } else if (selectedTemplate.value.category === 'excel') {
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.aoa_to_sheet([
        [selectedTemplate.value.name],
        [''],
        ['Category', 'Amount', 'Date'],
        ['Example 1', 100, new Date().toISOString().split('T')[0]],
        ['Example 2', 200, new Date().toISOString().split('T')[0]]
      ])
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
      
      const output = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      templateResult.value = new Blob([output], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create template'
  }
}

function downloadResult() {
  if (!templateResult.value) return

  const url = URL.createObjectURL(templateResult.value)
  const a = document.createElement('a')
  a.href = url
  const ext = selectedTemplate.value?.category === 'excel' ? 'xlsx' : 'docx'
  a.download = `${selectedTemplate.value.name.toLowerCase().replace(/\s+/g, '-')}.${ext}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.no-upload-needed {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
  color: #606060;
}

.settings-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.template-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.template-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(99, 102, 241, 0.3);
}

.template-card.selected {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.template-info {
  text-align: center;
}

.template-name {
  display: block;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 4px;
}

.template-desc {
  color: #808080;
  font-size: 12px;
}
</style>
