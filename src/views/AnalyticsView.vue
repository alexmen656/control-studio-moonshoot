<template>
    <div class="w-full dark:bg-gray-900 min-h-full">
        <div class="p-8 max-w-7xl mx-auto h-full">
            <div class="flex justify-between items-center mb-8">
                <div class="flex items-center gap-3">
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
                    <span
                        class="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full text-xs font-semibold">Beta</span>
                </div>
                <div class="flex gap-4 items-center">
                    <select v-model="selectedPlatform" @change="fetchAnalytics"
                        class="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-sm bg-white hover:border-violet-500 focus:outline-none focus:border-orange-500 focus:ring-3 focus:ring-orange-100 transition-all cursor-pointer">
                        <option value="">All Platforms</option>
                        <option value="youtube">YouTube</option>
                        <!-- <option value="tiktok">TikTok</option> -->
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <!-- <option value="reddit">Reddit</option> -->
                        <!-- <option value="x">X</option> -->
                    </select>
                    <button @click="fetchAnalytics" :disabled="loading"
                        class="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5">
                        <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <path
                                d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                        </svg>
                        <span v-if="loading">Loading...</span>
                        <span v-else>Refresh</span>
                    </button>
                </div>
            </div>
            <div v-if="error"
                class="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 p-4 rounded-lg mb-4">
                {{ error }}
            </div>
            <div v-if="loading" class="flex flex-col items-center justify-center py-16 gap-4">
                <div
                    class="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-red-600 rounded-full animate-spin">
                </div>
                <p class="text-gray-600 dark:text-gray-400">Loading analytics...</p>
            </div>
            <div v-else-if="analytics">
                <div class="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-sm p-6 mb-8">
                    <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">View-Entwicklung (Letzte
                        48h)</h2>
                    <div v-if="hourlyData" class="h-80">
                        <canvas ref="chartCanvas"></canvas>
                    </div>
                    <div v-else class="h-80 flex items-center justify-center">
                        <div class="text-gray-500 dark:text-gray-400">Lade Chart-Daten...</div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div
                        class="bg-white rounded-xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 dark:bg-gray-800 border dark:border-gray-700 shadow-sm hover:shadow-lg border border-gray-200">
                        <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
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
                        <div
                            class="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
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
                    <div v-if="analytics.totalShares && analytics.totalShares > 0"
                        class="bg-white rounded-xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 dark:bg-gray-800 border dark:border-gray-700 shadow-sm hover:shadow-lg border border-gray-200">
                        <div
                            class="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
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
                        <div v-for="(stats, platform) in analytics.platforms"
                            v-show="platform == 'youtube' || platform == 'instagram' || platform == 'facebook'"
                            :key="platform"
                            class="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                            <div class="flex items-center gap-3 mb-4">
                                <div class="w-8 h-8">
                                    <img v-if="platform === 'youtube'"
                                        src="https://img.icons8.com/color/48/youtube-play.png" alt="YouTube"
                                        class="w-full h-full" />
                                    <!-- <img v-else-if="platform === 'tiktok'"
                                    src="https://img.icons8.com/color/48/tiktok--v1.png" alt="TikTok"
                                    class="w-full h-full" /> -->
                                    <img v-else-if="platform === 'instagram'"
                                        src="https://img.icons8.com/color/48/instagram-new.png" alt="Instagram"
                                        class="w-full h-full" />
                                    <img v-else-if="platform === 'facebook'"
                                        src="https://img.icons8.com/color/48/facebook.png" alt="Facebook"
                                        class="w-full h-full" />
                                    <!-- <img v-else-if="platform === 'reddit'"
                                    src="https://img.icons8.com/color/48/reddit.png" alt="Reddit"
                                    class="w-full h-full" /> -->
                                    <!-- <img v-else-if="platform === 'x'"
                                    src="https://img.icons8.com/color/48/x.png" alt="X"
                                    class="w-full h-full" /> -->
                                </div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">{{
                                    platform }}
                                </h3>
                            </div>
                            <div v-if="stats.error" class="text-orange-600 dark:text-orange-400 text-sm">
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
                                <div v-if="stats.shares && stats.shares > 0"
                                    class="flex justify-between items-center py-2">
                                    <span class="text-sm text-gray-600 dark:text-gray-400">Shares</span>
                                    <span class="text-base font-semibold text-gray-900 dark:text-gray-100">{{
                                        formatNumber(stats.shares)
                                    }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="allVideos && allVideos.length > 0" class="mt-8">
                    <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Alle Videos</h2>
                    <div
                        class="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th
                                            class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            Platform</th>
                                        <th
                                            class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            Titel</th>
                                        <th
                                            class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            Views</th>
                                        <th
                                            class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            Likes</th>
                                        <th
                                            class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            Comments</th>
                                        <th
                                            class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            Shares</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                    <tr v-for="(video, index) in allVideos" :key="index"
                                        class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span
                                                class="inline-flex px-3 py-1 rounded-md text-xs font-semibold uppercase"
                                                :class="{
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300': video.platform === 'youtube',
                                                    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300': video.platform === 'instagram',
                                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300': video.platform === 'facebook',
                                                }">
                                                <!-- 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300': video.platform === 'tiktok', -->
                                                <!-- 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300': video.platform === 'x', -->
                                                <!-- 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300': video.platform === 'reddit' -->
                                                {{ video.platform }}
                                            </span>
                                        </td>
                                        <td
                                            class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-md truncate">
                                            {{ video.title || '-' }}
                                        </td>
                                        <td class="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {{ formatNumber(video.views) }}
                                        </td>
                                        <td class="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {{ formatNumber(video.likes) }}
                                        </td>
                                        <td class="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {{ formatNumber(video.comments) }}
                                        </td>
                                        <td class="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {{ formatNumber(video.shares) }}
                                        </td>
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
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import axios from '../axios'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

