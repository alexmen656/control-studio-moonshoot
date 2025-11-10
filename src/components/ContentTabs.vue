<script setup lang="ts">
import { computed } from 'vue'

interface Tab {
  id: string
  label: string
  icon: string
  count: number
}

interface Props {
  activeTab: string
  tabs: Tab[]
}

interface Emits {
  (e: 'update:activeTab', value: string): void
}

defineProps<Props>()
defineEmits<Emits>()

const tabContent = computed(() => ({
  videos: { icon: '🎬', label: 'Videos' },
  images: { icon: '📷', label: 'Images' },
  text: { icon: '✍️', label: 'Text' },
  all: { icon: '📋', label: 'Alle' }
}))
</script>

<template>
  <div class="flex items-center gap-4 overflow-x-auto scrollbar-hide">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      @click="$emit('update:activeTab', tab.id)"
      :class="[
        'flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap transition-all rounded-md',
        activeTab === tab.id
          ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 font-bold'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
      ]"
      :title="`${tab.label} (${tab.count})`">
      <span class="text-base">{{ tab.icon }}</span>
      <span class="text-xs">{{ tab.label }}</span>
      <span class="text-xs font-normal">{{ tab.count }}</span>
    </button>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
