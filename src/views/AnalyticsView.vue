<template>
    <div class="analytics-view">
        <div class="analytics-header">
            <h1>Analytics</h1>
            <div class="filters">
                <select v-model="selectedPlatform" @change="fetchAnalytics" class="platform-select">
                    <option value="">All Platforms</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                </select>
                <button @click="fetchAnalytics" class="refresh-btn" :disabled="loading">
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
        <div v-if="error" class="error-message">
            {{ error }}
        </div>
        <div v-if="loading" class="loading-container">vdfdfdcvc
            <div class="spinner"></div>
            <p>Loading analytics...</p>
        </div>
        <div v-else-if="analytics" class="analytics-content">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon views">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <h3>Total Views</h3>
                        <p class="stat-value">{{ formatNumber(analytics.totalViews) }}</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon likes">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path
                                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
                            </path>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <h3>Total Likes</h3>
                        <p class="stat-value">{{ formatNumber(analytics.totalLikes) }}</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon comments">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <h3>Total Comments</h3>
                        <p class="stat-value">{{ formatNumber(analytics.totalComments) }}</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon videos">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <h3>Total Videos</h3>
                        <p class="stat-value">{{ formatNumber(analytics.totalVideos) }}</p>
                    </div>
                </div>

                <div v-if="analytics.totalShares > 0" class="stat-card">
                    <div class="stat-icon shares">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <h3>Total Shares</h3>
                        <p class="stat-value">{{ formatNumber(analytics.totalShares) }}</p>
                    </div>
                </div>
            </div>
            <div v-if="Object.keys(analytics.platforms).length > 0" class="platform-breakdown">
                <h2>Platform Breakdown</h2>
                <div class="platform-cards">
                    <div v-for="(stats, platform) in analytics.platforms" :key="platform" class="platform-card"
                        :class="platform">
                        <div class="platform-header">
                            <div class="platform-icon">
                                <img v-if="platform === 'youtube'"
                                    src="https://img.icons8.com/color/48/youtube-play.png" alt="YouTube" />
                                <img v-else-if="platform === 'tiktok'"
                                    src="https://img.icons8.com/color/48/tiktok--v1.png" alt="TikTok" />
                                <img v-else-if="platform === 'instagram'"
                                    src="https://img.icons8.com/color/48/instagram-new.png" alt="Instagram" />
                                <img v-else-if="platform === 'facebook'"
                                    src="https://img.icons8.com/color/48/facebook.png" alt="Facebook" />
                            </div>
                            <h3>{{ platform.charAt(0).toUpperCase() + platform.slice(1) }}</h3>
                        </div>

                        <div v-if="stats.error" class="platform-error">
                            {{ stats.error }}
                        </div>
                        <div v-else class="platform-stats">
                            <div class="platform-stat">
                                <span class="label">Videos</span>
                                <span class="value">{{ formatNumber(stats.videos) }}</span>
                            </div>
                            <div class="platform-stat">
                                <span class="label">Views</span>
                                <span class="value">{{ formatNumber(stats.views) }}</span>
                            </div>
                            <div class="platform-stat">
                                <span class="label">Likes</span>
                                <span class="value">{{ formatNumber(stats.likes) }}</span>
                            </div>
                            <div class="platform-stat">
                                <span class="label">Comments</span>
                                <span class="value">{{ formatNumber(stats.comments) }}</span>
                            </div>
                            <div v-if="stats.shares > 0" class="platform-stat">
                                <span class="label">Shares</span>
                                <span class="value">{{ formatNumber(stats.shares) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="analytics.videos && analytics.videos.length > 0" class="videos-section">
                <h2>Recent Videos</h2>
                <div class="videos-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Platform</th>
                                <th v-if="analytics.videos[0].title">Title</th>
                                <th>Views</th>
                                <th>Likes</th>
                                <th>Comments</th>
                                <th v-if="analytics.videos[0].shares !== undefined">Shares</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(video, index) in analytics.videos" :key="index">
                                <td>
                                    <span class="platform-badge" :class="video.platform">
                                        {{ video.platform }}
                                    </span>
                                </td>
                                <td v-if="video.title">{{ video.title }}</td>
                                <td>{{ formatNumber(video.views) }}</td>
                                <td>{{ formatNumber(video.likes) }}</td>
                                <td>{{ formatNumber(video.comments) }}</td>
                                <td v-if="video.shares !== undefined">{{ formatNumber(video.shares) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div v-else class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <h2>No Analytics Data</h2>
            <p>Connect your social media accounts to see analytics</p>
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

<style scoped>
.analytics-view {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.analytics-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.analytics-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
}

.filters {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.platform-select {
    padding: 0.5rem 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.95rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
}

.platform-select:hover {
    border-color: #6366f1;
}

.platform-select:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.refresh-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
    background: #4f46e5;
    transform: translateY(-1px);
}

.refresh-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.error-message {
    background: #fee;
    color: #c33;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    gap: 1rem;
}

.spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #6366f1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
}

.stat-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.stat-icon.views {
    background: #dbeafe;
    color: #2563eb;
}

.stat-icon.likes {
    background: #fce7f3;
    color: #ec4899;
}

.stat-icon.comments {
    background: #ddd6fe;
    color: #7c3aed;
}

.stat-icon.videos {
    background: #d1fae5;
    color: #059669;
}

.stat-icon.shares {
    background: #fed7aa;
    color: #ea580c;
}

.stat-info h3 {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0 0 0.25rem 0;
    font-weight: 500;
}

.stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
}

.platform-breakdown {
    margin-bottom: 2rem;
}

.platform-breakdown h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 1rem;
}

.platform-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}

.platform-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
}

.platform-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.platform-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.platform-icon img {
    width: 32px;
    height: 32px;
}

.platform-header h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
}

.platform-error {
    color: #c33;
    font-size: 0.875rem;
}

.platform-stats {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.platform-stat {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f3f4f6;
}

.platform-stat:last-child {
    border-bottom: none;
}

.platform-stat .label {
    font-size: 0.875rem;
    color: #6b7280;
}

.platform-stat .value {
    font-size: 1rem;
    font-weight: 600;
    color: #1a1a1a;
}

.videos-section {
    margin-top: 2rem;
}

.videos-section h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 1rem;
}

.videos-table {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

table {
    width: 100%;
    border-collapse: collapse;
}

thead {
    background: #f9fafb;
}

th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #6b7280;
    font-size: 0.875rem;
    text-transform: uppercase;
}

td {
    padding: 1rem;
    border-top: 1px solid #f3f4f6;
    color: #1a1a1a;
}

.platform-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}

.platform-badge.youtube {
    background: #fee;
    color: #c33;
}

.platform-badge.tiktok {
    background: #f0f9ff;
    color: #0284c7;
}

.platform-badge.instagram {
    background: #fdf4ff;
    color: #c026d3;
}

.platform-badge.facebook {
    background: #eff6ff;
    color: #2563eb;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    color: #6b7280;
}

.empty-state svg {
    margin-bottom: 1rem;
    opacity: 0.5;
}

.empty-state h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.empty-state p {
    font-size: 1rem;
}
</style>
