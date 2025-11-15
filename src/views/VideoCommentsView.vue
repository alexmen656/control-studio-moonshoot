<template>
    <div class="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        <div v-if="loading" class="flex-1 flex items-center justify-center">
            <div class="text-center">
                <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-600 mx-auto mb-4"></div>
                <p class="text-gray-600 dark:text-gray-400">Loading comments...</p>
            </div>
        </div>
        <div v-else-if="error" class="flex-1 flex items-center justify-center">
            <div class="text-center">
                <svg class="w-24 h-24 text-red-300 dark:text-red-600 mx-auto mb-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Error Loading Comments</h2>
                <p class="text-red-600 dark:text-red-400 mb-6">{{ error }}</p>
                <button @click="loadComments"
                    class="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium">
                    Try Again
                </button>
            </div>
        </div>
        <div v-else class="flex-1 overflow-y-auto">
            <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-4">
                <div class="flex items-center justify-between">
                    <h1 class="text-xl font-medium text-gray-900 dark:text-gray-100">Comments</h1>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                        {{ getTotalComments() }} total comment<span v-if="getTotalComments() !== 1">s</span>
                    </div>
                </div>
            </div>
            <div
                class="bg-gray-800 dark:bg-gray-800 border-b border-gray-700 dark:border-gray-700 px-6 py-3 flex items-center gap-4">
                <div class="flex items-center">
                    <input type="checkbox" v-model="selectAll" @change="toggleSelectAll"
                        class="w-5 h-5 rounded border-gray-600 bg-gray-700 text-orange-600 cursor-pointer" />
                </div>
                <span v-if="selectedComments.size > 0" class="text-sm text-gray-300">
                    {{ selectedComments.size }} selected
                </span>
                <div v-if="selectedComments.size > 0" class="h-6 border-l border-gray-600"></div>
                <div class="relative group">
                    <button
                        class="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors text-sm font-medium">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M7 16V4m0 0L3 8m4-4l4 4" />
                        </svg>
                        Sort
                    </button>
                    <div
                        class="absolute left-0 mt-0 w-48 bg-gray-700 dark:bg-gray-700 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <button @click="sortBy('newest')"
                            :class="['w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white', sortOrder === 'newest' ? 'bg-gray-600 text-orange-400' : '']">
                            Newest First
                        </button>
                        <button @click="sortBy('oldest')"
                            :class="['w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white', sortOrder === 'oldest' ? 'bg-gray-600 text-orange-400' : '']">
                            Oldest First
                        </button>
                        <button @click="sortBy('author')"
                            :class="['w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white', sortOrder === 'author' ? 'bg-gray-600 text-orange-400' : '']">
                            By Author
                        </button>
                    </div>
                </div>
                <div class="relative group">
                    <button
                        class="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors text-sm font-medium">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filter
                    </button>
                    <div
                        class="absolute left-0 mt-0 w-56 bg-gray-700 dark:bg-gray-700 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <div class="px-4 py-3 border-b border-gray-600">
                            <h3 class="text-xs font-semibold text-gray-300 uppercase mb-3">Platform</h3>
                            <div class="space-y-2">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" v-model="filterPlatforms" value="youtube"
                                        class="w-4 h-4 rounded border-gray-600 bg-gray-600 text-orange-600" />
                                    <span class="text-sm text-gray-300">YouTube</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" v-model="filterPlatforms" value="tiktok"
                                        class="w-4 h-4 rounded border-gray-600 bg-gray-600 text-orange-600" />
                                    <span class="text-sm text-gray-300">TikTok</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" v-model="filterPlatforms" value="instagram"
                                        class="w-4 h-4 rounded border-gray-600 bg-gray-600 text-orange-600" />
                                    <span class="text-sm text-gray-300">Instagram</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" v-model="filterPlatforms" value="facebook"
                                        class="w-4 h-4 rounded border-gray-600 bg-gray-600 text-orange-600" />
                                    <span class="text-sm text-gray-300">Facebook</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex-1"></div>
                <div class="relative">
                    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" v-model="searchQuery" placeholder="Search comments..."
                        class="pl-10 pr-3 py-2 bg-gray-700 text-gray-100 placeholder-gray-500 rounded border border-gray-600 focus:border-orange-500 focus:outline-none transition-colors text-sm w-56" />
                </div>
            </div>
            <div class="p-8">
                <div v-if="uploadResults.length === 0"
                    class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <svg class="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Uploads Yet</h3>
                    <p class="text-gray-600 dark:text-gray-400">This video hasn't been uploaded to any platforms yet.
                    </p>
                </div>
                <div v-else-if="getTotalComments() === 0"
                    class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <svg class="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Comments Yet</h3>
                    <p class="text-gray-600 dark:text-gray-400">Comments will appear here once they're collected from
                        your platforms.</p>
                </div>
                <div v-if="getFilteredAndSortedComments.length > 0" class="space-y-0">
                    <div v-for="upload in getFilteredAndSortedComments"
                        :key="`${upload.platform}-${upload.platform_id}`">
                        <template v-if="upload.comment_data && upload.comment_data.length > 0">
                            <div v-for="(comment, index) in upload.comment_data"
                                :key="`${upload.platform}-${comment._index}`"
                                :class="['bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors flex items-start', selectedComments.has(`${upload.platform}-${comment._index}`) ? 'bg-orange-50 dark:bg-gray-700/50' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50']">
                                <div class="px-4 py-4 flex items-start pt-5">
                                    <input type="checkbox"
                                        :checked="selectedComments.has(`${upload.platform}-${comment._index}`)"
                                        @change="toggleCommentSelection(`${upload.platform}-${comment._index}`)"
                                        class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-orange-600 cursor-pointer" />
                                </div>
                                <div class="px-2 py-4 flex-1">
                                    <div class="flex items-start justify-between mb-3">
                                        <div class="flex items-start gap-4 flex-1">
                                            <div
                                                class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
                                                {{ (comment.author || 'A')[0]?.toUpperCase() }}
                                            </div>
                                            <div class="flex-1 min-w-0">
                                                <div class="flex items-center gap-2 mb-1">
                                                    <h3 class="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                        {{ comment.author || 'Anonymous' }}
                                                    </h3>
                                                    <span
                                                        class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 rounded">
                                                        {{ formatPlatformName(upload.platform) }}
                                                    </span>
                                                </div>
                                                <p class="text-xs text-gray-500 dark:text-gray-500">
                                                    {{ formatTimeAgo(comment.createdAt || comment.created_at) }}
                                                </p>
                                            </div>
                                        </div>
                                        <button @click="openComment(comment._index, upload.platform)"
                                            class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                                            title="Open comment">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p
                                        class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3 break-words">
                                        {{ comment.text || comment.content || comment.message }}
                                    </p>
                                    <div class="flex gap-2 flex-wrap">
                                        <span
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                            Positive
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
                <div v-else-if="getTotalComments() > 0"
                    class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <svg class="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Results Found</h3>
                    <p class="text-gray-600 dark:text-gray-400">Try adjusting your search or filters.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from '../axios'

