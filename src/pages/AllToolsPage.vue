<template>
  <q-page class="tools-page">
    <div class="tools-shell">
      <aside class="tools-sidebar gt-sm">
        <tool-sidebar />
      </aside>

      <div class="tools-main q-px-lg q-py-xl">
        <div class="tools-inner">
          <tools-hero class="q-mb-xl" />
          <tool-search class="q-mb-md" />
          <tool-filters class="q-mb-xl" />

          <section v-if="toolsStore.isCatalogFiltered" class="q-mb-xl">
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h5 text-weight-medium">
                {{ resultTitle }}
              </div>
              <div class="text-caption text-grey-6">
                {{ toolsStore.catalogTools.length }} tools
              </div>
            </div>
            <div class="row q-col-gutter-md">
              <div
                v-for="tool in toolsStore.catalogTools"
                :key="tool.id"
                class="col-12 col-sm-6 col-md-4 col-lg-3"
              >
                <featured-tool-card :tool="tool" />
              </div>
            </div>
            <div v-if="!toolsStore.catalogTools.length" class="text-grey-6 q-mt-lg">
              No tools match that search.
            </div>
          </section>

          <template v-else>
            <featured-tools class="q-mb-xl" />
            <tool-categories-grid class="q-mb-xl" />
            <recently-added-tools class="q-mb-xl" />
          </template>

          <div class="text-caption text-grey-7 q-pt-md">
            © 2026 PDFKit. Privacy-first, offline-capable document tools.
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useToolsStore } from '@/stores/tools'
import { getCategoryMeta } from '@/config/tools'
import ToolSidebar from '@/components/tools/ToolSidebar.vue'
import ToolsHero from '@/components/tools/ToolsHero.vue'
import ToolSearch from '@/components/tools/ToolSearch.vue'
import ToolFilters from '@/components/tools/ToolFilters.vue'
import FeaturedTools from '@/components/tools/FeaturedTools.vue'
import FeaturedToolCard from '@/components/tools/FeaturedToolCard.vue'
import ToolCategoriesGrid from '@/components/tools/ToolCategoriesGrid.vue'
import RecentlyAddedTools from '@/components/tools/RecentlyAddedTools.vue'

const toolsStore = useToolsStore()

const resultTitle = computed(() => {
  if (toolsStore.searchQuery.trim()) return 'Search results'
  if (toolsStore.selectedCategory === 'all') return 'All Tools'
  return getCategoryMeta(toolsStore.selectedCategory)?.label ?? 'Tools'
})
</script>

<style scoped>
.tools-page {
  background: #050505;
}

.tools-shell {
  display: flex;
  min-height: calc(100vh - 72px);
}

.tools-sidebar {
  width: 260px;
  flex: 0 0 260px;
  position: sticky;
  top: 72px;
  height: calc(100vh - 72px);
  overflow: auto;
  border-right: 1px solid var(--pk-border);
  background: #0b0f14;
}

.tools-main {
  flex: 1;
  min-width: 0;
}

.tools-inner {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
