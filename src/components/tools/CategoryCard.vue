<template>
  <q-card
    flat
    bordered
    class="category-card pk-card-hover cursor-pointer q-pa-md"
    @click="$emit('select', category.id)"
  >
    <div class="row items-start justify-between q-mb-md">
      <div
        class="icon-wrap"
        :style="{ backgroundColor: category.bgColor, color: category.color }"
      >
        <q-icon :name="category.icon" size="20px" />
      </div>
      <q-icon name="arrow_forward" size="16px" color="grey-6" />
    </div>
    <div class="text-subtitle1 text-weight-medium">{{ category.label }}</div>
    <div class="text-caption text-grey-5 q-mb-sm">{{ category.count }} tools</div>
    <div class="text-caption text-grey-6" style="line-height: 1.5">
      {{ category.description }}
    </div>
  </q-card>
</template>

<script setup lang="ts">
import type { ToolCategory } from '@/types'
import type { ToolCategoryMeta } from '@/config/tools'

defineProps<{
  category: ToolCategoryMeta & { count: number }
}>()

defineEmits<{
  select: [id: ToolCategory]
}>()
</script>

<style scoped>
.category-card {
  background: #111827;
  border-color: var(--pk-border);
  border-radius: 20px;
  min-height: 168px;
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
