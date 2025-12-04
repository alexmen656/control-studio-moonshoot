<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import TableHeader from '@/components/TableHeader.vue'
import StatusFilter from '@/components/StatusFilter.vue'
import HomeHeader from '@/components/HomeHeader.vue'
//import PostTypeFilter from '@/components/PostTypeFilter.vue'

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
  status: 'ready' | 'uploading' | 'processing' | 'scheduled' | 'published' | 'failed' | 'awaiting-details'
  progress?: number
  platforms: Array<'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'x' | 'reddit'>//| 'linkedin'
  views?: number
  filename?: string
  originalName?: string
  description?: string
  tags?: string[]
  scheduledDate?: Date | string
  advancedOptions?: {
    instagram?: {
      locationId?: string
      shareToFeed?: boolean
      coverUrl?: string
      audioName?: string
    }
    tiktok?: {
      privacyLevel?: string
      disableDuet?: boolean
      disableComment?: boolean
      disableStitch?: boolean
      videoCoverTimestampMs?: number
    }
    youtube?: {
      categoryId?: string
      privacyStatus?: string
      madeForKids?: boolean
      embeddable?: boolean
      publicStatsViewable?: boolean
    }
    facebook?: {
      published?: boolean
      scheduledPublishTime?: string
      targetingCountries?: string
    }
    x?: {
      forSuperFollowersOnly?: boolean
      replySettings?: string
    }
    reddit?: {
      subreddit?: string
      nsfw?: boolean
      spoiler?: boolean
      sendReplies?: boolean
    }
  }
}

const videos = ref<Video[]>([])
const viewMode = ref<'grid' | 'list'>('grid')
const selectedVideos = ref<Set<string>>(new Set())
const filterStatus = ref<string>('all')
const searchQuery = ref('')
const showUploadModal = ref(false)
const postTypeFilter = ref<string>('all')
//const uploadingFiles = ref<File[]>([])
//const uploadProgress = ref<{ [key: string]: number }>({})
const isLoading = ref(false)
const showDetailsModal = ref(false)
const selectedVideoForDetails = ref<Video | null>(null)
const connectedPlatforms = ref<Array<string>>([])
const videoDetailsForm = ref({
  title: '',
  description: '',
  tags: '',
  platforms: [] as Array<'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'x' | 'reddit'>,
  advancedOptions: {
    instagram: {
      locationId: '',
      shareToFeed: true,
      coverUrl: '',
      audioName: ''
    },
    tiktok: {
      privacyLevel: 'PUBLIC_TO_EVERYONE',
      disableDuet: false,
      disableComment: false,
      disableStitch: false,
      videoCoverTimestampMs: 1000
    },
    youtube: {
      categoryId: '22',
      privacyStatus: 'public',
      madeForKids: false,
      embeddable: true,
      publicStatsViewable: true
    },
    facebook: {
      published: true,
      scheduledPublishTime: '',
      targetingCountries: ''
    },
    x: {
      forSuperFollowersOnly: false,
      replySettings: 'everyone'
    },
    reddit: {
      subreddit: '',
      nsfw: false,
      spoiler: false,
      sendReplies: true
    }
  }
})
const showAdvancedOptions = ref(false)

const loadVideos = async () => {
  const PROJECT_ID = localStorage.getItem('currentProjectId') ? `project_id=${localStorage.getItem('currentProjectId')}` : ''

  try {
    isLoading.value = true
    const response = await axios.get(`/videos?${PROJECT_ID}`)
    if (response.status === 200) {
      videos.value = response.data.map((v: any) => ({
        ...v,
        uploadDate: new Date(v.uploadDate)
      }))

      videos.value.forEach(async (video) => {
        if (video.duration === '0:00' && video.filename) {
          updateVideoDuration(video)
        }
      })
    }
  } catch (error) {
    console.error('Error loading videos:', error)
  } finally {
    isLoading.value = false
  }
}

const loadConnectedPlatforms = async () => {
  const PROJECT_ID = localStorage.getItem('currentProjectId') || '2'

  try {
    const response = await axios.get(`/connected-platforms?project_id=${PROJECT_ID}`)
    if (response.status === 200) {
      connectedPlatforms.value = response.data.platforms || []
    }
  } catch (error) {
    console.error('Error loading connected platforms:', error)
  }
}