interface Video {
    title?: string
    views?: number
    likes?: number
    comments?: number
    shares?: number
    platform?: string
}

interface PlatformStats {
    views: number
    likes: number
    comments: number
    shares?: number
    videos: number
    error?: string
}

interface Analytics {
    totalViews: number
    totalLikes: number
    totalComments: number
    totalVideos: number
    totalShares?: number
    platforms: Record<string, PlatformStats>
    videos?: Video[]
    error?: string
}

interface HourlyData {
    labels: string[]
    data: number[]
    totalViews: number
    hours: number
}

const analytics = ref<Analytics | null>(null)
const hourlyData = ref<HourlyData | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const selectedPlatform = ref('')
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let viewsChart: Chart | null = null

const allVideos = computed(() => {
    if (!analytics.value?.videos) return []

    return analytics.value.videos.sort((a, b) => {
        const viewsA = a.views || 0
        const viewsB = b.views || 0
        return viewsB - viewsA
    })
})

watch([hourlyData, chartCanvas], async ([newHourlyData, newChartCanvas]) => {
    if (newHourlyData && newChartCanvas) {
        console.log('Watch triggered - creating chart')
        await nextTick()
        setTimeout(() => {
            createViewsChart()
        }, 100)
    }
}, { immediate: false })

const createViewsChart = () => {
    if (!chartCanvas.value || !hourlyData.value) {
        console.log('Chart canvas or hourly data not available yet', {
            canvas: chartCanvas.value,
            data: hourlyData.value
        })
        return
    }

    console.log('Creating views chart with data:', hourlyData.value)

    if (viewsChart) {
        viewsChart.destroy()
    }

    const ctx = chartCanvas.value.getContext('2d')
    if (!ctx) {
        console.error('Failed to get 2d context')
        return
    }

    viewsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: hourlyData.value.labels,
            datasets: [{
                label: 'Views pro Stunde',
                data: hourlyData.value.data,
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgba(220, 38, 38, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    padding: 12,
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#374151',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        label: (context: any) => {
                            return `${formatNumber(context.parsed.y || 0)} Views`
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        color: '#9CA3AF',
                        font: {
                            size: 10
                        },
                        callback: function (value: any, index: number) {
                            return index % 4 === 0 ? hourlyData.value?.labels[value] : ''
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(156, 163, 175, 0.1)'
                    },
                    ticks: {
                        color: '#9CA3AF',
                        callback: function (value: any) {
                            return formatNumber(value as number)
                        }
                    }
                }
            }
        }
    })
}

