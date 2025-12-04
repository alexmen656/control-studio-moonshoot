<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const instance = getCurrentInstance()
const axios = instance?.appContext.config.globalProperties.$axios

interface Video {
    id: string
    title: string
    thumbnail: string
    duration: string
    size: string
    uploadDate: Date | string
    status: 'ready' | 'uploading' | 'processing' | 'scheduled' | 'published' | 'failed' | 'awaiting-details' | 'partially-published'
    progress?: number
    platforms: Array<'instagram' | 'tiktok' | 'youtube' | 'facebook'>
    views?: number
    filename?: string
    originalName?: string
    description?: string
    tags?: string[]
    scheduledDate?: Date | string
    publishedAt?: Date | string
    publishStatus?: { [key: string]: string }
}

interface CalendarVideoEntry {
    video: Video
    platform?: string
    date: Date
    type: 'scheduled' | 'published'
}

const videos = ref<Video[]>([])
const viewMode = ref<'calendar' | 'list'>('calendar')
const currentDate = ref(new Date())
const isLoading = ref(false)

function handleProjectChanged(event: Event) {
    const customEvent = event as CustomEvent
    const project = customEvent.detail
    console.log('Project changed to:', project)
    loadVideos()
}

const loadVideos = async () => {
    const PROJECT_ID = localStorage.getItem('currentProjectId') ? `project_id=${localStorage.getItem('currentProjectId')}` : ''

    try {
        isLoading.value = true
        const response = await axios.get(`/videos?${PROJECT_ID}`)
        if (response.status === 200) {
            videos.value = response.data.map((v: any) => ({
                ...v,
                uploadDate: v.uploadDate ? new Date(v.uploadDate) : new Date(),
                scheduledDate: v.scheduledDate ? new Date(v.scheduledDate) : undefined,
                publishedAt: v.publishedAt ? new Date(v.publishedAt) : undefined
            }))
        }
    } catch (error) {
        console.error('Error loading videos:', error)
    } finally {
        isLoading.value = false
    }
}

const allCalendarEntries = computed(() => {
    const entries: CalendarVideoEntry[] = []

    videos.value.forEach(video => {
        if (video.status === 'scheduled' && video.scheduledDate) {
            entries.push({
                video,
                date: new Date(video.scheduledDate),
                type: 'scheduled'
            })
        }

        if ((video.status === 'published' || video.status === 'partially-published') && video.publishStatus) {
            Object.entries(video.publishStatus).forEach(([platform, status]) => {
                if (status !== 'failed') {
                    try {
                        const publishDate = new Date(status)
                        if (!isNaN(publishDate.getTime())) {
                            entries.push({
                                video,
                                platform,
                                date: publishDate,
                                type: 'published'
                            })
                        }
                    } catch (e) {
                        console.error('Invalid date:', status)
                    }
                }
            })
        }
    })

    return entries.sort((a, b) => a.date.getTime() - b.date.getTime())
})

const scheduledCount = computed(() => {
    return allCalendarEntries.value.filter(e => e.type === 'scheduled').length
})

const publishedCount = computed(() => {
    return allCalendarEntries.value.filter(e => e.type === 'published').length
})

const currentMonth = computed(() => {
    return currentDate.value.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
})

const previousMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const today = () => {
    currentDate.value = new Date()
}

const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: Array<{
        date: Date | null
        day: number | null
        isCurrentMonth: boolean
        isToday: boolean
        entries: CalendarVideoEntry[]
    }> = []

    const prevMonthLastDay = new Date(year, month, 0).getDate()
    const prevMonthDays = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1
    for (let i = prevMonthDays; i > 0; i--) {
        const date = new Date(year, month - 1, prevMonthLastDay - i + 1)
        days.push({
            date,
            day: prevMonthLastDay - i + 1,
            isCurrentMonth: false,
            isToday: false,
            entries: getEntriesForDate(date)
        })
    }

    const today = new Date()
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i)
        days.push({
            date,
            day: i,
            isCurrentMonth: true,
            isToday: date.toDateString() === today.toDateString(),
            entries: getEntriesForDate(date)
        })
    }

    const totalDaysShown = days.length
    const weeksNeeded = Math.ceil(totalDaysShown / 7)
    const totalCells = weeksNeeded * 7
    const remainingDays = totalCells - totalDaysShown

    for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i)
        days.push({
            date,
            day: i,
            isCurrentMonth: false,
            isToday: false,
            entries: getEntriesForDate(date)
        })
    }

    return days
})

