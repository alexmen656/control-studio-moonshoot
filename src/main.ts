import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import axios from './axios.ts'
import GoogleSignInPlugin from 'vue3-google-signin'

const app = createApp(App)

app.use(GoogleSignInPlugin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
})

app.use(createPinia())
app.use(router)

app.config.globalProperties.$axios = axios

app.mount('#app')
;(window as any).vueApp = app
