<template>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all overflow-hidden">
        <div class="p-6">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3 min-w-0 flex-1">
                    <div 
                        :class="[iconColor, 'flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center']"
                    >
                        <div :class="iconTextColor">
                            <slot name="icon"></slot>
                        </div>
                    </div>
                    <div class="min-w-0 flex-1">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{{ name }}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ subtitle }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0 ml-2">
                    <button 
                        @click="$emit('toggle-expand')"
                        class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        :title="expanded ? 'Hide formats' : 'Show supported formats'"
                    >
                        <svg 
                            class="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': expanded }"
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <span 
                        v-if="connected"
                        class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium rounded-full whitespace-nowrap"
                    >
                        Connected
                    </span>
                </div>
            </div>
            <div v-if="connected && connected !== true" class="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <div class="min-w-0 flex-1">
                        <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {{ typeof connected === 'object' ? (connected.username || connected.channel_name || connected.name || 'Connected') : 'Connected' }}
                        </p>
                        <p v-if="typeof connected === 'object' && connected.email" class="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {{ connected.email }}
                        </p>
                    </div>
                </div>
            </div>
            <transition
                enter-active-class="transition-all duration-300 ease-out"
                leave-active-class="transition-all duration-200 ease-in"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-40"
                leave-from-class="opacity-100 max-h-40"
                leave-to-class="opacity-0 max-h-0"
            >
                <div v-if="expanded" class="mb-4 overflow-hidden">
                    <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p class="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2">Supported Formats:</p>
                        <div class="flex flex-wrap gap-1.5">
                            <span 
                                v-for="format in formats" 
                                :key="format"
                                class="px-2 py-1 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 text-xs font-medium rounded border border-blue-300 dark:border-blue-700"
                            >
                                {{ format }}
                            </span>
                        </div>
                    </div>
                </div>
            </transition>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {{ description }}
            </p>
            <button 
                v-if="!connected" 
                @click="$emit('connect')"
                :class="[
                    'w-full px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2',
                    buttonGradient.startsWith('bg-') ? buttonGradient : `bg-gradient-to-r ${buttonGradient}`,
                    buttonTextColor || 'text-white'
                ]"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Connect {{ name }}
            </button>
            <button 
                v-else 
                @click="$emit('disconnect')"
                class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg transition-all font-medium"
            >
                Disconnect
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    platform: string
    name: string
    subtitle: string
    description: string
    connected: any
    expanded: boolean
    formats: string[]
    iconColor: string
    iconTextColor: string
    buttonGradient: string
    buttonTextColor?: string
}

defineProps<Props>()

defineEmits(['connect', 'disconnect', 'toggle-expand'])
</script>