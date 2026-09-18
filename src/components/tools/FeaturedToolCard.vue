<template>
  <q-card
    flat
    bordered
    class="featured-card pk-card-hover cursor-pointer q-pa-md"
    @click="openTool"
  >
    <div
      class="icon-wrap q-mb-md"
      :style="{ backgroundColor: `${tool.color}22`, color: tool.color }"
    >
      <q-icon :name="tool.icon" size="22px" />
    </div>
    <div class="text-subtitle1 text-weight-medium q-mb-xs">{{ tool.name }}</div>
    <div class="text-caption text-grey-6 q-mb-md" style="min-height: 40px; line-height: 1.5">
      {{ tool.description }}
    </div>
    <div class="row items-center justify-between">
      <q-badge outline :style="{ color: tool.color, borderColor: `${tool.color}55` }">
        {{ categoryLabel }}
      </q-badge>
      <q-icon name="arrow_forward" size="16px" color="grey-6" />
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Tool } from '@/types'
import { getCategoryMeta } from '@/config/tools'

const props = defineProps<{ tool: Tool }>()
const router = useRouter()

const categoryLabel = computed(() => getCategoryMeta(props.tool.category)?.label ?? props.tool.category)

function openTool() {
  void router.push(props.tool.route)
}
</script>

<style scoped>
.featured-card {
  background: #111827;
  border-color: var(--pk-border);
  border-radius: 20px;
}

.icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
