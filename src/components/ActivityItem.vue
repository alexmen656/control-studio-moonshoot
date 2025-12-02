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
                    <path v-else-if="activity.type === 'published'" fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd" />
                    <path v-else-if="activity.type === 'edited'"
                        d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    <path v-else-if="activity.type === 'failed'" fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clip-rule="evenodd" />
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
                        'px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 flex items-center gap-1',
                        activity.status === 'success'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : activity.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    ]">
                        <svg v-if="activity.status === 'success'" class="w-3.5 h-3.5" fill="currentColor"
                            viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                        <svg v-else-if="activity.status === 'failed'" class="w-3.5 h-3.5" fill="currentColor"
                            viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clip-rule="evenodd" />
                        </svg>
                        <svg v-else-if="activity.status === 'pending'" class="w-3.5 h-3.5" fill="currentColor"
                            viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clip-rule="evenodd" />
                        </svg>
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
            <div class="flex-shrink-0">
                <img v-if="generatedThumbnail" :src="generatedThumbnail" alt="Thumbnail"
                    class="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700">
                <div v-else-if="isLoadingThumbnail"
                    class="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                    <div class="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div v-else
                    class="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                    <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                </div>
            </div>
        </div>
        <video v-if="videoUrl && !generatedThumbnail" ref="hiddenVideo" :src="videoUrl" @loadeddata="generateThumbnail"
            @error="onVideoError" class="hidden" muted preload="metadata" crossorigin="anonymous"></video>
        <canvas ref="thumbnailCanvas" class="hidden"></canvas>
    </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

interface Activity {
    id: string;
    type: 'upload' | 'scheduled' | 'published' | 'edited' | 'deleted' | 'failed';
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
    data() {
        return {
            thumbnailError: false,
            generatedThumbnail: null as string | null,
            isLoadingThumbnail: true
        };
    },
    computed: {
        videoUrl(): string | null {
            const thumbnail = this.activity.thumbnail;
            if (!thumbnail) return null;

            if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) {
                return null;
            }

            const isProd = window.location.hostname !== 'localhost';
            const baseUrl = isProd ? 'https://api.reelmia.com' : 'http://localhost:6709';
            return `${baseUrl}/uploads/${thumbnail}`;
        },
        getIconBackground(): string {
            const backgrounds: Record<string, string> = {
                upload: 'bg-blue-100 dark:bg-blue-900/30',
                scheduled: 'bg-purple-100 dark:bg-purple-900/30',
                published: 'bg-green-100 dark:bg-green-900/30',
                edited: 'bg-yellow-100 dark:bg-yellow-900/30',
                deleted: 'bg-orange-100 dark:bg-orange-900/30',
                failed: 'bg-red-100 dark:bg-red-900/30'
            };
            return backgrounds[this.activity.type] || 'bg-gray-100 dark:bg-gray-700';
        },
        getIconColor(): string {
            const colors: Record<string, string> = {
                upload: 'text-blue-600 dark:text-blue-400',
                scheduled: 'text-purple-600 dark:text-purple-400',
                published: 'text-green-600 dark:text-green-400',
                edited: 'text-yellow-600 dark:text-yellow-400',
                deleted: 'text-orange-600 dark:text-orange-400',
                failed: 'text-red-600 dark:text-red-400'
            };
            return colors[this.activity.type] || 'text-gray-600 dark:text-gray-400';
        }
    },
    mounted() {
        // Check if we have a cached thumbnail
        const cacheKey = `thumb_${this.activity.thumbnail}`;
        const cachedThumb = sessionStorage.getItem(cacheKey);
        if (cachedThumb) {
            this.generatedThumbnail = cachedThumb;
            this.isLoadingThumbnail = false;
        } else if (!this.videoUrl) {
            this.isLoadingThumbnail = false;
        }
    },
    methods: {
        generateThumbnail() {
            const video = this.$refs.hiddenVideo as HTMLVideoElement;
            const canvas = this.$refs.thumbnailCanvas as HTMLCanvasElement;

            if (!video || !canvas) {
                this.isLoadingThumbnail = false;
                return;
            }
            video.currentTime = 0.5;

            video.onseeked = () => {
                if (video.videoWidth > 0 && video.videoHeight > 0) {
                    canvas.width = 128;
                    canvas.height = 128;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        const scale = Math.max(128 / video.videoWidth, 128 / video.videoHeight);
                        const w = video.videoWidth * scale;
                        const h = video.videoHeight * scale;
                        const x = (128 - w) / 2;
                        const y = (128 - h) / 2;

                        ctx.drawImage(video, x, y, w, h);
                        const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
                        this.generatedThumbnail = thumbnail;

                        const cacheKey = `thumb_${this.activity.thumbnail}`;
                        try {
                            sessionStorage.setItem(cacheKey, thumbnail);
                        } catch (e) {
                            // Session storage might be full
                        }
                    }
                }
                this.isLoadingThumbnail = false;
            };
        },
        onVideoError() {
            this.isLoadingThumbnail = false;
        },
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