const fetchHourlyData = async () => {
    try {
        if (selectedPlatform.value) {
            const PROJECT_ID = localStorage.getItem('currentProjectId');
            const response = await axios.get(
                `http://localhost:6709/api/analytics/live/projects/${PROJECT_ID}/platforms/${selectedPlatform.value}/24h?project_id=${PROJECT_ID}`
            )
            console.log('Fetched 24h live data:', response.data)

            const analytics24h = response.data.analytics || []
            const labels = analytics24h.map((d: any) =>
                new Date(d.collected_at).toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            )
            const data = analytics24h.map((d: any) => d.total_views || 0)

            hourlyData.value = {
                labels,
                data,
                totalViews: data.reduce((sum: number, val: number) => sum + val, 0),
                hours: 24
            }
        } else {
            const PROJECT_ID = localStorage.getItem('currentProjectId');
            const response = await axios.get(`http://localhost:6709/api/analytics/live/projects/${PROJECT_ID}/latest?project_id=${PROJECT_ID}`)
            const platforms = response.data.platforms || []

            const filteredPlatforms = platforms.filter((p: any) =>
                p.platform !== 'tiktok' && p.platform !== 'reddit' && p.platform !== 'x'
            )

            const labels = filteredPlatforms.map((p: any) => p.platform)
            const data = filteredPlatforms.map((p: any) => p.total_views || 0)

            hourlyData.value = {
                labels,
                data,
                totalViews: data.reduce((sum: number, val: number) => sum + val, 0),
                hours: 0
            }
        }
    } catch (err) {
        console.error('Error fetching hourly data:', err)
        try {
            const params: Record<string, string> = { hours: '48' }
            if (selectedPlatform.value) {
                params.platform = selectedPlatform.value
            }
            const PROJECT_ID = localStorage.getItem('currentProjectId');
            const response = await axios.get(`http://localhost:6709/api/analytics/hourly?project_id=${PROJECT_ID}`, { params })
            hourlyData.value = response.data
        } catch (fallbackErr) {
            console.error('Error fetching fallback hourly data:', fallbackErr)
        }
    }
}

