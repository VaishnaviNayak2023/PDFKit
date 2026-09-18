import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Dark, Quasar } from 'quasar'
import quasarIconSet from 'quasar/icon-set/material-icons'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import './css/app.scss'

import App from './App.vue'
import router from './router'
import { useAppStore } from './stores/app'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize dark mode from store
const appStore = useAppStore()
Dark.set(appStore.isDarkMode)

app.use(Quasar, {
  plugins: { Dark },
  iconSet: quasarIconSet,
  config: {
    dark: appStore.isDarkMode,
    brand: {
      primary: '#4F8CFF',
      secondary: '#8B5CF6',
      accent: '#4F8CFF',
      dark: '#050505',
      'dark-page': '#050505',
      positive: '#22C55E',
      negative: '#EF4444',
      info: '#4F8CFF',
      warning: '#F59E0B'
    }
  }
})

app.mount('#app')
