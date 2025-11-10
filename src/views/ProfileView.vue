<script setup lang="ts">
import { ref, onMounted } from 'vue'

type ThemeMode = 'system' | 'light' | 'dark'
type Language = 'en' | 'de'

const themeMode = ref<ThemeMode>('system')
const language = ref<Language>('en')
const email = ref('')
const username = ref('')

onMounted(() => {
  const savedTheme = localStorage.getItem('themeMode') as ThemeMode
  if (savedTheme) {
    themeMode.value = savedTheme
  }
  
  const savedLanguage = localStorage.getItem('language') as Language
  if (savedLanguage) {
    language.value = savedLanguage
  }

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null
  if (user) {
    email.value = user.email || ''
    username.value = user.username || ''
  }
})

const setThemeMode = (mode: ThemeMode) => {
  themeMode.value = mode
  localStorage.setItem('themeMode', mode)
  applyTheme(mode)
}

const applyTheme = (mode: ThemeMode) => {
  const html = document.documentElement
  
  if (mode === 'dark') {
    html.classList.add('dark')
  } else if (mode === 'light') {
    html.classList.remove('dark')
  } else {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }
}

const setLanguage = (lang: Language) => {
  language.value = lang
  localStorage.setItem('language', lang)
}

const getThemeIcon = (mode: ThemeMode) => {
  const icons = {
    system: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>`,
    light: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>`,
    dark: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>`
  }
  return icons[mode]
}

const getFlagIcon = (lang: Language) => {
  const flags = {
    en: `<svg class="w-6 h-6" viewBox="0 0 36 36">
      <path fill="#00247D" d="M0 9.059V13h5.628zM4.664 31H13v-5.837zM23 25.164V31h8.335zM0 23v3.941L5.63 23zM31.337 5H23v5.837zM36 26.942V23h-5.631zM36 13V9.059L30.371 13zM13 5H4.664L13 10.837z"/>
      <path fill="#CF1B2B" d="M25.14 23l9.712 6.801c.471-.479.808-1.082.99-1.749L28.627 23H25.14zM13 23h-2.141l-9.711 6.8c.521.53 1.189.909 1.938 1.085L13 23.943V23zm10-10h2.141l9.711-6.8c-.521-.531-1.188-.909-1.937-1.085L23 12.057V13zm-12.141 0L1.148 6.2C.677 6.68.34 7.282.157 7.949L7.372 13h3.487z"/>
      <path fill="#EEE" d="M36 21H21v10h2v-5.836L31.335 31H32c1.117 0 2.126-.461 2.852-1.199L25.14 23h3.487l7.215 5.052c.093-.337.158-.686.158-1.052v-.058L30.369 23H36v-2zM0 21v2h5.63L0 26.941V27c0 1.091.439 2.078 1.148 2.8l9.711-6.8H13v.943l-9.914 6.941c.294.07.598.116.914.116h.664L13 25.163V31h2V21H0zM36 9c0-1.091-.439-2.078-1.148-2.8L25.141 13H23v-.943l9.915-6.942C32.62 5.046 32.316 5 32 5h-.663L23 10.837V5h-2v10h15v-2h-5.629L36 9.059V9zM13 5v5.837L4.664 5H4c-1.118 0-2.126.461-2.852 1.2l9.711 6.8H7.372L.157 7.949C.065 8.286 0 8.634 0 9v.059L5.628 13H0v2h15V5h-2z"/>
      <path fill="#CF1B2B" d="M21 15V5h-6v10H0v6h15v10h6V21h15v-6z"/>
    </svg>`,
    de: `<svg class="w-6 h-6" viewBox="0 0 36 36">
      <path fill="#000" d="M0 27c0 2.209 1.791 4 4 4h28c2.209 0 4-1.791 4-4v-4H0v4z"/>
      <path fill="#D00" d="M0 14h36v9H0z"/>
      <path fill="#FFCE00" d="M32 5H4C1.791 5 0 6.791 0 9v5h36V9c0-2.209-1.791-4-4-4z"/>
    </svg>`
  }
  return flags[lang]
}
</script>

<template>
  <div class="h-full flex flex-col bg-white dark:bg-gray-900">
    <div class="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile Settings</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-1">Manage your personal preferences</p>
    </div>
    <div class="flex-1 overflow-y-auto p-8">
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Account Information</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
              <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100">
                {{ username || 'N/A' }}
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100">
                {{ email || 'N/A' }}
              </div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <svg class="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Theme</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">Choose how Reelmia looks to you</p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              @click="setThemeMode('system')"
              :class="[
                'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all',
                themeMode === 'system'
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-md'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              ]"
            >
              <div class="p-3 bg-white dark:bg-gray-700 rounded-lg" v-html="getThemeIcon('system')"></div>
              <div class="text-center">
                <div class="font-semibold text-gray-900 dark:text-gray-100">System</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Use system preference</div>
              </div>
              <div v-if="themeMode === 'system'" class="mt-2">
                <svg class="w-6 h-6 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </button>
            <button
              @click="setThemeMode('light')"
              :class="[
                'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all',
                themeMode === 'light'
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-md'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              ]"
            >
              <div class="p-3 bg-white dark:bg-gray-700 rounded-lg text-yellow-500" v-html="getThemeIcon('light')"></div>
              <div class="text-center">
                <div class="font-semibold text-gray-900 dark:text-gray-100">Light</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Light appearance</div>
              </div>
              <div v-if="themeMode === 'light'" class="mt-2">
                <svg class="w-6 h-6 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </button>
            <button
              @click="setThemeMode('dark')"
              :class="[
                'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all',
                themeMode === 'dark'
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-md'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              ]"
            >
              <div class="p-3 bg-white dark:bg-gray-700 rounded-lg text-blue-500" v-html="getThemeIcon('dark')"></div>
              <div class="text-center">
                <div class="font-semibold text-gray-900 dark:text-gray-100">Dark</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Dark appearance</div>
              </div>
              <div v-if="themeMode === 'dark'" class="mt-2">
                <svg class="w-6 h-6 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </button>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Language</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">Select your preferred language</p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              @click="setLanguage('en')"
              :class="[
                'flex items-center gap-4 p-5 rounded-xl border-2 transition-all',
                language === 'en'
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-md'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              ]"
            >
              <div v-html="getFlagIcon('en')"></div>
              <div class="text-left flex-1">
                <div class="font-semibold text-gray-900 dark:text-gray-100">English</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">English (US)</div>
              </div>
              <div v-if="language === 'en'">
                <svg class="w-6 h-6 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </button>
            <button
              @click="setLanguage('de')"
              :class="[
                'flex items-center gap-4 p-5 rounded-xl border-2 transition-all',
                language === 'de'
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-md'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              ]"
            >
              <div v-html="getFlagIcon('de')"></div>
              <div class="text-left flex-1">
                <div class="font-semibold text-gray-900 dark:text-gray-100">Deutsch</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">German</div>
              </div>
              <div v-if="language === 'de'">
                <svg class="w-6 h-6 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

@media (prefers-color-scheme: dark) {
  ::-webkit-scrollbar-thumb {
    background: #4a5568;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #718096;
  }
}
</style>
