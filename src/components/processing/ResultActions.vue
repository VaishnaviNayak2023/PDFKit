<template>
  <div>
    <q-banner class="bg-positive text-white q-mb-md" rounded>
      Processing finished. Download your file below.
    </q-banner>
    <q-list bordered class="rounded-borders">
      <q-item v-for="item in results" :key="item.filename">
        <q-item-section>
          <q-item-label>{{ item.filename }}</q-item-label>
          <q-item-label caption>{{ formatSize(item.size) }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn color="primary" unelevated no-caps label="Download" icon="download" @click="$emit('download', item)" />
        </q-item-section>
      </q-item>
    </q-list>
    <div class="row q-gutter-sm q-mt-md">
      <q-btn outline color="grey-5" no-caps label="Process again" @click="$emit('process-again')" />
      <q-btn flat color="grey-5" no-caps label="Save to vault" @click="results[0] && $emit('save-to-vault', results[0])" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProcessingResult } from '@/types'

defineProps<{
  results: ProcessingResult[]
  toolName?: string
}>()

defineEmits<{
  download: [result: ProcessingResult]
  'save-to-vault': [result: ProcessingResult]
  'process-again': []
}>()

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
</script>
