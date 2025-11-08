<template>
    <div
        class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
        <div class="flex items-start gap-4">
            <div :class="[
                'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                getIconBackground
            ]">
                <svg class="w-5 h-5" :class="getIconColor" fill="currentColor" viewBox="0 0 20 20">
                    <path v-if="activity.type === 'upload'" fill-rule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                        clip-rule="evenodd" />
                    <path v-else-if="activity.type === 'scheduled'" fill-rule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clip-rule="evenodd" />
                    <path v-else-if="activity.type === 'published'"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    <path v-else-if="activity.type === 'edited'"
                        d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    <path v-else fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd" />
                </svg>
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                    <div class="flex-1">
                        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {{ activity.title }}
                        </h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            {{ activity.description }}
                        </p>
                    </div>
                    <div v-if="activity.status" :class="[
                        'px-2 py-1 rounded-full text-xs font-medium flex-shrink-0',
                        activity.status === 'success'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : activity.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    ]">
                        {{ activity.status }}
                    </div>
                </div>
                <div v-if="activity.platforms && activity.platforms.length > 0" class="flex gap-2 mt-3">
                    <div v-for="platform in activity.platforms" :key="platform"
                        class="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300">
                        <span :class="getPlatformIcon(platform)"></span>
                        <span class="capitalize">{{ platform }}</span>
                    </div>
                </div>
                <div class="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clip-rule="evenodd" />
                    </svg>
                    <span>{{ formatTimestamp(activity.timestamp) }}</span>
                </div>
            </div>
            <div v-if="activity.thumbnail" class="flex-shrink-0">
                <img :src="activity.thumbnail" alt="Thumbnail"
                    class="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700">
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

interface Activity {
    id: string;
    type: 'upload' | 'scheduled' | 'published' | 'edited' | 'deleted';
    title: string;
    description: string;
    timestamp: Date;
    platforms?: string[];
    thumbnail?: string;
    status?: 'success' | 'pending' | 'failed';
}

export default defineComponent({
    name: 'ActivityItem',
    props: {
        activity: {
            type: Object as PropType<Activity>,
            required: true
        }
    },
    computed: {
        getIconBackground(): string {
            const backgrounds = {
                upload: 'bg-blue-100 dark:bg-blue-900/30',
                scheduled: 'bg-purple-100 dark:bg-purple-900/30',
                published: 'bg-green-100 dark:bg-green-900/30',
                edited: 'bg-yellow-100 dark:bg-yellow-900/30',
                deleted: 'bg-red-100 dark:bg-red-900/30'
            };
            return backgrounds[this.activity.type] || 'bg-gray-100 dark:bg-gray-700';
        },
        getIconColor(): string {
            const colors = {
                upload: 'text-blue-600 dark:text-blue-400',
                scheduled: 'text-purple-600 dark:text-purple-400',
                published: 'text-green-600 dark:text-green-400',
                edited: 'text-yellow-600 dark:text-yellow-400',
                deleted: 'text-red-600 dark:text-red-400'
            };
            return colors[this.activity.type] || 'text-gray-600 dark:text-gray-400';
        }
    },
    methods: {
        formatTimestamp(date: Date): string {
            const now = new Date();
            const diff = now.getTime() - new Date(date).getTime();
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (minutes < 1) return 'Just now';
            if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
            if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
            if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;

            return new Date(date).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        getPlatformIcon(platform: string): string {
            const icons: Record<string, string> = {
                youtube: '🎥',
                instagram: '📷',
                tiktok: '🎵',
                facebook: '👥'
            };
            return icons[platform.toLowerCase()] || '📱';
        }
    }
});
</script>