interface CommentData {
    author?: string
    text?: string
    content?: string
    message?: string
    createdAt?: string
    created_at?: string
}

interface UploadResult {
    platform: string
    platform_id: string
}

interface Comments {
    [platform: string]: {
        comment_data: CommentData[]
    }
}

const route = useRoute()
const videoId = ref(route.params.id as string)
const loading = ref(false)
const error = ref < string | null > (null)
const uploadResults = ref < UploadResult[] > ([])
const comments = ref < Comments > ({})

const selectAll = ref(false)
const selectedComments = ref(new Set < string > ())
const sortOrder = ref < 'newest' | 'oldest' | 'author' > ('newest')
const filterPlatforms = ref < string[] > ([])
const searchQuery = ref('')

const getFilteredAndSortedComments = computed(() => {
    const result: { platform: string; platform_id: string; comment_data: (CommentData & { _index: number })[] }[] = []

    for (const upload of uploadResults.value) {
        const commentData = comments.value[upload.platform]?.comment_data

        if (!commentData) continue

        if (filterPlatforms.value.length > 0 && !filterPlatforms.value.includes(upload.platform)) {
            continue
        }

        let filtered = commentData.filter((comment, index) => {
            const text = (comment.text || comment.content || comment.message || '').toLowerCase()
            const author = (comment.author || '').toLowerCase()
            const query = searchQuery.value.toLowerCase()

            return text.includes(query) || author.includes(query)
        })

        const withIndex = filtered.map((comment, index) => ({
            ...comment,
            _index: commentData.indexOf(comment)
        }))

        if (sortOrder.value === 'newest') {
            withIndex.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.created_at || 0).getTime()
                const dateB = new Date(b.createdAt || b.created_at || 0).getTime()
                return dateB - dateA
            })
        } else if (sortOrder.value === 'oldest') {
            withIndex.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.created_at || 0).getTime()
                const dateB = new Date(b.createdAt || b.created_at || 0).getTime()
                return dateA - dateB
            })
        } else if (sortOrder.value === 'author') {
            withIndex.sort((a, b) => {
                const authorA = (a.author || 'Anonymous').toLowerCase()
                const authorB = (b.author || 'Anonymous').toLowerCase()
                return authorA.localeCompare(authorB)
            })
        }

        if (withIndex.length > 0) {
            result.push({
                ...upload,
                comment_data: withIndex
            })
        }
    }

    return result
})

