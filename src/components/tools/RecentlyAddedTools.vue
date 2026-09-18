<template>
  <section>
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-medium">Recently Added</div>
        <div class="text-caption text-grey-6 q-mt-xs">
          New tools and features added to the platform.
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

    <div class="row q-col-gutter-md">
      <div v-for="tool in tools" :key="tool.id" class="col-12 col-sm-6 col-lg-3">
        <recent-tool-card :tool="tool" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { getRecentlyAddedTools } from '@/config/tools'
import { useToolsStore } from '@/stores/tools'
import RecentToolCard from './RecentToolCard.vue'

const toolsStore = useToolsStore()
const tools = getRecentlyAddedTools()

function viewAll() {
  toolsStore.setCategory('all')
  toolsStore.searchQuery = ''
}
</script>
