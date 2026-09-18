<template>
  <BaseToolPage
    title="Sign PDF"
    description="Add electronic signatures to PDF documents"
    long-description="Add your electronic signature to any PDF document. Draw with your mouse, type your name in a cursive font, or upload an existing signature image."
    accepted-file-types=".pdf"
    action-label="Sign PDF"
    success-message="PDF Signed Successfully!"
    download-filename="signed.pdf"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="signPDF"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Signature Creation</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="signature-mode-selector">
              <q-btn-toggle
                v-model="signatureMode"
                toggle-color="primary"
                :options="[
                  { label: 'Draw', value: 'draw' },
                  { label: 'Type', value: 'type' },
                  { label: 'Upload', value: 'upload' }
                ]"
                spread
              />
            </div>

            <div v-if="signatureMode === 'draw'" class="draw-signature q-mt-md">
              <div class="canvas-container">
                <canvas
                  ref="signatureCanvas"
                  @mousedown="startDrawing"
                  @mousemove="draw"
                  @mouseup="stopDrawing"
                  @mouseleave="stopDrawing"
                  @touchstart="startDrawing"
                  @touchmove="draw"
                  @touchend="stopDrawing"
                />
              </div>
              <div class="canvas-actions">
                <q-btn flat label="Clear" @click="clearCanvas" color="grey-6" size="sm" />
                <q-btn flat label="Use Signature" @click="useDrawnSignature" color="primary" size="sm" />
              </div>
            </div>

            <div v-if="signatureMode === 'type'" class="type-signature q-mt-md">
              <q-input
                v-model="typedName"
                label="Type your name"
                filled
                dark
                color="primary"
                @keyup.enter="createTypedSignature"
              />
              
              <div class="font-selector q-mt-md">
                <label class="field-label">Signature Font</label>
                <q-btn-toggle
                  v-model="selectedFont"
                  toggle-color="primary"
                  :options="signatureFonts.map(f => ({ label: f.label, value: f.value }))"
                  spread
                />
              </div>

              <div class="color-selector q-mt-md">
                <label class="field-label">Ink Color</label>
                <div class="color-options">
                  <div
                    v-for="color in signatureColors"
                    :key="color.value"
                    class="color-swatch"
                    :class="{ selected: selectedColor === color.value }"
                    :style="{ backgroundColor: color.value }"
                    @click="selectedColor = color.value"
                  />
                </div>
              </div>

              <q-btn
                class="q-mt-md"
                color="primary"
                label="Create Signature"
                @click="createTypedSignature"
                size="md"
              />
            </div>

            <div v-if="signatureMode === 'upload'" class="upload-signature q-mt-md">
              <FileDropZone
                accept=".png"
                :multiple="false"
                @files-selected="handleSignatureUpload"
              />
              
              <div v-if="uploadedSignature" class="uploaded-preview">
                <img :src="uploadedSignature.imageData" alt="Signature" />
                <q-btn flat icon="close" @click="clearUploadedSignature" color="negative" size="sm" />
              </div>
            </div>

            <div v-if="currentSignature" class="current-signature q-mt-md">
              <label class="field-label">Current Signature</label>
              <div class="signature-preview">
                <img :src="currentSignature.imageData" alt="Current signature" />
              </div>
            </div>

            <div class="placement-section q-mt-md">
              <label class="field-label">Signature Placement</label>
              <div class="placement-controls">
                <q-input
                  v-model.number="placement.pageIndex"
                  label="Page Number"
                  type="number"
                  filled
                  dark
                  color="primary"
                  min="1"
                  class="placement-input"
                />
                <q-input
                  v-model.number="placement.x"
                  label="X Position (%)"
                  type="number"
                  filled
                  dark
                  color="primary"
                  min="0"
                  max="100"
                  class="placement-input"
                />
                <q-input
                  v-model.number="placement.y"
                  label="Y Position (%)"
                  type="number"
                  filled
                  dark
                  color="primary"
                  min="0"
                  max="100"
                  class="placement-input"
                />
                <q-input
                  v-model.number="placement.width"
                  label="Width (%)"
                  type="number"
                  filled
                  dark
                  color="primary"
                  min="1"
                  max="100"
                  class="placement-input"
                />
                <q-input
                  v-model.number="placement.height"
                  label="Height (%)"
                  type="number"
                  filled
                  dark
                  color="primary"
                  min="1"
                  max="100"
                  class="placement-input"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="signedResult" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>PDF Signed Successfully!</h3>
          <p>Your signature has been added to the document</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download Signed PDF"
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
import { ref, onMounted, onUnmounted } from 'vue'
import BaseToolPage from '@/components/tools/BaseToolPage.vue'
import FileDropZone from '@/components/upload/FileDropZone.vue'
import {
  createSignatureFromCanvas,
  createSignatureFromText,
  createSignatureFromImage,
  placeSignatureOnPDF,
  SIGNATURE_FONTS,
  SIGNATURE_COLORS
} from '@/services/signature/signatureService'