const getEntriesForDate = (date: Date): CalendarVideoEntry[] => {
    return allCalendarEntries.value.filter(entry => {
        return entry.date.toDateString() === date.toDateString()
    })
}

const groupedByDate = computed(() => {
    const groups: { [key: string]: CalendarVideoEntry[] } = {}

    allCalendarEntries.value.forEach(entry => {
        const dateKey = entry.date.toDateString()

        if (!groups[dateKey]) {
            groups[dateKey] = []
        }

        groups[dateKey].push(entry)
    })

    return Object.entries(groups)
        .map(([dateStr, entries]) => ({
            date: new Date(dateStr),
            entries
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime())
})

const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

const formatDateLong = (date: Date) => {
    return date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

const getPlatformIcon = (platform: string) => {
    const icons = {
        instagram: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
        tiktok: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>`,
        youtube: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
        facebook: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`
    }
    return icons[platform as keyof typeof icons] || ''
}

const getStatusColor = (type: 'scheduled' | 'published') => {
    const colors = {
        scheduled: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    }
    return colors[type]
}

const getPlatformName = (platform: string) => {
    const names: { [key: string]: string } = {
        instagram: 'Instagram',
        tiktok: 'TikTok',
        youtube: 'YouTube',
        facebook: 'Facebook'
    }
    return names[platform] || platform
}

const uploadURL = import.meta.env.MODE === 'production' ? 'https://api.reelmia.com' : 'http://localhost:6709'

onMounted(() => {
    loadVideos()

    window.addEventListener('project-changed', handleProjectChanged)

    return () => {
        window.removeEventListener('project-changed', handleProjectChanged)
    }
})
</script>

<template>
    <div class="h-full flex flex-col bg-white dark:bg-gray-900">
        <div class="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Schedule</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        View and manage your scheduled and published video posts
                    </p>
                </div>
                <div class="flex items-center gap-3">
                    <!-- <button @click="today"
                        class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
                        Today
                    </button>-->
                    <div class="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <button @click="viewMode = 'calendar'" :class="[
                            'px-4 py-2 rounded transition-colors font-medium text-sm',
                            viewMode === 'calendar'
                                ? 'bg-white dark:bg-gray-700 text-violet-600 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        ]">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                    clip-rule="evenodd" />
                            </svg>
                        </button>
                        <button @click="viewMode = 'list'" :class="[
                            'px-4 py-2 rounded transition-colors font-medium text-sm',
                            viewMode === 'list'
                                ? 'bg-white dark:bg-gray-700 text-violet-600 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        ]">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                    clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="viewMode === 'calendar'" class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <button @click="previousMonth"
                        class="p-2 text-gray-600 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 transition-colors">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                    <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 capitalize">{{ currentMonth }}
                    </h2>
                    <button @click="nextMonth"
                        class="p-2 text-gray-600 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 transition-colors">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                    <span class="font-medium text-purple-600 dark:text-purple-400">{{ scheduledCount }}</span>
                    scheduled
                    · <span class="font-medium text-green-600 dark:text-green-400">{{ publishedCount }}</span>
                    published
                </div>
            </div>
        </div>

        <!-- Calendar View -->
        <div v-if="viewMode === 'calendar'" class="flex-1 overflow-y-auto p-8">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div class="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                    <div v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" :key="day"
                        class="py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                        {{ day }}
                    </div>
                </div>
                <div class="grid grid-cols-7">
                    <div v-for="(dayInfo, index) in calendarDays" :key="index" :class="[
                        'min-h-[120px] border-r border-b border-gray-200 dark:border-gray-700 p-2 last:border-r-0',
                        !dayInfo.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900/50' : '',
                        dayInfo.isToday ? 'bg-violet-50 dark:bg-violet-900/10' : ''
                    ]">
                        <div :class="[
                            'text-sm font-medium mb-2',
                            !dayInfo.isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-gray-100',
                            dayInfo.isToday ? 'text-violet-600 dark:text-violet-400' : ''
                        ]">
                            {{ dayInfo.day }}
                        </div>
                        <div class="space-y-1">
                            <div v-for="entry in dayInfo.entries.slice(0, 3)"
                                :key="`${entry.video.id}-${entry.platform || 'all'}`"
                                @click="router.push({ name: 'video', params: { id: entry.video.id } })" :class="[
                                    'text-xs p-1.5 rounded cursor-pointer transition-all hover:shadow-md',
                                    getStatusColor(entry.type)
                                ]">
                                <div class="font-medium truncate">{{ entry.video.title }}</div>
                                <div class="flex items-center gap-1 mt-0.5">
                                    <span class="text-[10px]">{{ formatTime(entry.date) }}</span>
                                    <div class="flex gap-0.5 ml-auto">
                                        <span v-if="entry.platform" v-html="getPlatformIcon(entry.platform)"></span>
                                        <template v-else>
                                            <span v-for="platform in entry.video.platforms.slice(0, 2)" :key="platform"
                                                v-html="getPlatformIcon(platform)"></span>
                                        </template>
                                    </div>
                                </div>
                            </div>
                            <div v-if="dayInfo.entries.length > 3"
                                class="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
                                +{{ dayInfo.entries.length - 3 }} more
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- List View -->
        <div v-else class="flex-1 overflow-y-auto p-8">
            <div v-if="groupedByDate.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
                <svg class="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No scheduled or published videos
                </h3>
                <p class="text-gray-500 dark:text-gray-400 mb-6">
                    Scheduled and published videos will appear here
                </p>
            </div>

            <div v-else class="space-y-6">
                <div v-for="group in groupedByDate" :key="group.date.toISOString()"
                    class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div class="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {{ formatDateLong(group.date) }}
                            </h3>
                            <span class="text-sm text-gray-500 dark:text-gray-400">
                                {{ group.entries.length }} publication{{ group.entries.length !== 1 ? 's' : '' }}
                            </span>
                        </div>
                    </div>
                    <div class="divide-y divide-gray-200 dark:divide-gray-700">
                        <div v-for="entry in group.entries" :key="`${entry.video.id}-${entry.platform || 'all'}`"
                            @click="router.push({ name: 'video', params: { id: entry.video.id } })"
                            class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                            <div class="flex items-start gap-4">
                                <div
                                    class="relative w-32 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                                    <video v-if="entry.video.filename" class="w-full h-full object-cover" muted>
                                        <source :src="`${uploadURL}/uploads/${entry.video.filename}`" type="video/mp4">
                                    </video>
                                    <div
                                        class="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                        {{ entry.video.duration }}
                                    </div>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-start justify-between gap-4 mb-2">
                                        <div>
                                            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                                {{ entry.video.title }}
                                            </h4>
                                            <div class="flex items-center gap-2">
                                                <span :class="[
                                                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                                    getStatusColor(entry.type)
                                                ]">
                                                    {{ entry.type === 'scheduled' ? 'Scheduled' : 'Published' }}
                                                </span>
                                                <span v-if="entry.platform"
                                                    class="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                    <span v-html="getPlatformIcon(entry.platform)"></span>
                                                    {{ getPlatformName(entry.platform) }}
                                                </span>
                                                <span v-else class="text-sm text-gray-600 dark:text-gray-400">
                                                    All platforms
                                                </span>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {{ formatTime(entry.date) }}
                                            </div>
                                            <div class="text-xs text-gray-500 dark:text-gray-400">
                                                {{ formatDate(entry.date) }}
                                            </div>
                                        </div>
                                    </div>
                                    <p v-if="entry.video.description"
                                        class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                        {{ entry.video.description }}
                                    </p>
                                    <div v-if="!entry.platform" class="flex items-center gap-2">
                                        <span class="text-xs text-gray-500 dark:text-gray-400">Platforms:</span>
                                        <div class="flex gap-1">
                                            <span v-for="platform in entry.video.platforms" :key="platform"
                                                v-html="getPlatformIcon(platform)"
                                                class="text-gray-600 dark:text-gray-400"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
}

@media (prefers-color-scheme: dark) {
    ::-webkit-scrollbar-thumb {
        background: #4a5568;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #718096;
    }
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
