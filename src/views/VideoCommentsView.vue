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
      <div class="header">
        <h1>Video Comments</h1>
        <p class="video-title">{{ videoTitle }}</p>
      </div>

      <div v-if="uploadResults.length === 0" class="no-uploads">
        <p>This video hasn't been uploaded to any platforms yet.</p>
      </div>

      <div v-else class="platforms-list">
        <div v-for="upload in uploadResults" :key="`${upload.platform}-${upload.platform_id}`" class="platform-card">
          <div class="platform-header">
            <h2 class="platform-name">{{ formatPlatformName(upload.platform) }}</h2>
            <span class="platform-id">ID: {{ upload.platform_id }}</span>
          </div>

          <div v-if="comments[upload.platform]" class="comments-section">
            <div class="comment-stats">
              <span class="stat">
                <span class="label">Total Comments:</span>
                <span class="value">{{ comments[upload.platform].total_comments }}</span>
              </span>
              <span class="stat">
                <span class="label">Collected:</span>
                <span class="value">{{ formatDate(comments[upload.platform].collected_at) }}</span>
              </span>
            </div>

            <div v-if="comments[upload.platform].comment_data && comments[upload.platform].comment_data.length > 0" class="comments-list">
              <div v-for="(comment, index) in comments[upload.platform].comment_data" :key="index" class="comment-item">
                <div class="comment-header">
                  <span v-if="comment.author" class="author">{{ comment.author }}</span>
                  <span class="timestamp">{{ formatDate(comment.createdAt || comment.created_at) }}</span>
                </div>
                <div class="comment-text">{{ comment.text || comment.content || comment.message }}</div>
                <div v-if="comment.likes || comment.replies" class="comment-stats-detail">
                  <span v-if="comment.likes" class="stat-detail">👍 {{ comment.likes }}</span>
                  <span v-if="comment.replies" class="stat-detail">💬 {{ comment.replies }}</span>
                </div>
              </div>
            </div>

            <div v-else class="no-comments">
              <p>No comments collected yet.</p>
            </div>
          </div>

          <div v-else class="no-comments-data">
            <p>No comment data available for this platform.</p>
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
const videoTitle = ref('')
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

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const loadComments = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await axios.get(`/videos/${videoId.value}/comments`)
    
    uploadResults.value = response.data.uploadResults || []
    comments.value = response.data.comments || {}
    
    // Get video title from route params or API
    if (route.params.videoTitle) {
      videoTitle.value = route.params.videoTitle
    } else {
      // Optionally fetch video details
      try {
        const videoResponse = await axios.get(`/videos/${videoId.value}`)
        videoTitle.value = videoResponse.data.title || 'Unknown Video'
      } catch (err) {
        videoTitle.value = `Video ${videoId.value}`
      }
    }
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.loading-state,
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.error-message {
  color: #dc2626;
  font-weight: 500;
  margin-bottom: 1rem;
}

.btn-retry {
  padding: 0.5rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-retry:hover {
  background: #764ba2;
}

.comments-container {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0;
  color: #1f2937;
  font-size: 2rem;
}

.video-title {
  color: #6b7280;
  margin: 0.5rem 0 0 0;
  font-size: 1.1rem;
}

.no-uploads {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  color: #6b7280;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.platforms-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 2rem;
}

.platform-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.platform-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.platform-name {
  margin: 0;
  color: #1f2937;
  font-size: 1.3rem;
}

.platform-id {
  background: #f3f4f6;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #6b7280;
  font-family: monospace;
}

.comment-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.stat,
.stat-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.stat .label {
  color: #6b7280;
  font-weight: 500;
}

.stat .value {
  color: #1f2937;
  font-weight: 600;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  padding: 1rem;
  background: #f9fafb;
  border-left: 3px solid #667eea;
  border-radius: 6px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.author {
  font-weight: 600;
  color: #1f2937;
}

.timestamp {
  color: #9ca3af;
  font-size: 0.85rem;
}

.comment-text {
  color: #374151;
  line-height: 1.5;
  margin-bottom: 0.5rem;
  word-break: break-word;
}

.comment-stats-detail {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #6b7280;
}

.no-comments,
.no-comments-data {
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
  background: #f9fafb;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .platforms-list {
    grid-template-columns: 1fr;
  }

  .header {
    padding: 1.5rem;
  }

  .header h1 {
    font-size: 1.5rem;
  }
}
</style>