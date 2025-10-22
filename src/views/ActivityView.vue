<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div class="max-w-4xl mx-auto">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Activity</h1>
                <p class="text-gray-600 dark:text-gray-400">Track all your posts, videos, and scheduled content</p>
            </div>
            <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button v-for="filter in filters" :key="filter.value" @click="activeFilter = filter.value" :class="[
                    'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                    activeFilter === filter.value
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                ]">
                    {{ filter.label }}
                </button>
            </div>
            <div class="space-y-6">
                <div v-if="getTodayActivities.length > 0">
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                        Today, {{ formatDate(new Date()) }}
                    </h2>
                    <div class="space-y-3">
                        <ActivityItem v-for="activity in getTodayActivities" :key="activity.id" :activity="activity" />
                    </div>
                </div>
                <div v-if="getYesterdayActivities.length > 0">
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
                        Yesterday, {{ formatDate(getYesterday()) }}
                    </h2>
                    <div class="space-y-3">
                        <ActivityItem v-for="activity in getYesterdayActivities" :key="activity.id"
                            :activity="activity" />
                    </div>
                </div>
                <div v-if="getEarlierActivities.length > 0">
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span class="w-2 h-2 bg-gray-300 rounded-full"></span>
                        Earlier
                    </h2>
                    <div class="space-y-3">
                        <ActivityItem v-for="activity in getEarlierActivities" :key="activity.id"
                            :activity="activity" />
                    </div>
                </div>
                <div v-if="filteredActivities.length === 0"
                    class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No activity yet</h3>
                    <p class="text-gray-600 dark:text-gray-400">Upload videos or schedule posts to see activity here</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ActivityItem from '../components/ActivityItem.vue';

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
    name: 'ActivityView',
    components: {
        ActivityItem
    },
    data() {
        return {
            activeFilter: 'all' as string,
            filters: [
                { label: 'All', value: 'all' },
                { label: 'Uploads', value: 'upload' },
                { label: 'Scheduled', value: 'scheduled' },
                { label: 'Published', value: 'published' },
                { label: 'Edited', value: 'edited' }
            ],
            activities: [
                {
                    id: '1',
                    type: 'upload',
                    title: 'Video uploaded: How to use Control Studio',
                    description: 'New video uploaded successfully',
                    timestamp: new Date(),
                    thumbnail: 'https://via.placeholder.com/150',
                    status: 'success'
                },
                {
                    id: '2',
                    type: 'scheduled',
                    title: 'Post scheduled for Instagram & TikTok',
                    description: 'Scheduled for tomorrow at 3:00 PM',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    platforms: ['instagram', 'tiktok'],
                    status: 'pending'
                },
                {
                    id: '3',
                    type: 'published',
                    title: 'Post published on YouTube',
                    description: 'Your video "Tutorial #1" is now live',
                    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    platforms: ['youtube'],
                    status: 'success'
                },
                {
                    id: '4',
                    type: 'edited',
                    title: 'Video metadata updated',
                    description: 'Changed title and description',
                    timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000),
                    status: 'success'
                },
                {
                    id: '5',
                    type: 'scheduled',
                    title: 'Post scheduled for Facebook',
                    description: 'Scheduled for Friday at 10:00 AM',
                    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
                    platforms: ['facebook'],
                    status: 'pending'
                }
            ] as Activity[]
        };
    },
    computed: {
        filteredActivities(): Activity[] {
            if (this.activeFilter === 'all') {
                return this.activities;
            }
            return this.activities.filter(a => a.type === this.activeFilter);
        },
        getTodayActivities(): Activity[] {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return this.filteredActivities.filter(a => {
                const activityDate = new Date(a.timestamp);
                activityDate.setHours(0, 0, 0, 0);
                return activityDate.getTime() === today.getTime();
            });
        },
        getYesterdayActivities(): Activity[] {
            const yesterday = this.getYesterday();
            yesterday.setHours(0, 0, 0, 0);
            return this.filteredActivities.filter(a => {
                const activityDate = new Date(a.timestamp);
                activityDate.setHours(0, 0, 0, 0);
                return activityDate.getTime() === yesterday.getTime();
            });
        },
        getEarlierActivities(): Activity[] {
            const yesterday = this.getYesterday();
            yesterday.setHours(0, 0, 0, 0);
            return this.filteredActivities.filter(a => {
                const activityDate = new Date(a.timestamp);
                activityDate.setHours(0, 0, 0, 0);
                return activityDate.getTime() < yesterday.getTime();
            });
        }
    },
    methods: {
        formatDate(date: Date): string {
            return date.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        },
        getYesterday(): Date {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return yesterday;
        }
    }
});
</script>