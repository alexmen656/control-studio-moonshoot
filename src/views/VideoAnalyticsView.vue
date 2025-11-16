<template>
    <div class="w-full dark:bg-gray-900 min-h-screen">
        <div class="p-8 max-w-7xl mx-auto">
            <div class="flex justify-between items-start mb-8">
                <div>
                    <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Video Analytics
                    </h1>
                    <p class="text-gray-600 dark:text-gray-400">
                        Performance across all platforms
                    </p>
                </div>
                <div class="flex gap-3 items-center">
                    <select v-model="selectedTimeRange" @change="fetchVideoAnalytics"
                        class="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-sm bg-white hover:border-violet-500 focus:outline-none focus:border-orange-500 focus:ring-3 focus:ring-orange-100 transition-all cursor-pointer">
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="1y">Last year</option>
                    </select>
                    <button @click="fetchVideoAnalytics" :disabled="loading"
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
                class="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 p-4 rounded-lg mb-4 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {{ error }}
            </div>
            <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4">
                <div
                    class="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-orange-600 rounded-full animate-spin">
                </div>
                <p class="text-gray-600 dark:text-gray-400">Loading analytics...</p>
            </div>
            <div v-else-if="analyticsData">
                <div class="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 mb-8">
                    <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                        This video has been viewed 4 times
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div class="text-center">
                            <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Views</div>
                            <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{
                                formatNumber(analyticsData.totalViews) }}</div>
                        </div>
                        <div class="text-center">
                            <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Total watch time (hours)</div>
                            <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">0,1</div>
                        </div>
                        <div class="text-center">
                            <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Click-through rate</div>
                            <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">—</div>
                        </div>
                    </div>
                    <div class="h-64 mb-4">
                        <canvas ref="engagementChart"></canvas>
                    </div>
                    <button
                        class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                        Show more
                    </button>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 lg:col-span-2">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Real-time</h3>
                            <span
                                class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                Last updated
                            </span>
                        </div>
                        <div class="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">0</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400 mb-4">Views • Last 48 hours</div>
                        <div class="text-xs text-gray-400 dark:text-gray-500 text-center mt-8">
                            -48 h
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            Now
                        </div>
                        <button
                            class="w-full mt-6 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            Show more
                        </button>
                    </div>
                    <div class="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Engagement</h3>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Likes</span>
                                <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {{ formatNumber(analyticsData.totalLikes) }}
                                </span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Comments</span>
                                <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {{ formatNumber(analyticsData.totalComments) }}
                                </span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Shares</span>
                                <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {{ formatNumber(analyticsData.totalShares) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 mb-8">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Audience Retention</h3>
                    <div class="text-sm text-gray-500 dark:text-gray-400 mb-6">From the entire period</div>
                    <div class="text-center text-gray-500 dark:text-gray-400 py-12">
                        Not enough information to display audience retention and impressions and how you got discovered.
                    </div>
                </div>
                <div class="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 mb-8">
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                        Performance by Platform
                    </h2>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b border-gray-200 dark:border-gray-700">
                                    <th
                                        class="text-left py-3 px-0 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Platform
                                    </th>
                                    <th
                                        class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Views
                                    </th>
                                    <th
                                        class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Likes
                                    </th>
                                    <th
                                        class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Comments
                                    </th>
                                    <th
                                        class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Shares
                                    </th>
                                    <th
                                        class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Engagement
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                                <tr v-for="(platform, index) in sortedPlatforms" :key="index"
                                    class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td class="py-3 px-0">
                                        <div class="flex items-center gap-3">
                                            <div class="w-6 h-6">
                                                <img :src="getPlatformIcon(platform.name)" :alt="platform.name"
                                                    class="w-full h-full" />
                                            </div>
                                            <span class="font-medium text-gray-900 dark:text-gray-100 capitalize">
                                                {{ platform.name }}
                                            </span>
                                        </div>
                                    </td>
                                    <td class="text-right py-3 px-4 text-gray-900 dark:text-gray-100">
                                        {{ formatNumber(platform.views) }}
                                    </td>
                                    <td class="text-right py-3 px-4 text-gray-900 dark:text-gray-100">
                                        {{ formatNumber(platform.likes) }}
                                    </td>
                                    <td class="text-right py-3 px-4 text-gray-900 dark:text-gray-100">
                                        {{ formatNumber(platform.comments) }}
                                    </td>
                                    <td class="text-right py-3 px-4 text-gray-900 dark:text-gray-100">
                                        {{ formatNumber(platform.shares) }}
                                    </td>
                                    <td class="text-right py-3 px-4 text-gray-900 dark:text-gray-100">
                                        {{ platform.engagementRate }}%
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Chart from 'chart.js/auto'
import axios from '../axios'
import { useRoute } from 'vue-router'

interface PlatformData {
    name: string
    views: number
    likes: number
    comments: number
    shares: number
    engagementRate: number
}

interface AnalyticsData {
    totalViews: number
    totalLikes: number
    totalComments: number
    totalShares: number
    viewsGrowth: number
    likesGrowth: number
    commentsGrowth: number
    sharesGrowth: number
    platforms: PlatformData[]
}

const route = useRoute()
const videoId = computed(() => route.params.id as string)
const loading = ref(false)
const error = ref('')
const selectedTimeRange = ref('7d')
const engagementChart = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const analyticsData = ref<AnalyticsData | null>(null)

const sortedPlatforms = computed(() => {
    if (!analyticsData.value) return []
    return [...analyticsData.value.platforms].sort((a, b) => b.views - a.views)
})

const engagementBreakdown = computed(() => {
    if (!analyticsData.value) return { likes: 0, comments: 0, shares: 0 }
    const total =
        analyticsData.value.totalLikes +
        analyticsData.value.totalComments +
        analyticsData.value.totalShares
    return {
        likes: total > 0 ? Math.round((analyticsData.value.totalLikes / total) * 100) : 0,
        comments:
            total > 0 ? Math.round((analyticsData.value.totalComments / total) * 100) : 0,
        shares: total > 0 ? Math.round((analyticsData.value.totalShares / total) * 100) : 0
    }
})

function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
}

function getPlatformIcon(platform: string): string {
    const icons: { [key: string]: string } = {
        youtube: 'https://img.icons8.com/color/48/youtube-play.png',
        tiktok: 'https://img.icons8.com/color/48/tiktok--v1.png',
        instagram: 'https://img.icons8.com/color/48/instagram-new.png',
        facebook: 'https://img.icons8.com/color/48/facebook.png',
        x: 'https://img.icons8.com/color/48/twitter.png',
        reddit: 'https://img.icons8.com/color/48/reddit.png'
    }
    return icons[platform] || ''
}

function initEngagementChart() {
    if (!engagementChart.value || !analyticsData.value) return

    const ctx = engagementChart.value.getContext('2d')
    if (!ctx) return

    if (chartInstance) {
        chartInstance.destroy()
    }

    const timePoints = ['0', '4', '8', '12', '16', '20', '24 days']
    const labels = timePoints
    const viewsData = [1, 2, 3, 4, 4, 4, 4]

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Views',
                    data: viewsData,
                    borderColor: '#0066CC',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    tension: 0.2,
                    fill: true,
                    pointBackgroundColor: '#0066CC',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 1,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 6,
                    ticks: {
                        stepSize: 2,
                        color: document.documentElement.classList.contains('dark')
                            ? '#9ca3af'
                            : '#6b7280',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: document.documentElement.classList.contains('dark')
                            ? 'rgba(75, 85, 99, 0.2)'
                            : 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: document.documentElement.classList.contains('dark')
                            ? '#9ca3af'
                            : '#6b7280',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    })
}

