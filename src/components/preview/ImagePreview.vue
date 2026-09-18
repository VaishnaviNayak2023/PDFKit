<template>
  <div class="image-preview">
    <div v-if="loading" class="loading-state">
      <q-spinner color="primary" size="48px" />
      <p class="loading-text">Loading image...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <q-icon name="error" size="48px" color="negative" />
      <p class="error-text">{{ error }}</p>
      <q-btn flat label="Retry" @click="loadImage" />
    </div>

    <div v-else-if="!imageUrl" class="empty-state">
      <q-icon name="image" size="48px" class="empty-icon" />
      <p class="empty-text">No image loaded</p>
    </div>

    <div v-else class="image-content">
      <div class="image-toolbar">
        <q-btn
          flat
          dense
          :icon="zoomInIcon"
          @click="zoomIn"
        />
        <q-btn
          flat
          dense
          :icon="zoomOutIcon"
          @click="zoomOut"
        />
        <q-btn
          flat
          dense
          icon="fit_screen"
          @click="fitToScreen"
        />
        <q-btn
          flat
          dense
          icon="rotate_right"
          @click="rotate"
        />
        <q-space />
        <span class="image-info">{{ imageInfo }}</span>
      </div>

      <div class="image-container" ref="imageContainer">
        <img
          ref="imageRef"
          :src="imageUrl"
          :style="imageStyle"
          class="preview-image"
          @load="onImageLoad"
          @error="onImageError"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Props {
  imageData?: ArrayBuffer
  fileUrl?: string
  fileName?: string
}

const props = defineProps<Props>()

const loading = ref(true)
const error = ref<string | null>(null)
const imageUrl = ref<string | null>(null)
const scale = ref(1.0)
const rotation = ref(0)
const imageRef = ref<HTMLImageElement | null>(null)
const imageContainer = ref<HTMLDivElement | null>(null)
const imageDimensions = ref({ width: 0, height: 0 })

const imageStyle = computed(() => ({
  transform: `scale(${scale.value}) rotate(${rotation.value}deg)`,
  transition: 'transform 0.3s ease'
}))

const imageInfo = computed(() => {
  if (!props.fileName) return ''
  const size = `${imageDimensions.value.width} x ${imageDimensions.value.height}`
  return `${props.fileName} (${size})`
})

const zoomInIcon = ref('zoom_in')
const zoomOutIcon = ref('zoom_out')

function loadImage() {
  loading.value = true
  error.value = null

  try {
    if (props.imageData) {
      const blob = new Blob([props.imageData])
      imageUrl.value = URL.createObjectURL(blob)
    } else if (props.fileUrl) {
      imageUrl.value = props.fileUrl
    } else {
      throw new Error('No image data or URL provided')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load image'
    loading.value = false
  }
}

function onImageLoad() {
  loading.value = false
  if (imageRef.value) {
    imageDimensions.value = {
      width: imageRef.value.naturalWidth,
      height: imageRef.value.naturalHeight
    }
  }
}

function onImageError() {
  loading.value = false
  error.value = 'Failed to load image'
}

function zoomIn() {
  scale.value = Math.min(scale.value + 0.25, 3.0)
}

function zoomOut() {
  scale.value = Math.max(scale.value - 0.25, 0.25)
}

function fitToScreen() {
  if (!imageContainer.value || !imageRef.value) return

  const containerWidth = imageContainer.value.clientWidth - 32
  const containerHeight = imageContainer.value.clientHeight - 32
  const imageWidth = imageRef.value.naturalWidth
  const imageHeight = imageRef.value.naturalHeight

  const scaleX = containerWidth / imageWidth
  const scaleY = containerHeight / imageHeight
  scale.value = Math.min(scaleX, scaleY, 1.0)
}

function rotate() {
  rotation.value = (rotation.value + 90) % 360
}

onMounted(() => {
  loadImage()
})
</script>

<style scoped>
.image-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 32px;
}

.loading-text,
.error-text,
.empty-text {
  margin-top: 16px;
  color: #808080;
}

.empty-icon {
  color: #4a4a4a;
}

.image-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.image-toolbar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #0f0f0f;
  border-bottom: 1px solid #2a2a2a;
  gap: 8px;
}

.image-info {
  font-size: 12px;
  color: #808080;
  white-space: nowrap;
}

.image-container {
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: #0a0a0a;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>
