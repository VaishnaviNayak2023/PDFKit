<template>
  <q-card flat bordered class="q-pa-lg text-center processing-card">
    <q-circular-progress
      :value="progress"
      size="88px"
      :thickness="0.18"
      color="primary"
      track-color="grey-9"
      show-value
      class="q-mb-md"
    >
      {{ Math.round(progress) }}%
    </q-circular-progress>
    <div class="text-subtitle1">{{ statusText }}</div>
    <div class="text-caption text-grey-6 q-mt-sm">Files never leave this device.</div>
    <q-btn v-if="canCancel" flat color="grey-5" class="q-mt-md" label="Cancel" @click="$emit('cancel')" />
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  progress?: number
  statusText?: string
  canCancel?: boolean
}>()
defineEmits<{ cancel: [] }>()
</script>

<style scoped>
.processing-card {
  background: #111827;
  border-color: rgba(255,255,255,0.06);
  max-width: 420px;
  margin: 0 auto;
}
</style>