const updateVideoDuration = async (video: Video) => {
  try {
    const videoElement = document.createElement('video')
    videoElement.preload = 'metadata'

    videoElement.onloadedmetadata = async () => {
      const duration = videoElement.duration
      const minutes = Math.floor(duration / 60)
      const seconds = Math.floor(duration % 60)
      const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`

      const index = videos.value.findIndex(v => v.id === video.id)
      if (index !== -1 && videos.value[index]) {
        videos.value[index].duration = formattedDuration
      }

      await axios.patch(`/videos/${video.id}/duration`, {
        duration: formattedDuration
      })

      URL.revokeObjectURL(videoElement.src)
    }

    const uploadURL = import.meta.env.MODE === 'production' ? 'https://api.reelmia.com' : 'http://localhost:6709'
    videoElement.src = `${uploadURL}/uploads/${video.filename}`
  } catch (error) {
    console.error('Error updating video duration:', error)
  }
}

const uploadURL = import.meta.env.MODE === 'production' ? 'https://api.reelmia.com' : 'http://localhost:6709'

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const files = Array.from(input.files)
  await uploadFiles(files)
}

const uploadFiles = async (files: File[]) => {
  for (const file of files) {
    try {
      const formData = new FormData()
      formData.append('video', file)
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''))

      const PROJECT_ID = localStorage.getItem('currentProjectId')
      if (PROJECT_ID) {
        formData.append('project_id', PROJECT_ID)
      }

      const tempId = `temp-${Date.now()}`
      videos.value.unshift({
        id: tempId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        thumbnail: 'https://via.placeholder.com/400x225',
        duration: '0:00',
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadDate: new Date(),
        status: 'uploading',
        progress: 0,
        platforms: [],
        views: 0
      })

      //shitty as fuck since we alreday have project id in form data but I dont want to edit the auth backend
      const response = await axios.post(`/upload?project_id=${PROJECT_ID}`, formData)

      if (response.status === 200 || response.status === 201) {
        const result = response.data
        const index = videos.value.findIndex(v => v.id === tempId)
        if (index !== -1) {
          const updatedVideo = {
            ...result.video,
            uploadDate: new Date(result.video.uploadDate),
            status: 'awaiting-details'
          }
          videos.value[index] = updatedVideo
          updateVideoDuration(updatedVideo)
        }
      } else {
        const index = videos.value.findIndex(v => v.id === tempId)
        if (index !== -1 && videos.value[index]) {
          videos.value[index].status = 'failed'
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  showUploadModal.value = false
}

const triggerFileUpload = () => {
  const input = document.getElementById('video-file-input') as HTMLInputElement
  if (input) input.click()
}

const deleteVideo = async (id: string) => {
  if (!confirm('Delete this video?')) return

  try {
    const response = await axios.delete(`/videos/${id}`)

    if (response.status === 200) {
      videos.value = videos.value.filter(v => v.id !== id)
    }
  } catch (error) {
    console.error('Error deleting video:', error)
  }
}

const bulkDelete = async () => {
  if (!confirm(`Delete ${selectedVideos.value.size} selected videos?`)) return

  try {
    const response = await axios.post(`/videos/bulk-delete`, {
      videoIds: Array.from(selectedVideos.value)
    })

    if (response.status === 200) {
      videos.value = videos.value.filter(v => !selectedVideos.value.has(v.id))
      selectedVideos.value.clear()
    }
  } catch (error) {
    console.error('Error bulk deleting videos:', error)
  }
}

const handleDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const videoFiles = Array.from(files).filter(file => file.type.startsWith('video/'))
    if (videoFiles.length > 0) {
      uploadFiles(videoFiles)
    }
  }
}

function handleProjectChanged(event: Event) {
  const customEvent = event as CustomEvent
  const project = customEvent.detail
  console.log('Project changed to:', project)
  loadVideos()
  loadConnectedPlatforms()
}

onMounted(() => {
  loadVideos()
  loadConnectedPlatforms()

  const handleOpenUploadModal = () => {
    showUploadModal.value = true
  }

  window.addEventListener('open-upload-modal', handleOpenUploadModal)
  window.addEventListener('project-changed', handleProjectChanged)

  return () => {
    window.removeEventListener('open-upload-modal', handleOpenUploadModal)
    window.removeEventListener('project-changed', handleProjectChanged)
  }
})

const filteredVideos = computed(() => {
  return videos.value.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesFilter = filterStatus.value === 'all' || video.status === filterStatus.value
    return matchesSearch && matchesFilter
  })
})

const selectAllVideos = () => {
  if (selectedVideos.value.size === filteredVideos.value.length) {
    selectedVideos.value.clear()
  } else {
    selectedVideos.value = new Set(filteredVideos.value.map(v => v.id))
  }
}

const toggleVideoSelection = (id: string) => {
  if (selectedVideos.value.has(id)) {
    selectedVideos.value.delete(id)
  } else {
    selectedVideos.value.add(id)
  }
}



const getStatusColor = (status: string) => {
  const colors = {
    ready: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    uploading: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    processing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    scheduled: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    failed: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    'awaiting-details': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
  }
  return colors[status as keyof typeof colors] || colors.ready
}

const getPlatformIcon = (platform: string) => {
  const icons = {
    instagram: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
    tiktok: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>`,
    youtube: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    facebook: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    x: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    reddit: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>`
  }
  return icons[platform as keyof typeof icons] || ''
}

const bulkSchedule = () => {
  alert(`Schedule ${selectedVideos.value.size} videos`)
}

const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatViews = (views?: number) => {
  if (!views) return 'N/A'
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
  return views.toString()
}

const openDetailsModal = (video: Video) => {
  selectedVideoForDetails.value = video

  const defaultAdvancedOptions = {
    instagram: {
      locationId: '',
      shareToFeed: true,
      coverUrl: '',
      audioName: ''
    },
    tiktok: {
      privacyLevel: 'PUBLIC_TO_EVERYONE',
      disableDuet: false,
      disableComment: false,
      disableStitch: false,
      videoCoverTimestampMs: 1000
    },
    youtube: {
      categoryId: '22',
      privacyStatus: 'public',
      madeForKids: false,
      embeddable: true,
      publicStatsViewable: true
    },
    facebook: {
      published: true,
      scheduledPublishTime: '',
      targetingCountries: ''
    },
    x: {
      forSuperFollowersOnly: false,
      replySettings: 'everyone'
    },
    reddit: {
      subreddit: '',
      nsfw: false,
      spoiler: false,
      sendReplies: true
    }
  }

  const savedAdvancedOptions = (video as any).advancedOptions || {}
  const mergedAdvancedOptions = {
    instagram: { ...defaultAdvancedOptions.instagram, ...savedAdvancedOptions.instagram },
    tiktok: { ...defaultAdvancedOptions.tiktok, ...savedAdvancedOptions.tiktok },
    youtube: { ...defaultAdvancedOptions.youtube, ...savedAdvancedOptions.youtube },
    facebook: { ...defaultAdvancedOptions.facebook, ...savedAdvancedOptions.facebook },
    x: { ...defaultAdvancedOptions.x, ...savedAdvancedOptions.x },
    reddit: { ...defaultAdvancedOptions.reddit, ...savedAdvancedOptions.reddit }
  }

  videoDetailsForm.value = {
    title: video.title || '',
    description: video.description || '',
    tags: video.tags?.join(', ') || '',
    platforms: video.platforms || [],
    advancedOptions: mergedAdvancedOptions
  }
  showAdvancedOptions.value = false
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedVideoForDetails.value = null
  videoDetailsForm.value = {
    title: '',
    description: '',
    tags: '',
    platforms: [],
    advancedOptions: {
      instagram: {
        locationId: '',
        shareToFeed: true,
        coverUrl: '',
        audioName: ''
      },
      tiktok: {
        privacyLevel: 'PUBLIC_TO_EVERYONE',
        disableDuet: false,
        disableComment: false,
        disableStitch: false,
        videoCoverTimestampMs: 1000
      },
      youtube: {
        categoryId: '22',
        privacyStatus: 'public',
        madeForKids: false,
        embeddable: true,
        publicStatsViewable: true
      },
      facebook: {
        published: true,
        scheduledPublishTime: '',
        targetingCountries: ''
      },
      x: {
        forSuperFollowersOnly: false,
        replySettings: 'everyone'
      },
      reddit: {
        subreddit: '',
        nsfw: false,
        spoiler: false,
        sendReplies: true
      }
    }
  }
  showAdvancedOptions.value = false
}

const togglePlatform = (platform: 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'x' | 'reddit') => {
  const index = videoDetailsForm.value.platforms.indexOf(platform)
  if (index > -1) {
    videoDetailsForm.value.platforms.splice(index, 1)
  } else {
    videoDetailsForm.value.platforms.push(platform)
  }
}

const getPlatformDisplayName = (platform: string) => {
  const names: { [key: string]: string } = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    facebook: 'Facebook',
    x: 'X (Twitter)',
    reddit: 'Reddit'
  }
  return names[platform] || platform
}

const getPlatformDescription = (platform: string) => {
  const descriptions: { [key: string]: string } = {
    instagram: 'Reels & Stories',
    tiktok: 'Short Videos',
    youtube: 'Video Platform',
    facebook: 'Video Posts',
    x: 'Tweet with Video',
    reddit: 'Video Posts'
  }
  return descriptions[platform] || ''
}

const saveVideoDetails = async () => {
  if (!selectedVideoForDetails.value) return

  try {
    const response = await axios.patch(`/videos/${selectedVideoForDetails.value.id}`, {
      title: videoDetailsForm.value.title,
      description: videoDetailsForm.value.description,
      tags: videoDetailsForm.value.tags.split(',').map(t => t.trim()).filter(t => t),
      platforms: videoDetailsForm.value.platforms,
      advancedOptions: videoDetailsForm.value.advancedOptions,
      status: 'ready'
    })

    if (response.status === 200) {
      const result = response.data
      const index = videos.value.findIndex(v => v.id === selectedVideoForDetails.value!.id)
      if (index !== -1) {
        videos.value[index] = {
          ...videos.value[index],
          ...result.video,
          status: 'ready'
        }
      }
      closeDetailsModal()
    }
  } catch (error) {
    console.error('Error saving video details:', error)
  }
}
</script>

<template>
  <div class="h-full flex flex-col bg-white dark:bg-gray-900">
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <HomeHeader @open-upload-modal="showUploadModal = true" />
    </div>
    <div class="px-8 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex-1 min-w-[200px] max-w-sm">
          <div class="relative">
            <svg class="absolute left-3 top-1.5 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clip-rule="evenodd" />
            </svg>
            <input v-model="searchQuery" type="text" placeholder="Search..."
              class="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
          </div>
        </div>
        <!--<PostTypeFilter v-model="postTypeFilter" />-->
        <StatusFilter v-model="filterStatus" />
        <div class="flex items-center gap-2 ml-auto">
          <div v-if="selectedVideos.size > 0"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <span class="text-xs font-medium text-orange-700 dark:text-orange-300">
              {{ selectedVideos.size }}
            </span>
            <button @click="bulkSchedule"
              class="p-1 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/40 rounded transition-colors"
              title="Schedule">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clip-rule="evenodd" />
              </svg>
            </button>
            <button @click="bulkDelete"
              class="p-1 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/40 rounded transition-colors"
              title="Delete">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <div class="flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-gray-800 rounded-md">
            <button @click="viewMode = 'grid'" :class="[
              'p-1.5 rounded transition-colors',
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-700 text-violet-600 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            ]">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button @click="viewMode = 'list'" :class="[
              'p-1.5 rounded transition-colors',
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-700 text-violet-600 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            ]">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto p-8">
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="video in filteredVideos" :key="video.id"
          class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all overflow-hidden">
          <div class="relative aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <video v-if="video.filename" class="w-full h-full object-cover" muted preload="metadata"
              :src="`${uploadURL}/uploads/${video.filename}#t=0.1`">
            </video>
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div
              class="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
              <button @click="router.push({ name: 'video', params: { id: video.id } })"
                class="opacity-0 group-hover:opacity-100 bg-white text-gray-900 rounded-full p-3 shadow-lg hover:scale-110 transition-all">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div class="absolute top-2 right-2 flex gap-1.5">
              <div class="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <!--<span>🎬</span>-->
                <span>{{ video.duration }}</span>
              </div>
            </div>
            <div class="absolute top-2 left-2">
              <label class="custom-checkbox">
                <input type="checkbox" :checked="selectedVideos.has(video.id)"
                  @change="toggleVideoSelection(video.id)" />
                <span class="checkmark"></span>
              </label>
            </div>
          </div>
          <div class="p-4">
            <h3
              class="font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate cursor-pointer hover:text-violet-600 transition-colors"
              @click="router.push({ name: 'video', params: { id: video.id } })">{{ video.title }}</h3>
            <div class="flex items-center gap-2 mb-3">
              <span :class="['text-xs px-2 py-1 rounded-full font-medium', getStatusColor(video.status)]">
                {{ video.status.charAt(0).toUpperCase() + video.status.slice(1) }}
              </span>
              <span v-if="video.views" class="text-xs text-gray-500 dark:text-gray-400">
                👁 {{ formatViews(video.views) }}
              </span>
            </div>
            <div v-if="video.status === 'uploading' && video.progress !== undefined" class="mb-3">
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div class="bg-violet-500 h-full transition-all" :style="{ width: `${video.progress}%` }">
                </div>
              </div>
              <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ video.progress }}%</span>
            </div>
            <div class="flex items-center gap-1 mb-3">
              <span v-for="platform in video.platforms" :key="platform" class="text-gray-600 dark:text-gray-400"
                :title="platform" v-html="getPlatformIcon(platform)">
              </span>
            </div>
            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{{ video.size }}</span>
              <span>{{ formatDate(video.uploadDate) }}</span>
            </div>
            <div v-if="video.status === 'awaiting-details'" class="mt-3">
              <button @click="openDetailsModal(video)"
                class="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Add Details
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-6 py-3 text-left">
                <label class="custom-checkbox">
                  <input type="checkbox" :checked="selectedVideos.size === filteredVideos.length"
                    @change="selectAllVideos" />
                  <span class="checkmark"></span>
                </label>
              </th>
              <TableHeader />
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="video in filteredVideos" :key="video.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-6 py-4">
                <label class="custom-checkbox">
                  <input type="checkbox" :checked="selectedVideos.has(video.id)"
                    @change="toggleVideoSelection(video.id)" />
                  <span class="checkmark"></span>
                </label>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="relative w-20 h-12 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                    <video v-if="video.filename" class="w-full h-full object-cover" muted>
                      <source :src="`${uploadURL}/uploads/${video.filename}`" type="video/mp4">
                    </video>
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div
                      class="absolute bottom-0 right-0 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 text-[10px]">
                      {{ video.duration }}
                    </div>
                  </div>
                  <div class="min-w-0">
                    <div class="font-medium text-gray-900 dark:text-gray-100 truncate cursor-pointer hover:text-red-600"
                      @click="router.push({ name: 'video', params: { id: video.id } })">{{
                        video.title }}</div>
                    <div v-if="video.status === 'uploading' && video.progress !== undefined" class="mt-1">
                      <div class="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div class="bg-violet-500 h-full" :style="{ width: `${video.progress}%` }">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span :class="['text-xs px-2 py-1 rounded-full font-medium', getStatusColor(video.status)]">
                  {{ video.status.charAt(0).toUpperCase() + video.status.slice(1) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-1">
                  <span v-for="platform in video.platforms" :key="platform" class="text-gray-600 dark:text-gray-400"
                    :title="platform" v-html="getPlatformIcon(platform)">
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ formatViews(video.views) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ video.size }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(video.uploadDate) }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <button v-if="video.status === 'awaiting-details'" @click="openDetailsModal(video)"
                    class="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded font-medium transition-colors flex items-center gap-1"
                    title="Add Details">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Add Details
                  </button>
                  <button @click="openDetailsModal(video)"
                    class="p-1.5 text-gray-400 hover:text-violet-600 transition-colors" title="Edit">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button @click="deleteVideo(video.id)"
                    class="p-1.5 text-gray-400 hover:text-violet-600 transition-colors" title="Delete">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="filteredVideos.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
        <svg class="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No videos found</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          {{ searchQuery ? 'Try adjusting your search' : 'Get started by uploading your first video' }}
        </p>
        <button v-if="!searchQuery" @click="showUploadModal = true"
          class="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors">
          Upload Videos
        </button>
      </div>
    </div>
    <div v-if="showUploadModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click="showUploadModal = false">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-8" @click.stop>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Upload Videos</h2>
          <button @click="showUploadModal = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center"
          @drop.prevent="handleDrop" @dragover.prevent @click="triggerFileUpload">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Drop your videos here</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">or click to browse</p>
          <button @click.stop="triggerFileUpload"
            class="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors font-medium">
            Choose Files
          </button>
          <input id="video-file-input" type="file" multiple accept="video/*" class="hidden"
            @change="handleFileSelect" />
        </div>
      </div>
    </div>
    <div v-if="showDetailsModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click="closeDetailsModal">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop>
        <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Video Details</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Complete the information for your video
              </p>
            </div>
            <button @click="closeDetailsModal"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        <div class="px-8 py-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video Title *
            </label>
            <input v-model="videoDetailsForm.title" type="text" required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Enter a catchy title for your video" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea v-model="videoDetailsForm.description" rows="4"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              placeholder="Describe your video content..."></textarea>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ videoDetailsForm.description.length }} characters
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <input v-model="videoDetailsForm.tags" type="text"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="e.g. tutorial, funny, cooking (comma separated)" />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Separate tags with commas
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Platforms *
            </label>
            <div v-if="connectedPlatforms.length === 0" class="text-center py-8">
              <svg class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">No platforms connected</p>
              <p class="text-xs text-gray-400 dark:text-gray-500">Connect platforms in the Accounts section first</p>
            </div>
            <div v-else class="grid grid-cols-2 gap-3">
              <button v-for="platform in connectedPlatforms" :key="platform" @click="togglePlatform(platform as any)"
                type="button" :class="[
                  'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                  videoDetailsForm.platforms.includes(platform as any)
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                ]">
                <div class="text-gray-600 dark:text-gray-400 w-6 h-6 flex items-center justify-center"
                  v-html="getPlatformIcon(platform)">
                </div>
                <div class="text-left flex-1">
                  <div class="font-medium text-gray-900 dark:text-gray-100">{{ getPlatformDisplayName(platform) }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ getPlatformDescription(platform) }}</div>
                </div>
                <div v-if="videoDetailsForm.platforms.includes(platform as any)" class="ml-auto">
                  <svg class="w-5 h-5 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd" />
                  </svg>
                </div>
              </button>
            </div>
            <p v-if="videoDetailsForm.platforms.length === 0 && connectedPlatforms.length > 0"
              class="text-xs text-violet-500 dark:text-orange-400 mt-2">
              Please select at least one platform
            </p>
          </div>
          <div v-if="videoDetailsForm.platforms.length > 0" class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <button @click="showAdvancedOptions = !showAdvancedOptions" type="button"
              class="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span class="font-medium text-gray-900 dark:text-gray-100">Advanced Options</span>
              </div>
              <svg :class="['w-5 h-5 text-gray-500 transition-transform', showAdvancedOptions ? 'rotate-180' : '']"
                fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd" />
              </svg>
            </button>
            <div v-if="showAdvancedOptions" class="mt-4 space-y-6">
              <div v-if="videoDetailsForm.platforms.includes('instagram')"
                class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div class="flex items-center gap-2 mb-4">
                  <div class="text-gray-600 dark:text-gray-400 w-5 h-5" v-html="getPlatformIcon('instagram')"></div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100">Instagram Options</h4>
                </div>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location ID</label>
                    <input v-model="videoDetailsForm.advancedOptions.instagram.locationId" type="text"
                      class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="e.g., 213385402" />
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Instagram location ID for tagging</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Audio Name</label>
                    <input v-model="videoDetailsForm.advancedOptions.instagram.audioName" type="text"
                      class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Audio track name" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover URL</label>
                    <input v-model="videoDetailsForm.advancedOptions.instagram.coverUrl" type="url"
                      class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="https://example.com/cover.jpg" />
                  </div>
                  <div class="flex items-center">
                    <input v-model="videoDetailsForm.advancedOptions.instagram.shareToFeed" type="checkbox"
                      id="instagram-share-feed"
                      class="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                    <label for="instagram-share-feed" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Share to
                      Feed</label>
                  </div>
                </div>
              </div>
              <div v-if="videoDetailsForm.platforms.includes('tiktok')"
                class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div class="flex items-center gap-2 mb-4">
                  <div class="text-gray-600 dark:text-gray-400 w-5 h-5" v-html="getPlatformIcon('tiktok')"></div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100">TikTok Options</h4>
                </div>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Privacy Level</label>
                    <select v-model="videoDetailsForm.advancedOptions.tiktok.privacyLevel"
                      class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                      <option value="PUBLIC_TO_EVERYONE">Public</option>
                      <option value="MUTUAL_FOLLOW_FRIENDS">Friends</option>
                      <option value="SELF_ONLY">Private</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Timestamp
                      (ms)</label>
                    <input v-model.number="videoDetailsForm.advancedOptions.tiktok.videoCoverTimestampMs" type="number"
                      class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="1000" />
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Timestamp for video cover thumbnail</p>
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center">
                      <input v-model="videoDetailsForm.advancedOptions.tiktok.disableDuet" type="checkbox"
                        id="tiktok-disable-duet"
                        class="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                      <label for="tiktok-disable-duet" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Disable
                        Duet</label>
                    </div>
                    <div class="flex items-center">
                      <input v-model="videoDetailsForm.advancedOptions.tiktok.disableComment" type="checkbox"
                        id="tiktok-disable-comment"
                        class="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                      <label for="tiktok-disable-comment" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Disable
                        Comments</label>
                    </div>
                    <div class="flex items-center">
                      <input v-model="videoDetailsForm.advancedOptions.tiktok.disableStitch" type="checkbox"
                        id="tiktok-disable-stitch"
                        class="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                      <label for="tiktok-disable-stitch" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Disable
                        Stitch</label>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="videoDetailsForm.platforms.includes('youtube')"
                class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div class="flex items-center gap-2 mb-4">
                  <div class="text-gray-600 dark:text-gray-400 w-5 h-5" v-html="getPlatformIcon('youtube')"></div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100">YouTube Options</h4>
                </div>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Privacy
                      Status</label>
                    <select v-model="videoDetailsForm.advancedOptions.youtube.privacyStatus"
                      class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                      <option value="public">Public</option>
                      <option value="unlisted">Unlisted</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category ID</label>
                    <input v-model="videoDetailsForm.advancedOptions.youtube.categoryId" type="text"
                      class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="22" />
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">YouTube category (22 = People & Blogs)</p>
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center">
                      <input v-model="videoDetailsForm.advancedOptions.youtube.madeForKids" type="checkbox"
                        id="youtube-made-for-kids"
                        class="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                      <label for="youtube-made-for-kids" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Made for
                        Kids</label>
                    </div>
                    <div class="flex items-center">
                      <input v-model="videoDetailsForm.advancedOptions.youtube.embeddable" type="checkbox"
                        id="youtube-embeddable"
                        class="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                      <label for="youtube-embeddable" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Allow
                        Embedding</label>
                    </div>
                    <div class="flex items-center">
                      <input v-model="videoDetailsForm.advancedOptions.youtube.publicStatsViewable" type="checkbox"
                        id="youtube-public-stats"
                        class="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                      <label for="youtube-public-stats" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Public
                        Stats Viewable</label>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="videoDetailsForm.platforms.includes('facebook')"
                class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div class="flex items-center gap-2 mb-4">
                  <div class="text-gray-600 dark:text-gray-400 w-5 h-5" v-html="getPlatformIcon('facebook')"></div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100">Facebook Options</h4>
                </div>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Scheduled Publish
                      Time</label>
                    <input v-model="videoDetailsForm.advancedOptions.facebook.scheduledPublishTime"
                      type="datetime-local"
                      class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave empty to publish immediately</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Targeting
                      Countries</label>
                    <input v-model="videoDetailsForm.advancedOptions.facebook.targetingCountries" type="text"
                      class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="US,DE,FR" />
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Comma-separated country codes</p>
                  </div>
                  <div class="flex items-center">
                    <input v-model="videoDetailsForm.advancedOptions.facebook.published" type="checkbox"
                      id="facebook-published"
                      class="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                    <label for="facebook-published" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Publish
                      Immediately</label>
                  </div>
                </div>
              </div>
              <div v-if="videoDetailsForm.platforms.includes('x')"
                class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div class="flex items-center gap-2 mb-4">
                  <div class="text-gray-600 dark:text-gray-400 w-5 h-5" v-html="getPlatformIcon('x')"></div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100">X (Twitter) Options</h4>
                </div>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reply
                      Settings</label>
                    <select v-model="videoDetailsForm.advancedOptions.x.replySettings"
                      class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                      <option value="everyone">Everyone</option>
                      <option value="following">People you follow</option>
                      <option value="mentioned">Only mentioned users</option>
                    </select>
                  </div>
                  <div class="flex items-center">
                    <input v-model="videoDetailsForm.advancedOptions.x.forSuperFollowersOnly" type="checkbox"
                      id="x-super-followers"
                      class="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                    <label for="x-super-followers" class="ml-2 text-sm text-gray-700 dark:text-gray-300">For Super
                      Followers Only</label>
                  </div>
                </div>
              </div>
              <div v-if="videoDetailsForm.platforms.includes('reddit')"
                class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div class="flex items-center gap-2 mb-4">
                  <div class="text-gray-600 dark:text-gray-400 w-5 h-5" v-html="getPlatformIcon('reddit')"></div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100">Reddit Options</h4>
                </div>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subreddit *</label>
                    <input v-model="videoDetailsForm.advancedOptions.reddit.subreddit" type="text" required
                      class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="e.g., videos" />
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Subreddit name (without r/)</p>
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center">
                      <input v-model="videoDetailsForm.advancedOptions.reddit.nsfw" type="checkbox" id="reddit-nsfw"
                        class="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                      <label for="reddit-nsfw" class="ml-2 text-sm text-gray-700 dark:text-gray-300">NSFW (18+)</label>
                    </div>
                    <div class="flex items-center">
                      <input v-model="videoDetailsForm.advancedOptions.reddit.spoiler" type="checkbox"
                        id="reddit-spoiler"
                        class="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                      <label for="reddit-spoiler" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Spoiler</label>
                    </div>
                    <div class="flex items-center">
                      <input v-model="videoDetailsForm.advancedOptions.reddit.sendReplies" type="checkbox"
                        id="reddit-send-replies"
                        class="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                      <label for="reddit-send-replies" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Send Reply
                        Notifications</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="sticky bottom-0 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 px-8 py-4 flex items-center justify-end gap-3">
          <button @click="closeDetailsModal"
            class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
            Cancel
          </button>
          <button @click="saveVideoDetails"
            :disabled="!videoDetailsForm.title || videoDetailsForm.platforms.length === 0" :class="[
              'px-6 py-2 rounded-lg font-medium transition-colors',
              !videoDetailsForm.title || videoDetailsForm.platforms.length === 0
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg'
            ]">
            Save & Continue
          </button>
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

.custom-checkbox {
  display: block;
  position: relative;
  cursor: pointer;
  user-select: none;
  width: 20px;
  height: 20px;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  width: 0;
  height: 0;
}

.custom-checkbox .checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: white;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  transition: all 0.2s ease;
}

@media (prefers-color-scheme: dark) {
  .custom-checkbox .checkmark {
    background-color: #374151;
    border-color: #4b5563;
  }
}

.custom-checkbox:hover input~.checkmark {
  border-color: #ef4444;
}

.custom-checkbox input:checked~.checkmark {
  background-color: #ef4444;
  border-color: #ef4444;
}

.custom-checkbox .checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.custom-checkbox input:checked~.checkmark:after {
  display: block;
}
</style>
