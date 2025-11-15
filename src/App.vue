<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'

const route = useRoute()

const isAuthenticated = ref(!!localStorage.getItem('auth_token'))

function onAuthChange() {
  isAuthenticated.value = !!localStorage.getItem('auth_token')
}

onMounted(() => window.addEventListener('auth-change', onAuthChange))
onBeforeUnmount(() => window.removeEventListener('auth-change', onAuthChange))

const showHeader = computed(() => {
  if (!isAuthenticated.value) return false
  return !['landing', 'login', 'signup', 'blog', 'undefined', 'onboarding'].includes(route.name as string)
})

const showSidebar = computed(() => {
  if (!isAuthenticated.value) return false
  return !['landing', 'login', 'signup', 'blog', 'undefined', 'onboarding'].includes(route.name as string)
})
</script>

<template>
  <div id="app" class="min-h-screen" :class="showSidebar ? 'app-with-sidebar' : 'bg-gray-50 dark:bg-gray-900'">
    <AppHeader v-if="showHeader" />
    <div class="flex h-full">
      <AppSidebar v-if="showSidebar" />
      <main :class="showSidebar ? 'ml-64 w-full main-content' : 'w-full'">
        <RouterView /><!--pt-15-->
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-with-sidebar {
  background: #eff3f6;
}

@media (prefers-color-scheme: dark) {
  .app-with-sidebar {
    background: #1f2937;
  }
}

.main-content {
  border-top-left-radius: 16px;
  /*24*/
  background: white;
  overflow: hidden;
  margin-top: 60px;
  min-height: calc(100vh - 60px);
}

@media (prefers-color-scheme: dark) {
  .main-content {
    background: #1e293b;
  }
}
</style>