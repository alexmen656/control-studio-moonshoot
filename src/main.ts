import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import axios from './axios.ts'
import GoogleSignInPlugin from 'vue3-google-signin'

const app = createApp(App)

app.use(GoogleSignInPlugin, {
  clientId: '706582238302-k3e6bqv81en6u97gf8l5pq883p773236.apps.googleusercontent.com', //import.meta.env.VITE_GOOGLE_CLIENT_ID,
})

app.use(createPinia())
app.use(router)

app.config.globalProperties.$axios = axios

app.mount('#app')
;(window as any).vueApp = app
