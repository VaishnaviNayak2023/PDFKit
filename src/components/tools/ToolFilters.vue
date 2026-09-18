<template>
  <div class="row q-gutter-sm">
    <q-chip
      v-for="item in filters"
      :key="item.id"
      clickable
      :outline="toolsStore.selectedCategory !== item.id"
      :color="toolsStore.selectedCategory === item.id ? 'primary' : 'grey-8'"
      :text-color="toolsStore.selectedCategory === item.id ? 'white' : 'grey-5'"
      :label="item.label"
      class="filter-chip"
      @click="toolsStore.setCategory(item.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { getFilterCategories } from '@/config/tools'
import { useToolsStore } from '@/stores/tools'

const toolsStore = useToolsStore()
const filters = getFilterCategories()
</script>

<style scoped>
.filter-chip {
  border-radius: 999px;
}
</style>