const formatPlatformName = (platform: string): string => {
    const names: { [key: string]: string } = {
        youtube: 'YouTube',
        tiktok: 'TikTok',
        instagram: 'Instagram',
        facebook: 'Facebook',
        x: 'X (Twitter)',
        reddit: 'Reddit'
    }
    return names[platform] || platform.charAt(0).toUpperCase() + platform.slice(1)
}

const formatTimeAgo = (dateString?: string): string => {
    if (!dateString) return 'N/A'

    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    const intervals: { [key: string]: number } = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    }

    for (const [key, value] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / value)
        if (interval >= 1) {
            return interval === 1 ? `1 ${key} ago` : `${interval} ${key}s ago`
        }
    }

    return 'just now'
}

const getTotalComments = (): number => {
    let total = 0
    for (const platform in comments.value) {
        if (comments.value[platform]?.comment_data?.length) {
            total += comments.value[platform].comment_data.length
        }
    }
    return total
}

const openComment = (index: number, platform: string): void => {
    console.log(`Opening comment ${index} from ${platform}`)
}

const loadComments = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
        const response = await axios.get(`/videos/${videoId.value}/comments`)
        uploadResults.value = response.data.uploadResults || []
        comments.value = response.data.comments || {}
    } catch (err: any) {
        console.error('Error loading comments:', err)
        error.value = err.response?.data?.error || 'Failed to load comments'
    } finally {
        loading.value = false
    }
}

const toggleSelectAll = (): void => {
    if (selectAll.value) {
        selectedComments.value.clear()
        for (const upload of uploadResults.value) {
            const commentData = comments.value[upload.platform]?.comment_data
            if (commentData) {
                commentData.forEach((_, index) => {
                    selectedComments.value.add(`${upload.platform}-${index}`)
                })
            }
        }
    } else {
        selectedComments.value.clear()
    }
}

const toggleCommentSelection = (id: string): void => {
    if (selectedComments.value.has(id)) {
        selectedComments.value.delete(id)
        selectAll.value = false
    } else {
        selectedComments.value.add(id)
    }
}

const sortBy = (order: 'newest' | 'oldest' | 'author'): void => {
    sortOrder.value = order
}

onMounted(() => {
    loadComments()
})
</script>

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
</style>