<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Dark } from 'quasar'

onMounted(() => {
  Dark.set(true)
})
</script>