const fetchAnalytics = async () => {
    loading.value = true
    error.value = null

    try {
        if (selectedPlatform.value) {
            const PROJECT_ID = localStorage.getItem('currentProjectId');

            const [latestResponse, contentResponse] = await Promise.all([
                axios.get(`http://localhost:6709/api/analytics/live/projects/${PROJECT_ID}/platforms/${selectedPlatform.value}/24h?project_id=${PROJECT_ID}`),
                axios.get(`http://localhost:6709/api/analytics/live/projects/${PROJECT_ID}/platforms/${selectedPlatform.value}/content?limit=50&sortBy=views&project_id=${PROJECT_ID}`),
                fetchHourlyData()
            ])

            const analyticsData = latestResponse.data.analytics || []
            const latest = analyticsData.length > 0 ? analyticsData[0] : {}
            const content = contentResponse.data.content || []

            analytics.value = {
                totalViews: Number(latest.total_views) || 0,
                totalLikes: Number(latest.total_likes) || 0,
                totalComments: Number(latest.total_comments) || 0,
                totalVideos: Number(latest.total_videos || latest.total_posts || latest.total_tweets) || 0,
                totalShares: Number(latest.total_shares || latest.total_retweets) || 0,
                platforms: {
                    [selectedPlatform.value]: {
                        views: Number(latest.total_views) || 0,
                        likes: Number(latest.total_likes) || 0,
                        comments: Number(latest.total_comments) || 0,
                        shares: Number(latest.total_shares || latest.total_retweets) || 0,
                        videos: Number(latest.total_videos || latest.total_posts || latest.total_tweets) || 0
                    }
                },
                videos: content.map((item: any) => ({
                    platform: item.platform || selectedPlatform.value,
                    title: item.title || 'Untitled',
                    views: Number(item.views) || 0,
                    likes: Number(item.likes) || 0,
                    comments: Number(item.comments) || 0,
                    shares: Number(item.shares || item.retweets) || 0
                }))
            }
        } else {
            const PROJECT_ID = localStorage.getItem('currentProjectId') || '2';
            const [overviewResponse] = await Promise.all([
                axios.get(`http://localhost:6709/api/analytics/live/projects/${PROJECT_ID}/overview?project_id=${PROJECT_ID}`),
                fetchHourlyData()
            ])

            const overview = overviewResponse.data
            const platforms = overview.platforms || []
            const totals = overview.totals || {}

            const platformsMap: Record<string, PlatformStats> = {}
            const allVideos: Video[] = []

            for (const platform of platforms) {
                platformsMap[platform.platform] = {
                    views: Number(platform.total_views) || 0,
                    likes: Number(platform.total_likes) || 0,
                    comments: Number(platform.total_comments) || 0,
                    shares: Number(platform.total_shares || platform.total_retweets) || 0,
                    videos: Number(platform.total_content) || 0
                }

                try {
                    const PROJECT_ID = localStorage.getItem('currentProjectId') || '2';
                    const contentResponse = await axios.get(
                        `http://localhost:6709/api/analytics/live/projects/${PROJECT_ID}/platforms/${platform.platform}/content?limit=10&sortBy=views`
                    )
                    const content = contentResponse.data.content || []
                    allVideos.push(...content.map((item: any) => ({
                        platform: platform.platform,
                        title: item.title || 'Untitled',
                        views: Number(item.views) || 0,
                        likes: Number(item.likes) || 0,
                        comments: Number(item.comments) || 0,
                        shares: Number(item.shares || item.retweets) || 0
                    })))
                } catch (err) {
                    console.error(`Error fetching content for ${platform.platform}:`, err)
                }
            }

            const totalViews = Object.values(platformsMap).reduce((sum, p) => sum + (p.views || 0), 0)
            const totalLikes = Object.values(platformsMap).reduce((sum, p) => sum + (p.likes || 0), 0)
            const totalComments = Object.values(platformsMap).reduce((sum, p) => sum + (p.comments || 0), 0)
            const totalVideos = Object.values(platformsMap).reduce((sum, p) => sum + (p.videos || 0), 0)
            const totalShares = Object.values(platformsMap).reduce((sum, p) => sum + (p.shares || 0), 0)

            analytics.value = {
                totalViews,
                totalLikes,
                totalComments,
                totalVideos,
                totalShares,
                platforms: platformsMap,
                videos: allVideos
            }
        }

        console.log('Live analytics data loaded:', analytics.value)
    } catch (err) {
        console.error('Error fetching live analytics, falling back to old endpoint:', err)

        try {
            const params: Record<string, string> = {}
            if (selectedPlatform.value) {
                params.platform = selectedPlatform.value
            }

            const PROJECT_ID = localStorage.getItem('currentProjectId') || '2';

            const [analyticsResponse] = await Promise.all([
                axios.get(`http://localhost:6709/api/analytics/total`, {
                    params: {
                        project_id: PROJECT_ID,
                        ...params
                    }
                }),
                fetchHourlyData()
            ])

            analytics.value = analyticsResponse.data

            if (analyticsResponse.data.error) {
                error.value = analyticsResponse.data.error
            }
        } catch (fallbackErr) {
            console.error('Error fetching fallback analytics:', fallbackErr)
            error.value = 'Failed to load analytics. Please try again.'
        }
    } finally {
        loading.value = false
    }
}

const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '0'
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
}

let refreshInterval: number | null = null

onMounted(() => {
    fetchAnalytics()

    refreshInterval = window.setInterval(() => {
        console.log('Auto-refreshing analytics...')
        fetchAnalytics()
    }, 300000)
})

import { onUnmounted } from 'vue'
onUnmounted(() => {
    if (refreshInterval) {
        clearInterval(refreshInterval)
    }
    if (viewsChart) {
        viewsChart.destroy()
    }
})
</script>