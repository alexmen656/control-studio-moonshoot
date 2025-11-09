<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
    <div class="p-8 max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-6">Worker Management</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300">
            <p class="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Total Workers</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ workers.length }}</p>
          </div>
          <div class="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-sm text-white">
            <p class="text-sm opacity-90 font-medium mb-2">Online</p>
            <p class="text-3xl font-bold">{{ onlineWorkers }}</p>
          </div>
          <div
            class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300">
            <p class="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Total Jobs</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ jobs.length }}</p>
          </div>
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-sm text-white">
            <p class="text-sm opacity-90 font-medium mb-2">Processing</p>
            <p class="text-3xl font-bold">{{ processingJobs }}</p>
          </div>
        </div>
      </div>
      <section class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Workers</h2>
          <button @click="refreshWorkers" :disabled="loading"
            class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 font-medium transition-all duration-200">
            <span v-if="!loading">Refresh</span>
            <span v-else>⏳ Loading...</span>
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="worker in workers" :key="worker.worker_id"
            class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-xl transition-all duration-200"
            :class="{ 'opacity-60': worker.status !== 'online' }">
            <div class="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3">
                <span class="inline-block w-2.5 h-2.5 rounded-full"
                  :class="worker.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'"></span>
                <h3 class="font-semibold text-gray-900 dark:text-white">{{ worker.worker_name }}</h3>
              </div>
              <span class="text-xs font-semibold px-3 py-1 rounded-full transition-colors duration-200" :class="worker.status === 'online'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'">
                {{ worker.status }}
              </span>
            </div>
            <div class="space-y-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">ID:</span>
                <span class="font-mono text-gray-900 dark:text-gray-300">{{ worker.worker_id.substring(0, 16)
                  }}...</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Hostname:</span>
                <span class="text-gray-900 dark:text-gray-300">{{ worker.hostname }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Last Heartbeat:</span>
                <span class="text-gray-900 dark:text-gray-300">{{ formatDate(worker.last_heartbeat) }}</span>
              </div>
            </div>
            <div class="space-y-3">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Load</span>
                  <span class="text-xs font-semibold text-gray-900 dark:text-gray-300">{{ worker.current_load }} / {{
                    worker.max_concurrent_tasks }}</span>
                </div>
                <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
                    :style="{ width: `${(worker.current_load / worker.max_concurrent_tasks) * 100}%` }"></div>
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">CPU</span>
                  <span class="text-xs font-semibold text-gray-900 dark:text-gray-300">{{ Number(worker.cpu_usage ||
                    0).toFixed(1) }}%</span>
                </div>
                <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300"
                    :style="{ width: `${worker.cpu_usage || 0}%` }"></div>
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">RAM</span>
                  <span class="text-xs font-semibold text-gray-900 dark:text-gray-300">{{ Number(worker.memory_usage ||
                    0).toFixed(1) }}%</span>
                </div>
                <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-300"
                    :style="{ width: `${worker.memory_usage || 0}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="workers.length === 0" class="text-center py-12">
          <p class="text-gray-600 dark:text-gray-400 text-lg">😔 No workers found. Start some workers to see them here.
          </p>
        </div>
      </section>
      <section>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Jobs</h2>
          <div class="flex gap-2">
            <select v-model="jobFilter"
              class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-sm">
              <option value="all">All Jobs</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <button @click="openCreateJobModal('upload')"
              class="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors duration-200 text-sm">
              Upload Job
            </button>
            <button @click="openCreateJobModal('analytics')"
              class="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors duration-200 text-sm">
              Analytics Job
            </button>
            <button @click="refreshJobs" :disabled="loading"
              class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 font-medium transition-all duration-200 text-sm">
              Refresh
            </button>
          </div>
        </div>
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Job ID</th>
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Platform</th>
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Video ID</th>
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Worker</th>
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status</th>
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Priority</th>
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Created</th>
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Duration</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="job in filteredJobs" :key="job.job_id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                  <td class="px-6 py-4 text-sm font-mono text-gray-900 dark:text-gray-300">{{ job.job_id.substring(0,
                    20) }}...</td>
                  <td class="px-6 py-4">
                    <span class="inline-block px-2 py-1 rounded text-xs font-semibold"
                      :class="getPlatformBadgeClass(job.platform)">
                      {{ job.platform }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{{ job.video_id }}</td>
                  <td class="px-6 py-4 text-sm">
                    <span v-if="job.worker_name"
                      class="inline-block px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                      {{ job.worker_name }}
                    </span>
                    <span v-else class="text-gray-500 dark:text-gray-500 italic text-xs">Not assigned</span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-block px-2 py-1 rounded text-xs font-semibold"
                      :class="getStatusBadgeClass(job.status)">
                      {{ job.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-block px-2 py-1 rounded text-xs font-semibold"
                      :class="getPriorityBadgeClass(job.priority)">
                      {{ job.priority }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{{ formatDate(job.created_at) }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{{ getJobDuration(job) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="filteredJobs.length === 0" class="text-center py-12">
            <p class="text-gray-600 dark:text-gray-400">No jobs found.</p>
          </div>
        </div>
      </section>
    </div>
    <div v-if="showCreateJobModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ jobModalType === 'upload' ? 'Create Upload Job' : 'Create Analytics Job' }}
          </h2>
          <button @click="showCreateJobModal = false"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            ✕
          </button>
        </div>
        <form v-if="jobModalType === 'upload'" @submit.prevent="createUploadJob" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Video ID *</label>
            <input v-model.number="newUploadJob.video_id" type="number" required placeholder="Enter video ID"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platforms *</label>
            <div class="grid grid-cols-2 gap-2">
              <label v-for="platform in availablePlatforms" :key="platform"
                class="flex items-center gap-2 p-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <input type="checkbox" :value="platform" v-model="newUploadJob.platforms"
                  class="w-4 h-4 rounded accent-blue-500" />
                <span class="text-sm text-gray-700 dark:text-gray-300 capitalize">{{ platform }}</span>
              </label>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
            <select v-model.number="newUploadJob.priority"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
              <option :value="0">Normal (0)</option>
              <option :value="1">High (1)</option>
              <option :value="2">Urgent (2)</option>
            </select>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showCreateJobModal = false"
              class="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors duration-200">
              Cancel
            </button>
            <button type="submit" :disabled="submitting"
              class="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-medium transition-colors duration-200">
              {{ submitting ? 'Creating...' : 'Create' }}
            </button>
          </div>
          <div v-if="createError"
            class="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
            {{ createError }}
          </div>
          <div v-if="createSuccess"
            class="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm">
            Upload jobs created successfully!
          </div>
        </form>
        <form v-if="jobModalType === 'analytics'" @submit.prevent="createAnalyticsJob" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task Type *</label>
            <select v-model="newAnalyticsJob.task_type" required
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
              <option value="channel_analytics">Channel Analytics</option>
              <option value="video_analytics">Video Analytics</option>
              <option value="hourly_analytics">Hourly Analytics</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platforms *</label>
            <div class="grid grid-cols-2 gap-2">
              <label v-for="platform in availablePlatforms" :key="platform"
                class="flex items-center gap-2 p-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <input type="checkbox" :value="platform" v-model="newAnalyticsJob.platforms"
                  class="w-4 h-4 rounded accent-blue-500" />
                <span class="text-sm text-gray-700 dark:text-gray-300 capitalize">{{ platform }}</span>
              </label>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
            <select v-model.number="newAnalyticsJob.priority"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
              <option :value="0">Normal (0)</option>
              <option :value="1">High (1)</option>
              <option :value="2">Urgent (2)</option>
            </select>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showCreateJobModal = false"
              class="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors duration-200">
              Cancel
            </button>
            <button type="submit" :disabled="submitting"
              class="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-medium transition-colors duration-200">
              {{ submitting ? 'Creating...' : 'Create' }}
            </button>
          </div>
          <div v-if="createError"
            class="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
            {{ createError }}
          </div>
          <div v-if="createSuccess"
            class="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm">
            Analytics jobs created successfully!
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from '../axios'

interface Worker {
  id: number
  worker_id: string
  worker_name: string
  hostname: string
  ip_address: string
  status: string
  cpu_usage: number
  memory_usage: number
  current_load: number
  max_concurrent_tasks: number
  last_heartbeat: string
  registered_at: string
  metadata: Record<string, any>
  capabilities: Record<string, any>
}

interface Job {
  id: number
  job_id: string
  worker_id: string | null
  worker_name?: string
  video_id: number
  platform: string
  status: string
  priority: number
  created_at: string
  started_at: string | null
  completed_at: string | null
  error_message: string | null
  retry_count: number
  max_retries: number
  metadata: Record<string, any>
}

interface NewJob {
  video_id: number | null
  platforms: string[]
  priority: number
}

interface NewAnalyticsJob {
  task_type: string
  platforms: string[]
  priority: number
}

const workers = ref<Worker[]>([])
const jobs = ref<Job[]>([])
const loading = ref(false)
const jobFilter = ref('all')
const showCreateJobModal = ref(false)
const jobModalType = ref<'upload' | 'analytics'>('upload')
const submitting = ref(false)
const createError = ref('')
const createSuccess = ref(false)

const newUploadJob = ref<NewJob>({
  video_id: null,
  platforms: [],
  priority: 0
})

const newAnalyticsJob = ref<NewAnalyticsJob>({
  task_type: 'channel_analytics',
  platforms: [],
  priority: 0
})

const availablePlatforms = ['youtube', 'tiktok', 'instagram', 'facebook', 'x', 'reddit']

let refreshInterval: number | null = null

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

async function refreshWorkers() {
  try {
    loading.value = true
    const response = await axios.get('/workers')
    workers.value = response.data.workers || []
  } catch (error) {
    console.error('Error fetching workers:', error)
  } finally {
    loading.value = false
  }
}

async function refreshJobs() {
  try {
    loading.value = true
    const response = await axios.get('/jobs')
    jobs.value = response.data.jobs || []
  } catch (error) {
    console.error('Error fetching jobs:', error)
  } finally {
    loading.value = false
  }
}

function openCreateJobModal(type: 'upload' | 'analytics') {
  jobModalType.value = type
  createError.value = ''
  createSuccess.value = false

  newUploadJob.value = {
    video_id: null,
    platforms: [],
    priority: 0
  }

  newAnalyticsJob.value = {
    task_type: 'channel_analytics',
    platforms: [],
    priority: 0
  }

  showCreateJobModal.value = true
}

async function createUploadJob() {
  if (newUploadJob.value.platforms.length === 0) {
    createError.value = 'Please select at least one platform'
    return
  }

  try {
    submitting.value = true
    createError.value = ''
    createSuccess.value = false

    const project_id = localStorage.getItem('currentProjectId') || 2
    await axios.post(`/jobs?project_id=${project_id}`, newUploadJob.value)

    createSuccess.value = true

    setTimeout(() => {
      refreshJobs()
      showCreateJobModal.value = false
      createSuccess.value = false
    }, 1500)

  } catch (error: any) {
    createError.value = error.response?.data?.error || 'Failed to create upload job'
    console.error('Error creating upload job:', error)
  } finally {
    submitting.value = false
  }
}

async function createAnalyticsJob() {
  if (newAnalyticsJob.value.platforms.length === 0) {
    createError.value = 'Please select at least one platform'
    return
  }

  try {
    submitting.value = true
    createError.value = ''
    createSuccess.value = false

    const project_id = localStorage.getItem('currentProjectId') || 2

    const payload = {
      platforms: newAnalyticsJob.value.platforms,
      task_type: newAnalyticsJob.value.task_type,
      priority: newAnalyticsJob.value.priority
    }

    await axios.post(`/jobs/analytics?project_id=${project_id}`, payload)

    createSuccess.value = true

    setTimeout(() => {
      refreshJobs()
      showCreateJobModal.value = false
      createSuccess.value = false
    }, 1500)

  } catch (error: any) {
    createError.value = error.response?.data?.error || 'Failed to create analytics job'
    console.error('Error creating analytics job:', error)
  } finally {
    submitting.value = false
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`

  return date.toLocaleString()
}

function getJobDuration(job: Job): string {
  if (!job.started_at) return 'N/A'

  const start = new Date(job.started_at)
  const end = job.completed_at ? new Date(job.completed_at) : new Date()
  const diff = end.getTime() - start.getTime()

  if (diff < 1000) return '< 1s'
  if (diff < 60000) return `${Math.floor(diff / 1000)}s`
  return `${Math.floor(diff / 60000)}m ${Math.floor((diff % 60000) / 1000)}s`
}

function getPlatformBadgeClass(platform: string): string {
  const classes: Record<string, string> = {
    youtube: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    tiktok: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    instagram: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
    facebook: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    x: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    reddit: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  }
  return classes[platform] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
}

function getStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    assigned: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    processing: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  }
  return classes[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
}

function getPriorityBadgeClass(priority: number): string {
  if (priority >= 2) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
  if (priority >= 1) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
  return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
}

onMounted(() => {
  refreshWorkers()
  refreshJobs()

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
