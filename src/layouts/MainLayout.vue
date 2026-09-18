<template>
  <q-layout view="hHh lpR fFf" class="app-shell">
    <q-header class="app-header-wrap">
      <app-header />
    </q-header>

    <q-drawer
      v-if="showToolsDrawer"
      v-model="appStore.sidebarOpen"
      side="left"
      bordered
      :width="260"
      :breakpoint="1023"
      class="tools-drawer"
    >
      <tool-sidebar />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import AppHeader from '@/components/layout/AppHeader.vue'
import ToolSidebar from '@/components/tools/ToolSidebar.vue'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const $q = useQuasar()
const appStore = useAppStore()

const showToolsDrawer = computed(() => route.path.startsWith('/tools') && $q.screen.lt.md)

watch(
  () => $q.screen.lt.md,
  (mobile) => {
    if (!mobile) appStore.sidebarOpen = false
  }
)
</script>

<style scoped>
.app-shell {
  background: #050505;
}

.app-header-wrap {
  background: #050505;
}

.tools-drawer {
  background: #0b0f14;
}
</style>
