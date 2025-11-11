<template>
    <div class="video-comments-view">
        <div v-if="loading" class="loading-state">
            <p>Loading comments...</p>
        </div>
        <div v-else-if="error" class="error-state">
            <p class="error-message">{{ error }}</p>
            <button @click="loadComments" class="btn-retry">Retry</button>
        </div>
        <div v-else class="comments-container">
            <div class="main-content">
                <div class="header-section">
                    <h1 class="title">Comments to video</h1>
                </div>
                <div v-if="uploadResults.length === 0" class="no-uploads">
                    <p>This video hasn't been uploaded to any platforms yet.</p>
                </div>
                <div v-else class="all-comments-section">
                    <div v-for="upload in uploadResults" :key="`${upload.platform}-${upload.platform_id}`"
                        class="platform-comments">
                        <div
                            v-if="comments[upload.platform]?.comment_data && comments[upload.platform].comment_data.length > 0">
                            <div v-for="(comment, index) in comments[upload.platform].comment_data" :key="index"
                                class="comment-item">
                                <div class="comment-header-container">
                                    <div class="comment-top">
                                        <div class="author-section">
                                            <div class="avatar">
                                                {{ (comment.author || 'A')[0].toUpperCase() }}
                                            </div>
                                            <div class="author-info">
                                                <div class="author-name">{{ comment.author || 'Anonymous' }}</div>
                                                <div class="timestamp">{{ formatTimeAgo(comment.createdAt ||
                                                    comment.created_at) }}</div>
                                            </div>
                                        </div>
                                        <button class="open-button" @click="openComment(index, upload.platform)"
                                            title="Open comment">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p class="comment-text">{{ comment.text || comment.content || comment.message }}</p>
                                </div>
                                <div class="tags-section">
                                    <span class="tag platform-tag">{{ formatPlatformName(upload.platform) }}</span>
                                    <span class="tag positive-tag">Positive</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="getTotalComments() === 0" class="no-comments">
                        <p>No comments collected yet.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from '../axios'

const route = useRoute()
const videoId = ref(route.params.id)
const loading = ref(false)
const error = ref(null)
const uploadResults = ref([])
const comments = ref({})

const formatPlatformName = (platform) => {
    const names = {
        youtube: 'YouTube',
        tiktok: 'TikTok',
        instagram: 'Instagram',
        facebook: 'Facebook',
        x: 'X (Twitter)',
        reddit: 'Reddit'
    }
    return names[platform] || platform.charAt(0).toUpperCase() + platform.slice(1)
}

const formatTimeAgo = (dateString) => {
    if (!dateString) return 'N/A'

    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now - date) / 1000)

    const intervals = {
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

const getTotalComments = () => {
    let total = 0
    for (const platform in comments.value) {
        if (comments.value[platform]?.comment_data?.length) {
            total += comments.value[platform].comment_data.length
        }
    }
    return total
}

const openComment = (index, platform) => {
    console.log(`Opening comment ${index} from ${platform}`)
}

const loadComments = async () => {
    loading.value = true
    error.value = null

    try {
        const response = await axios.get(`/videos/${videoId.value}/comments`)

        uploadResults.value = response.data.uploadResults || []
        comments.value = response.data.comments || {}
    } catch (err) {
        console.error('Error loading comments:', err)
        error.value = err.response?.data?.error || 'Failed to load comments'
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    loadComments()
})
</script>

<style scoped>
.video-comments-view {
    min-height: 100vh;
    background: #1a1a1a;
    color: #e0e0e0;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.loading-state,
.error-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    background: #2a2a2a;
    border-radius: 8px;
    padding: 2rem;
}

.loading-state p,
.error-state p {
    color: #e0e0e0;
    font-size: 1rem;
}

.error-message {
    color: #ff6b6b;
    font-weight: 500;
    margin-bottom: 1rem;
}

.btn-retry {
    padding: 0.75rem 2rem;
    background: #4a4a4a;
    color: #e0e0e0;
    border: 1px solid #666;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s;
    font-size: 0.95rem;
}

.btn-retry:hover {
    background: #555;
    border-color: #888;
}

.comments-container {
    max-width: 900px;
    margin: 0 auto;
}

.main-content {
    width: 100%;
}

.header-section {
    margin-bottom: 2rem;
}

.title {
    margin: 0;
    color: #ffffff;
    font-size: 1.5rem;
    font-weight: 400;
    letter-spacing: -0.5px;
}

.no-uploads {
    background: #2a2a2a;
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
    color: #999;
    border: 1px solid #3a3a3a;
}

.all-comments-section {
    display: flex;
    flex-direction: column;
    gap: 0;
}

.platform-comments {
    display: flex;
    flex-direction: column;
    gap: 0;
}

.comment-item {
    padding: 1.5rem 0;
    border-bottom: 1px solid #333;
    transition: background 0.2s;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.comment-item:last-child {
    border-bottom: none;
}

.comment-item:hover {
    background: rgba(255, 255, 255, 0.02);
}

.comment-header-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.comment-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
}

.author-section {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    flex: 1;
}

.avatar {
    width: 40px;
    height: 40px;
    min-width: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1rem;
}

.author-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.author-name {
    font-weight: 600;
    color: #ffffff;
    font-size: 0.95rem;
}

.timestamp {
    color: #888;
    font-size: 0.8rem;
}

.open-button {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
    flex-shrink: 0;
}

.open-button:hover {
    color: #e0e0e0;
}

.open-button svg {
    width: 18px;
    height: 18px;
}

.comment-text {
    color: #c0c0c0;
    line-height: 1.6;
    margin: 0;
    word-break: break-word;
    font-size: 0.95rem;
}

.tags-section {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    align-items: center;
}

.tag {
    display: inline-block;
    padding: 0.35rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
    white-space: nowrap;
}

.platform-tag {
    background: #3a3a3a;
    color: #c0c0c0;
    border: 1px solid #555;
}

.positive-tag {
    background: #10b981;
    color: white;
}

.no-comments {
    padding: 3rem 2rem;
    text-align: center;
    color: #666;
    background: #2a2a2a;
    border-radius: 8px;
    border: 1px solid #3a3a3a;
}

@media (max-width: 768px) {
    .video-comments-view {
        padding: 1rem;
    }

    .title {
        font-size: 1.25rem;
    }

    .comment-item {
        padding: 1rem 0;
    }

    .avatar {
        width: 36px;
        height: 36px;
        font-size: 0.9rem;
    }

    .comment-top {
        gap: 0.5rem;
    }

    .tags-section {
        gap: 0.5rem;
    }

    .tag {
        padding: 0.3rem 0.6rem;
        font-size: 0.75rem;
    }
}
</style>