const files = ref<File[]>([])
const signatureMode = ref<'draw' | 'type' | 'upload'>('draw')
const signatureCanvas = ref<HTMLCanvasElement>()
const typedName = ref('')
const selectedFont = ref('Dancing Script')
const selectedColor = ref('#0a0a0a')
const currentSignature = ref<any>(null)
const uploadedSignature = ref<any>(null)
const placement = ref({
  pageIndex: 1,
  x: 50,
  y: 80,
  width: 30,
  height: 10
})
const signedResult = ref<Uint8Array | null>(null)
const error = ref<string | null>(null)

const signatureFonts = SIGNATURE_FONTS
const signatureColors = SIGNATURE_COLORS

let isDrawing = false
let lastX = 0
let lastY = 0

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

function initCanvas() {
  if (signatureCanvas.value) {
    const canvas = signatureCanvas.value
    const ctx = canvas.getContext('2d')
    canvas.width = 600
    canvas.height = 200
    ctx.strokeStyle = selectedColor.value
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }
}

function startDrawing(e: MouseEvent | TouchEvent) {
  isDrawing = true
  const canvas = signatureCanvas.value!
  const rect = canvas.getBoundingClientRect()
  
  if (e instanceof MouseEvent) {
    lastX = e.clientX - rect.left
    lastY = e.clientY - rect.top
  } else {
    lastX = e.touches[0].clientX - rect.left
    lastY = e.touches[0].clientY - rect.top
  }
}

function draw(e: MouseEvent | TouchEvent) {
  if (!isDrawing) return
  
  const canvas = signatureCanvas.value!
  const ctx = canvas.getContext('2d')!
  const rect = canvas.getBoundingClientRect()
  
  let currentX, currentY
  if (e instanceof MouseEvent) {
    currentX = e.clientX - rect.left
    currentY = e.clientY - rect.top
  } else {
    currentX = e.touches[0].clientX - rect.left
    currentY = e.touches[0].clientY - rect.top
  }
  
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(currentX, currentY)
  ctx.stroke()
  
  lastX = currentX
  lastY = currentY
}

function stopDrawing() {
  isDrawing = false
}

function clearCanvas() {
  if (signatureCanvas.value) {
    const canvas = signatureCanvas.value
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}

function useDrawnSignature() {
  if (signatureCanvas.value) {
    currentSignature.value = createSignatureFromCanvas(signatureCanvas.value)
  }
}

async function createTypedSignature() {
  if (!typedName.value.trim()) {
    error.value = 'Please enter your name'
    return
  }
  
  try {
    currentSignature.value = await createSignatureFromText(
      typedName.value,
      selectedFont.value,
      selectedColor.value
    )
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create signature'
  }
}

function handleSignatureUpload(selectedFiles: File[]) {
  if (selectedFiles.length > 0) {
    createSignatureFromImage(selectedFiles[0]).then(signature => {
      uploadedSignature.value = signature
      currentSignature.value = signature
    })
  }
}

function clearUploadedSignature() {
  uploadedSignature.value = null
  currentSignature.value = null
}

async function signPDF() {
  error.value = null
  signedResult.value = null
  
  if (files.value.length === 0) {
    error.value = 'Please select a PDF file'
    return
  }

  if (!currentSignature.value) {
    error.value = 'Please create or upload a signature first'
    return
  }

  try {
    signedResult.value = await placeSignatureOnPDF(
      files.value[0],
      currentSignature.value,
      placement.value
    )
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to sign PDF'
  }
}

function downloadResult() {
  if (!signedResult.value) return

  const blob = new Blob([signedResult.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'signed.pdf'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

onMounted(() => {
  initCanvas()
})

onUnmounted(() => {
  clearCanvas()
})
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

.canvas-container {
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
}

canvas {
  display: block;
  cursor: crosshair;
}

.canvas-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

.color-options {
  display: flex;
  gap: 8px;
}

.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.color-swatch.selected {
  border-color: #4a9eff;
  box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.3);
}

.uploaded-preview {
  position: relative;
  display: inline-block;
  margin-top: 12px;
}

.uploaded-preview img {
  max-width: 200px;
  max-height: 100px;
  border-radius: 8px;
}

.uploaded-preview .q-btn {
  position: absolute;
  top: -8px;
  right: -8px;
}

.current-signature {
  margin-top: 16px;
}

.signature-preview img {
  max-width: 200px;
  max-height: 100px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.placement-controls {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.placement-input {
  margin: 0;
}
</style>