async function fetchVideoAnalytics() {
    loading.value = true
    error.value = ''

    try {
        const PROJECT_ID = localStorage.getItem('currentProjectId')
        
        if (!PROJECT_ID || !videoId.value) {
            error.value = 'Project ID or Video ID not found'
            return
        }

        const response = await axios.get(
            `http://localhost:6709/api/analytics/live/projects/${PROJECT_ID}/videos/${videoId.value}?project_id=${PROJECT_ID}`
        )

        const data = response.data
        console.log('Video analytics response:', data)

        const platformsData: PlatformData[] = data.platforms.map((platform: any) => ({
            name: platform.platform,
            views: platform.views,
            likes: platform.likes,
            comments: platform.comments,
            shares: platform.shares,
            engagementRate: platform.engagement_rate
        }))

        analyticsData.value = {
            totalViews: data.total_views,
            totalLikes: data.total_likes,
            totalComments: data.total_comments,
            totalShares: data.total_shares,
            viewsGrowth: 0,
            likesGrowth: 0,
            commentsGrowth: 0,
            sharesGrowth: 0,
            platforms: platformsData
        }

        setTimeout(() => {
            initEngagementChart()
        }, 100)
    } catch (err) {
        console.error('Error fetching video analytics:', err)
        error.value = err instanceof Error ? err.message : 'Failed to load analytics'
        
        setTimeout(() => {
            initEngagementChart()
        }, 100)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchVideoAnalytics()
})
</script>