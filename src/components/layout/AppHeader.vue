<template>
  <q-toolbar class="app-header q-px-lg">
    <router-link to="/" class="app-logo text-no-decoration">
      <span class="text-h6 text-weight-bold text-primary">PDFKit</span>
    </router-link>

    <q-space class="lt-md" />

    <div class="absolute-center gt-sm row no-wrap items-center q-gutter-x-lg">
      <router-link to="/" class="header-nav-link" :class="{ 'header-nav-link--active': isActive('/') }">
        Home
      </router-link>
      <router-link to="/tools" class="header-nav-link" :class="{ 'header-nav-link--active': isActive('/tools') }">
        Tools
      </router-link>
      <router-link to="/workspace" class="header-nav-link" :class="{ 'header-nav-link--active': isActive('/workspace') }">
        Workspace
      </router-link>
      <router-link to="/pricing" class="header-nav-link" :class="{ 'header-nav-link--active': isActive('/pricing') }">
        Pricing
      </router-link>
      <q-btn-dropdown
        flat
        no-caps
        dense
        unelevated
        class="resources-btn"
        :class="{ 'header-nav-link--active': isResourcesActive }"
        label="Resources"
      >
        <q-list dark style="min-width: 180px">
          <q-item clickable v-close-popup to="/faq">
            <q-item-section>FAQ</q-item-section>
          </q-item>
          <q-item clickable v-close-popup to="/privacy">
            <q-item-section>Privacy</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <router-link to="/about" class="header-nav-link" :class="{ 'header-nav-link--active': isActive('/about') }">
        About
      </router-link>
    </div>

    <q-space />

    <q-input
      v-model="toolsStore.searchQuery"
      dense
      outlined
      dark
      placeholder="Search tools..."
      class="header-search gt-sm q-mr-md"
      @focus="goToTools"
      @keyup.enter="goToTools"
    >
      <template #append>
        <q-badge outline color="grey-6" class="q-px-sm">{{ shortcutLabel }}</q-badge>
      </template>
    </q-input>

    <q-btn
      flat
      round
      dense
      :icon="appStore.isDarkMode ? 'light_mode' : 'dark_mode'"
      class="q-mr-sm"
      aria-label="Toggle theme"
      @click="toggleTheme"
    />

    <q-btn
      flat
      round
      dense
      icon="menu"
      class="lt-md q-ml-sm"
      aria-label="Open menu"
      @click="appStore.toggleSidebar()"
    />
  </q-toolbar>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useToolsStore } from '@/stores/tools'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const toolsStore = useToolsStore()

const isMac = computed(() =>
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
)
const shortcutLabel = computed(() => (isMac.value ? 'Cmd K' : 'Ctrl K'))

const isResourcesActive = computed(() => ['/faq', '/privacy'].includes(route.path))

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(`${path}/`)
}

function goToTools() {
  if (route.path !== '/tools') {
    void router.push('/tools')
  }
}

function toggleTheme() {
  appStore.toggleDarkMode()
}

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    goToTools()
    toolsStore.focusSearch()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.app-header {
  min-height: 72px;
  height: 72px;
  background: #050505;
  border-bottom: 1px solid var(--pk-border);
}

.app-logo {
  text-decoration: none;
}

.header-search {
  width: 220px;
}

.header-search :deep(.q-field__control) {
  height: 38px;
  border-radius: 10px;
  background: #0b0f14;
}

.header-nav-link {
  color: #a1a1aa;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 0;
  position: relative;
}

.header-nav-link--active {
  color: #ffffff;
}

.header-nav-link--active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -6px;
  height: 2px;
  border-radius: 2px;
  background: var(--pk-primary);
}

.resources-btn {
  color: #a1a1aa;
  font-size: 14px;
  font-weight: 500;
}
</style>
