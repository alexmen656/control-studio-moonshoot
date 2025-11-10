<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const showDropdown = ref(false)

const postTypes = [
  { value: 'all', label: 'All', icon: '📋' },
  { value: 'videos', label: 'Videos', icon: '🎬' },
  { value: 'images', label: 'Images', icon: '📷' },
  { value: 'text', label: 'Text', icon: '✍️' }
]

const selectType = (value: string) => {
  emit('update:modelValue', value)
  showDropdown.value = false
}

const getSelectedType = (value: string) => {
  return postTypes.find(t => t.value === value) || postTypes[0]!
}
</script>

<template>
  <div class="relative">
    <button
      @click="showDropdown = !showDropdown"
      class="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
      <span class="font-medium">Post Type is</span>
      <span class="text-gray-900 dark:text-gray-100">{{ getSelectedType(modelValue).label }}</span>
      <svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
    
    <div
      v-if="showDropdown"
      @click.stop
      class="absolute top-full mt-1 right-0 min-w-[200px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
    >
      <button
        v-for="type in postTypes"
        :key="type.value"
        @click="selectType(type.value)"
        :class="[
          'w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left',
          modelValue === type.value ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-300'
        ]"
      >
        <span class="text-base">{{ type.icon }}</span>
        <span>{{ type.label }}</span>
        <svg v-if="modelValue === type.value" class="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Dropdown backdrop */
</style>
