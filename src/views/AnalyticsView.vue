<template>
    <div class="p-8 max-w-7xl mx-auto dark:bg-gray-900 h-full">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
            <div class="flex gap-4 items-center">
                <select v-model="selectedPlatform" @change="fetchAnalytics"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-sm bg-white hover:border-red-500 focus:outline-none focus:border-red-500 focus:ring-3 focus:ring-red-100 transition-all cursor-pointer">
                    <option value="">All Platforms</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                </select>
                <button @click="fetchAnalytics" :disabled="loading"
                    class="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5">
                    <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                    </svg>
                    <span v-if="loading">Loading...</span>
                    <span v-else>Refresh</span>
                </button>
            </div>
        </div>
        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-4">
            {{ error }}
        </div>
        <div v-if="loading" class="flex flex-col items-center justify-center py-16 gap-4">
            <div
                class="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-red-600 rounded-full animate-spin">
            </div>
            <p class="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
        <div v-else-if="analytics">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div
                    class="bg-white rounded-xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 dark:bg-gray-800 border dark:border-gray-700 shadow-sm hover:shadow-lg border border-gray-200">
                    <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Views</h3>
                        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{
                            formatNumber(analytics.totalViews) }}</p>
                    </div>
                </div>
                <div
                    class="bg-white rounded-xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 dark:bg-gray-800 border dark:border-gray-700 shadow-sm hover:shadow-lg border border-gray-200">
                    <div class="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path
                                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
                            </path>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Likes</h3>
                        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{
                            formatNumber(analytics.totalLikes) }}</p>
                    </div>
                </div>
                <div
                    class="bg-white rounded-xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 dark:bg-gray-800 border dark:border-gray-700 shadow-sm hover:shadow-lg border border-gray-200">
                    <div class="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Comments</h3>
                        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{
                            formatNumber(analytics.totalComments) }}</p>
                    </div>
                </div>
                <div
                    class="bg-white rounded-xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 dark:bg-gray-800 border dark:border-gray-700 shadow-sm hover:shadow-lg border border-gray-200">
                    <div class="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Videos</h3>
                        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{
                            formatNumber(analytics.totalVideos) }}</p>
                    </div>
                </div>
                <div v-if="analytics.totalShares > 0"
                    class="bg-white rounded-xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 dark:bg-gray-800 border dark:border-gray-700 shadow-sm hover:shadow-lg border border-gray-200">
                    <div class="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Shares</h3>
                        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{
                            formatNumber(analytics.totalShares) }}</p>
                    </div>
                </div>
            </div>
            <div v-if="Object.keys(analytics.platforms).length > 0" class="mb-8">
                <h2 class="text-2xl font-semibold text-gray-900 mb-4 dark:text-gray-100">Platform Breakdown</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div v-for="(stats, platform) in analytics.platforms" :key="platform"
                        class="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-8 h-8">
                                <img v-if="platform === 'youtube'"
                                    src="https://img.icons8.com/color/48/youtube-play.png" alt="YouTube"
                                    class="w-full h-full" />
                                <img v-else-if="platform === 'tiktok'"
                                    src="https://img.icons8.com/color/48/tiktok--v1.png" alt="TikTok"
                                    class="w-full h-full" />
                                <img v-else-if="platform === 'instagram'"
                                    src="https://img.icons8.com/color/48/instagram-new.png" alt="Instagram"
                                    class="w-full h-full" />
                                <img v-else-if="platform === 'facebook'"
                                    src="https://img.icons8.com/color/48/facebook.png" alt="Facebook"
                                    class="w-full h-full" />
                            </div>
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">{{ platform }}
                            </h3>
                        </div>
                        <div v-if="stats.error" class="text-red-600 dark:text-red-400 text-sm">
                            {{ stats.error }}
                        </div>
                        <div v-else class="space-y-3">
                            <div
                                class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Videos</span>
                                <span class="text-base font-semibold text-gray-900 dark:text-gray-100">{{
                                    formatNumber(stats.videos)
                                    }}</span>
                            </div>
                            <div
                                class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Views</span>
                                <span class="text-base font-semibold text-gray-900 dark:text-gray-100">{{
                                    formatNumber(stats.views)
                                    }}</span>
                            </div>
                            <div
                                class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Likes</span>
                                <span class="text-base font-semibold text-gray-900 dark:text-gray-100">{{
                                    formatNumber(stats.likes)
                                    }}</span>
                            </div>
                            <div
                                class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Comments</span>
                                <span class="text-base font-semibold text-gray-900 dark:text-gray-100">{{
                                    formatNumber(stats.comments)
                                    }}</span>
                            </div>
                            <div v-if="stats.shares > 0" class="flex justify-between items-center py-2">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Shares</span>
                                <span class="text-base font-semibold text-gray-900 dark:text-gray-100">{{
                                    formatNumber(stats.shares)
                                    }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="analytics.videos && analytics.videos.length > 0">
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Videos</h2>
                <div class="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Platform</th>
                                    <th v-if="analytics.videos[0].title"
                                        class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Title</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Views</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Likes</th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Comments</th>
                                    <th v-if="analytics.videos[0].shares !== undefined"
                                        class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Shares</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                <tr v-for="(video, index) in analytics.videos" :key="index"
                                    class="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="inline-flex px-3 py-1 rounded-md text-xs font-semibold uppercase"
                                            :class="{
                                                'bg-red-100 text-red-700': video.platform === 'youtube',
                                                'bg-blue-100 text-blue-700': video.platform === 'tiktok',
                                                'bg-purple-100 text-purple-700': video.platform === 'instagram',
                                                'bg-blue-100 text-blue-700': video.platform === 'facebook'
                                            }">
                                            {{ video.platform }}
                                        </span>
                                    </td>
                                    <td v-if="video.title" class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{{
                                        video.title }}
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{{
                                        formatNumber(video.views) }}</td>
                                    <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{{
                                        formatNumber(video.likes) }}</td>
                                    <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{{
                                        formatNumber(video.comments) }}</td>
                                    <td v-if="video.shares !== undefined"
                                        class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{{
                                            formatNumber(video.shares) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="mb-4 opacity-50">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <h2 class="text-2xl font-semibold mb-2 dark:text-gray-100">No Analytics Data</h2>
            <p class="text-base dark:text-gray-300">Connect your social media accounts to see analytics</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const analytics = ref(null)
const loading = ref(false)
const error = ref(null)
const selectedPlatform = ref('')

const fetchAnalytics = async () => {
    loading.value = true
    error.value = null

    try {
        const params = {}
        if (selectedPlatform.value) {
            params.platform = selectedPlatform.value
        }

        const response = await axios.get('http://localhost:6709/api/analytics/total', { params })
        analytics.value = response.data

        if (response.data.error) {
            error.value = response.data.error
        }
    } catch (err) {
        console.error('Error fetching analytics:', err)
        error.value = 'Failed to load analytics. Please try again.'
    } finally {
        loading.value = false
    }
}

const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
}

onMounted(() => {
    fetchAnalytics()
})
</script>