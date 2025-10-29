<template>
  <div class="workers-view">
    <div class="header">
      <h1>🔧 Worker Management</h1>
      <div class="stats">
        <div class="stat-card">
          <span class="stat-label">Total Workers</span>
          <span class="stat-value">{{ workers.length }}</span>
        </div>
        <div class="stat-card online">
          <span class="stat-label">Online</span>
          <span class="stat-value">{{ onlineWorkers }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Total Jobs</span>
          <span class="stat-value">{{ jobs.length }}</span>
        </div>
        <div class="stat-card processing">
          <span class="stat-label">Processing</span>
          <span class="stat-value">{{ processingJobs }}</span>
        </div>
      </div>
    </div>

    <!-- Workers Section -->
    <section class="workers-section">
      <div class="section-header">
        <h2>👷 Workers</h2>
        <button @click="refreshWorkers" class="btn-refresh" :disabled="loading">
          <span v-if="!loading">🔄 Refresh</span>
          <span v-else>⏳ Loading...</span>
        </button>
      </div>

      <div class="workers-grid">
        <div 
          v-for="worker in workers" 
          :key="worker.worker_id"
          class="worker-card"
          :class="{ 'offline': worker.status !== 'online' }"
        >
          <div class="worker-header">
            <div class="worker-title">
              <span class="worker-status-dot" :class="worker.status"></span>
              <h3>{{ worker.worker_name }}</h3>
            </div>
            <span class="worker-status-badge" :class="worker.status">
              {{ worker.status }}
            </span>
          </div>

          <div class="worker-info">
            <div class="info-row">
              <span class="info-label">ID:</span>
              <span class="info-value">{{ worker.worker_id.substring(0, 16) }}...</span>
            </div>
            <div class="info-row">
              <span class="info-label">Hostname:</span>
              <span class="info-value">{{ worker.hostname }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Last Heartbeat:</span>
              <span class="info-value">{{ formatDate(worker.last_heartbeat) }}</span>
            </div>
          </div>

          <div class="worker-metrics">
            <div class="metric">
              <span class="metric-label">Load</span>
              <div class="metric-bar">
                <div 
                  class="metric-fill load" 
                  :style="{ width: `${(worker.current_load / worker.max_concurrent_tasks) * 100}%` }"
                ></div>
              </div>
              <span class="metric-value">{{ worker.current_load }} / {{ worker.max_concurrent_tasks }}</span>
            </div>

            <div class="metric">
              <span class="metric-label">CPU</span>
              <div class="metric-bar">
                <div 
                  class="metric-fill cpu" 
                  :style="{ width: `${worker.cpu_usage || 0}%` }"
                ></div>
              </div>
              <span class="metric-value">{{ Number(worker.cpu_usage || 0).toFixed(1) }}%</span>
            </div>

            <div class="metric">
              <span class="metric-label">RAM</span>
              <div class="metric-bar">
                <div 
                  class="metric-fill ram" 
                  :style="{ width: `${worker.memory_usage || 0}%` }"
                ></div>
              </div>
              <span class="metric-value">{{ Number(worker.memory_usage || 0).toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="workers.length === 0" class="empty-state">
        <p>😔 No workers found. Start some workers to see them here.</p>
      </div>
    </section>

    <!-- Jobs Section -->
    <section class="jobs-section">
      <div class="section-header">
        <h2>📋 Jobs</h2>
        <div class="job-controls">
          <select v-model="jobFilter" class="filter-select">
            <option value="all">All Jobs</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <button @click="showCreateJobModal = true" class="btn-create">
            ➕ Create Job
          </button>
          <button @click="refreshJobs" class="btn-refresh" :disabled="loading">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div class="jobs-table-container">
        <table class="jobs-table">
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Platform</th>
              <th>Video ID</th>
              <th>Worker</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Created</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in filteredJobs" :key="job.job_id">
              <td class="job-id">{{ job.job_id.substring(0, 20) }}...</td>
              <td>
                <span class="platform-badge" :class="job.platform">
                  {{ job.platform }}
                </span>
              </td>
              <td>{{ job.video_id }}</td>
              <td>
                <span v-if="job.worker_name" class="worker-badge">
                  {{ job.worker_name }}
                </span>
                <span v-else class="no-worker">Not assigned</span>
              </td>
              <td>
                <span class="status-badge" :class="job.status">
                  {{ job.status }}
                </span>
              </td>
              <td>
                <span class="priority-badge" :class="getPriorityClass(job.priority)">
                  {{ job.priority }}
                </span>
              </td>
              <td>{{ formatDate(job.created_at) }}</td>
              <td>{{ getJobDuration(job) }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredJobs.length === 0" class="empty-state">
          <p>No jobs found.</p>
        </div>
      </div>
    </section>

    <!-- Create Job Modal -->
    <div v-if="showCreateJobModal" class="modal-overlay" @click="showCreateJobModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Create Upload Job</h2>
          <button @click="showCreateJobModal = false" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="createJob" class="job-form">
          <div class="form-group">
            <label>Video ID *</label>
            <input 
              v-model.number="newJob.video_id" 
              type="number" 
              required 
              placeholder="Enter video ID"
            />
          </div>

          <div class="form-group">
            <label>Platforms *</label>
            <div class="platform-checkboxes">
              <label v-for="platform in availablePlatforms" :key="platform" class="checkbox-label">
                <input 
                  type="checkbox" 
                  :value="platform" 
                  v-model="newJob.platforms"
                />
                <span>{{ platform }}</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>Priority</label>
            <select v-model.number="newJob.priority">
              <option :value="0">Normal (0)</option>
              <option :value="1">High (1)</option>
              <option :value="2">Urgent (2)</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" @click="showCreateJobModal = false" class="btn-cancel">
              Cancel
            </button>
            <button type="submit" class="btn-submit" :disabled="submitting">
              {{ submitting ? 'Creating...' : 'Create Job' }}
            </button>
          </div>

          <div v-if="createError" class="error-message">
            {{ createError }}
          </div>
          <div v-if="createSuccess" class="success-message">
            Jobs created successfully!
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from '../axios.js'

const workers = ref([])
const jobs = ref([])
const loading = ref(false)
const jobFilter = ref('all')
const showCreateJobModal = ref(false)
const submitting = ref(false)
const createError = ref('')
const createSuccess = ref(false)

const newJob = ref({
  video_id: null,
  platforms: [],
  priority: 0
})

const availablePlatforms = ['youtube', 'tiktok', 'instagram', 'facebook', 'x', 'reddit']

let refreshInterval = null

// Computed
const onlineWorkers = computed(() => 
  workers.value.filter(w => w.status === 'online').length
)

const processingJobs = computed(() => 
  jobs.value.filter(j => j.status === 'processing').length
)

const filteredJobs = computed(() => {
  if (jobFilter.value === 'all') return jobs.value
  return jobs.value.filter(j => j.status === jobFilter.value)
})

// Methods
async function refreshWorkers() {
  try {
    loading.value = true
    console.log('Fetching workers from /workers...')
    const response = await axios.get('/workers')
    console.log('Workers API response:', response.data)
    workers.value = response.data.workers || []
    console.log('Workers count:', workers.value.length)
  } catch (error) {
    console.error('Error fetching workers:', error)
  } finally {
    loading.value = false
  }
}

async function refreshJobs() {
  try {
    loading.value = true
    console.log('Fetching jobs from /jobs...')
    const response = await axios.get('/jobs')
    console.log('Jobs API response:', response.data)
    jobs.value = response.data.jobs || []
    console.log('Jobs count:', jobs.value.length)
  } catch (error) {
    console.error('Error fetching jobs:', error)
  } finally {
    loading.value = false
  }
}

async function createJob() {
  if (newJob.value.platforms.length === 0) {
    createError.value = 'Please select at least one platform'
    return
  }

  try {
    submitting.value = true
    createError.value = ''
    createSuccess.value = false

    await axios.post('/jobs', newJob.value)

    createSuccess.value = true
    
    // Reset form
    newJob.value = {
      video_id: null,
      platforms: [],
      priority: 0
    }

    // Refresh jobs
    setTimeout(() => {
      refreshJobs()
      showCreateJobModal.value = false
      createSuccess.value = false
    }, 1500)

  } catch (error) {
    createError.value = error.response?.data?.error || 'Failed to create job'
    console.error('Error creating job:', error)
  } finally {
    submitting.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  
  return date.toLocaleString()
}

function getJobDuration(job) {
  if (!job.started_at) return 'N/A'
  
  const start = new Date(job.started_at)
  const end = job.completed_at ? new Date(job.completed_at) : new Date()
  const diff = end - start
  
  if (diff < 1000) return '< 1s'
  if (diff < 60000) return `${Math.floor(diff / 1000)}s`
  return `${Math.floor(diff / 60000)}m ${Math.floor((diff % 60000) / 1000)}s`
}

function getPriorityClass(priority) {
  if (priority >= 2) return 'high'
  if (priority >= 1) return 'medium'
  return 'normal'
}

// Lifecycle
onMounted(() => {
  refreshWorkers()
  refreshJobs()
  
  // Auto-refresh every 10 seconds
  refreshInterval = setInterval(() => {
    refreshWorkers()
    refreshJobs()
  }, 10000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.workers-view {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  margin-bottom: 1rem;
  font-size: 2rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-card.online {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.stat-card.processing {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
}

.job-controls {
  display: flex;
  gap: 0.5rem;
}

.workers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.worker-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.worker-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.worker-card.offline {
  opacity: 0.6;
  background: #f3f4f6;
}

.worker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.worker-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.worker-title h3 {
  margin: 0;
  font-size: 1.1rem;
}

.worker-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ef4444;
}

.worker-status-dot.online {
  background: #10b981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.worker-status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.worker-status-badge.online {
  background: #d1fae5;
  color: #065f46;
}

.worker-status-badge.offline {
  background: #fee2e2;
  color: #991b1b;
}

.worker-info {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.info-label {
  color: #6b7280;
}

.info-value {
  font-weight: 500;
  font-family: monospace;
}

.worker-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.metric-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.metric-fill.load {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
}

.metric-fill.cpu {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.metric-fill.ram {
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
}

.metric-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
}

.jobs-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.jobs-table {
  width: 100%;
  border-collapse: collapse;
}

.jobs-table th {
  background: #f9fafb;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.jobs-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.job-id {
  font-family: monospace;
  font-size: 0.875rem;
}

.platform-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.platform-badge.youtube { background: #fee2e2; color: #991b1b; }
.platform-badge.tiktok { background: #dbeafe; color: #1e40af; }
.platform-badge.instagram { background: #fce7f3; color: #9f1239; }
.platform-badge.facebook { background: #dbeafe; color: #1e3a8a; }
.platform-badge.x { background: #f3f4f6; color: #111827; }
.platform-badge.reddit { background: #fee2e2; color: #7f1d1d; }

.worker-badge {
  padding: 0.25rem 0.5rem;
  background: #e0e7ff;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.no-worker {
  color: #9ca3af;
  font-style: italic;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending { background: #fef3c7; color: #92400e; }
.status-badge.assigned { background: #dbeafe; color: #1e40af; }
.status-badge.processing { background: #ddd6fe; color: #5b21b6; }
.status-badge.completed { background: #d1fae5; color: #065f46; }
.status-badge.failed { background: #fee2e2; color: #991b1b; }

.priority-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.priority-badge.normal { background: #f3f4f6; color: #6b7280; }
.priority-badge.medium { background: #fef3c7; color: #92400e; }
.priority-badge.high { background: #fee2e2; color: #991b1b; }

.btn-refresh, .btn-create, .filter-select {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled), .btn-create:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-create {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-create:hover {
  background: #2563eb;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.job-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
}

.platform-checkboxes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.checkbox-label:hover {
  background: #f9fafb;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-cancel, .btn-submit {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  background: #3b82f6;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #2563eb;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  padding: 1rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 6px;
  font-weight: 500;
}

.success-message {
  padding: 1rem;
  background: #d1fae5;
  color: #065f46;
  border-radius: 6px;
  font-weight: 500;
}
</style>
