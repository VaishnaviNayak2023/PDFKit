<template>
  <div class="upload-progress">
    <div class="progress-header">
      <div class="progress-info">
        <q-icon :name="icon" size="24px" class="progress-icon" />
        <span class="progress-title">{{ title }}</span>
      </div>
      <span class="progress-percentage">{{ Math.round(progress) }}%</span>
    </div>

    <q-linear-progress
      :value="progress / 100"
      :color="progressColor"
      class="progress-bar"
    />

    <div v-if="showDetails" class="progress-details">
      <span class="progress-status">{{ status }}</span>
      <span v-if="remainingTime" class="progress-time">
        {{ remainingTime }} remaining
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  progress: number
  title?: string
  icon?: string
  status?: string
  remainingTime?: string
  showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Processing',
  icon: 'cloud_upload',
  status: 'In progress',
  showDetails: true
})

const progressColor = computed(() => {
  if (props.progress < 30) return 'orange'
  if (props.progress < 70) return 'primary'
  return 'positive'
})
</script>

<style scoped>
.upload-progress {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-icon {
  color: #4a9eff;
}

.progress-title {
  font-weight: 600;
  color: #ffffff;
}

.progress-percentage {
  font-weight: 700;
  color: #4a9eff;
}

.progress-bar {
  margin-bottom: 8px;
}

.progress-details {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #808080;
}
</style>
