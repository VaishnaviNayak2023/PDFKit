<template>
  <div class="tool-sidebar column full-height q-pa-md">
    <q-list padding class="col">
      <q-item
        v-for="item in categories"
        :key="item.id"
        clickable
        v-ripple
        class="sidebar-item q-mb-xs"
        :class="{ 'sidebar-item--active': toolsStore.selectedCategory === item.id }"
        @click="selectCategory(item.id)"
      >
        <q-item-section avatar>
          <q-icon :name="item.icon" :style="{ color: item.color }" size="20px" />
        </q-item-section>
        <q-item-section class="text-weight-medium">{{ item.label }}</q-item-section>
        <q-item-section side>
          <q-badge rounded :label="item.countLabel" class="count-badge" />
        </q-item-section>
      </q-item>
    </q-list>

    <privacy-card class="q-mt-md" />
  </div>
</template>

<script setup lang="ts">
import type { ToolCategory } from '@/types'
import { getSidebarCategories } from '@/config/tools'
import { useToolsStore } from '@/stores/tools'
import PrivacyCard from './PrivacyCard.vue'

const toolsStore = useToolsStore()
const categories = getSidebarCategories()

function selectCategory(id: ToolCategory | 'all') {
  toolsStore.setCategory(id)
}
</script>

<style scoped>
.tool-sidebar {
  background: #0b0f14;
}

.sidebar-item {
  border-radius: 12px;
  min-height: 44px;
  color: #a1a1aa;
}

.sidebar-item--active {
  background: rgba(79, 140, 255, 0.16);
  color: #ffffff;
}

.count-badge {
  background: rgba(255, 255, 255, 0.06);
  color: #a1a1aa;
}
</style>
