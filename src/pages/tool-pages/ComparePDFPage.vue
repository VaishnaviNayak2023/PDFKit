<template>
  <BaseToolPage
    title="Compare PDFs"
    description="Compare two PDF documents and highlight differences"
    accepted-file-types=".pdf"
    :supports-multiple-files="true"
    action-label="Compare PDFs"
    success-message="Comparison Complete!"
    download-filename="comparison.pdf"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="comparePDFs"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Comparison Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="comparison-mode">
              <q-btn-toggle
                v-model="comparisonMode"
                toggle-color="primary"
                :options="[
                  { label: 'Text Content', value: 'text' },
                  { label: 'Visual', value: 'visual' }
                ]"
                spread
              />
            </div>

            <div class="info-box q-mt-md">
              <q-icon name="info" color="info" />
              <span>Select exactly 2 PDF files to compare</span>
            </div>

            <div v-if="files.length === 2" class="file-comparison q-mt-md">
              <div class="file-item">
                <span class="file-label">File 1:</span>
                <span class="file-name">{{ files[0].name }}</span>
              </div>
              <div class="file-item">
                <span class="file-label">File 2:</span>
                <span class="file-name">{{ files[1].name }}</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="comparisonResult" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>Comparison Complete!</h3>
        </div>
        
        <div class="comparison-stats">
          <div class="stat-item">
            <span class="stat-label">Differences Found</span>
            <span class="stat-value">{{ comparisonResult.differences }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Similarity</span>
            <span class="stat-value">{{ comparisonResult.similarity }}%</span>
          </div>
        </div>

        <div v-if="comparisonResult.differences > 0" class="differences-list">
          <h4>Differences:</h4>
          <ul>
            <li v-for="(diff, index) in comparisonResult.details" :key="index">
              {{ diff }}
            </li>
          </ul>
        </div>

        <q-btn
          color="primary"
          label="Download Comparison Report"
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
const comparisonMode = ref<'text' | 'visual'>('text')
const comparisonResult = ref<{ differences: number; similarity: number; details: string[] } | null>(null)
const error = ref<string | null>(null)

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles.slice(0, 2) // Limit to 2 files
}

async function comparePDFs() {
  error.value = null
  comparisonResult.value = null
  
  if (files.value.length !== 2) {
    error.value = 'Please select exactly 2 PDF files to compare'
    return
  }

  try {
    const [file1, file2] = files.value
    const buffer1 = await file1.arrayBuffer()
    const buffer2 = await file2.arrayBuffer()
    
    if (comparisonMode.value === 'text') {
      const text1 = await PDFService.extractText(buffer1)
      const text2 = await PDFService.extractText(buffer2)
      
      const differences = calculateTextDifferences(text1, text2)
      const similarity = calculateSimilarity(text1, text2)
      
      comparisonResult.value = {
        differences: differences.count,
        similarity,
        details: differences.details
      }
    } else {
      // Visual comparison would require rendering pages to images and comparing
      // For now, we'll provide a text-based comparison
      const text1 = await PDFService.extractText(buffer1)
      const text2 = await PDFService.extractText(buffer2)
      
      const differences = calculateTextDifferences(text1, text2)
      const similarity = calculateSimilarity(text1, text2)
      
      comparisonResult.value = {
        differences: differences.count,
        similarity,
        details: ['Visual comparison not fully implemented - showing text differences', ...differences.details]
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to compare PDFs'
  }
}

function calculateTextDifferences(text1: string, text2: string): { count: number; details: string[] } {
  const lines1 = text1.split('\n')
  const lines2 = text2.split('\n')
  const details: string[] = []
  let count = 0
  
  const maxLines = Math.max(lines1.length, lines2.length)
  
  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i] || ''
    const line2 = lines2[i] || ''
    
    if (line1 !== line2) {
      count++
      if (count <= 10) { // Limit details to avoid overwhelming output
        details.push(`Line ${i + 1}: "${line1.substring(0, 50)}..." vs "${line2.substring(0, 50)}..."`)
      }
    }
  }
  
  if (count > 10) {
    details.push(`... and ${count - 10} more differences`)
  }
  
  return { count, details }
}

function calculateSimilarity(text1: string, text2: string): number {
  if (text1 === text2) return 100
  
  const words1 = text1.split(/\s+/)
  const words2 = text2.split(/\s+/)
  
  const set1 = new Set(words1)
  const set2 = new Set(words2)
  
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  
  if (union.size === 0) return 0
  
  return Math.round((intersection.size / union.size) * 100)
}

function downloadResult() {
  if (!comparisonResult.value) return

  const report = `
PDF Comparison Report
====================

File 1: ${files.value[0]?.name || 'Unknown'}
File 2: ${files.value[1]?.name || 'Unknown'}

Comparison Mode: ${comparisonMode.value}

Results:
- Differences Found: ${comparisonResult.value.differences}
- Similarity: ${comparisonResult.value.similarity}%

Differences:
${comparisonResult.value.details.map(d => `- ${d}`).join('\n')}

Generated by PDFKit
  `.trim()

  const blob = new Blob([report], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'comparison-report.txt'
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

.comparison-mode {
  display: flex;
  justify-content: center;
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

.file-comparison {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-label {
  color: #808080;
  font-weight: 500;
}

.file-name {
  color: #ffffff;
  font-weight: 600;
}

.comparison-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  justify-content: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  min-width: 120px;
}

.stat-label {
  font-size: 12px;
  color: #808080;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
}

.differences-list {
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.differences-list h4 {
  color: #ffffff;
  margin-bottom: 12px;
}

.differences-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.differences-list li {
  padding: 8px 0;
  color: #a0a0a0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.differences-list li:last-child {
  border-bottom: none;
}
</style>
