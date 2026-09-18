<template>
  <section>
    <div class="q-mb-md">
      <div class="text-h5 text-weight-medium">Browse by Category</div>
      <div class="text-caption text-grey-6 q-mt-xs">
        Find the right tool for your specific needs.
      </div>
    </div>

    <div class="category-grid">
      <category-card
        v-for="category in categories"
        :key="category.id"
        :category="category"
        @select="onSelect"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ToolCategory } from '@/types'
import { getBrowsableCategories } from '@/config/tools'
import { useToolsStore } from '@/stores/tools'
import CategoryCard from './CategoryCard.vue'

const toolsStore = useToolsStore()
const categories = getBrowsableCategories()

function onSelect(id: ToolCategory) {
  toolsStore.setCategory(id)
}
</script>

<style scoped>
.category-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 600px) {
  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .category-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
