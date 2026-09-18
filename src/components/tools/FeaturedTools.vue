<template>
  <section>
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-medium">Featured Tools</div>
        <div class="text-caption text-grey-6 q-mt-xs">
          Most popular and essential tools for everyday use.
        </div>
      </div>
      <q-btn
        flat
        no-caps
        dense
        color="grey-5"
        label="View All"
        icon-right="arrow_forward"
        @click="viewAll"
      />
    </div>

    <div class="featured-grid">
      <featured-tool-card v-for="tool in tools" :key="tool.id" :tool="tool" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { getFeaturedTools } from '@/config/tools'
import { useToolsStore } from '@/stores/tools'
import FeaturedToolCard from './FeaturedToolCard.vue'

const toolsStore = useToolsStore()
const tools = getFeaturedTools()

function viewAll() {
  toolsStore.setCategory('all')
  toolsStore.searchQuery = ''
}
</script>

<style scoped>
.featured-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 600px) {
  .featured-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .featured-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .featured-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>
