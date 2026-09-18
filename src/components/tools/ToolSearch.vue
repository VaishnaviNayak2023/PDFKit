<template>
  <q-input
    :model-value="toolsStore.searchQuery"
    outlined
    dark
    placeholder="Search tools by name, category or keyword..."
    class="tool-search"
    @update:model-value="onInput"
    @keyup.esc="toolsStore.searchQuery = ''"
  >
    <template #prepend>
      <q-icon name="search" color="grey-6" />
    </template>
    <template #append>
      <q-badge outline color="grey-6" class="q-px-sm">{{ shortcutLabel }}</q-badge>
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useToolsStore } from '@/stores/tools'

const toolsStore = useToolsStore()
const shortcutLabel = computed(() =>
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? 'Cmd K' : 'Ctrl K'
)

function onInput(value: string | number | null) {
  toolsStore.searchQuery = String(value ?? '')
}

onMounted(() => {
  const field = document.querySelector('.tool-search input') as HTMLInputElement | null
  toolsStore.searchInputEl = field
})
</script>

<style scoped>
.tool-search :deep(.q-field__control) {
  height: 56px;
  border-radius: 16px;
  background: #0b0f14;
}
</style>
