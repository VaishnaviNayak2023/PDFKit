<template>
  <div class="file-picker">
    <q-btn
      :label="label"
      :icon="icon"
      :color="color"
      :disabled="disabled"
      @click="openFilePicker"
    />
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      class="hidden-input"
      @change="onFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  label?: string
  icon?: string
  color?: string
  accept?: string
  multiple?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Select Files',
  icon: 'folder_open',
  color: 'primary',
  accept: '*/*',
  multiple: false,
  disabled: false
})

const emit = defineEmits<{
  'files-selected': [files: File[]]
}>()

const fileInput = ref<HTMLInputElement | null>(null)

function openFilePicker() {
  fileInput.value?.click()
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  if (files.length > 0) {
    emit('files-selected', files)
  }
  // Reset input
  target.value = ''
}
</script>

<style scoped>
.file-picker {
  display: inline-block;
}

.hidden-input {
  display: none;
}
</style>
