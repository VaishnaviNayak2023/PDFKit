<template>
  <q-card
    flat
    bordered
    class="recent-card pk-card-hover cursor-pointer q-pa-md"
    @click="openTool"
  >
    <div class="row items-center no-wrap q-gutter-md">
      <div
        class="icon-wrap"
        :style="{ backgroundColor: `${tool.color}22`, color: tool.color }"
      >
        <q-icon :name="tool.icon" size="18px" />
      </div>
      <div class="col">
        <div class="text-body2 text-weight-medium">{{ tool.name }}</div>
        <div class="text-caption text-grey-6">{{ categoryLabel }}</div>
      </div>
      <q-icon name="chevron_right" color="grey-6" />
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
.recent-card {
  background: #111827;
  border-color: var(--pk-border);
  border-radius: 16px;
}

.icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
