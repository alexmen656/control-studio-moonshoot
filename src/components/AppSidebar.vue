<template>
    <div class="w-64 bg-white dark:bg-gray-800 flex flex-col fixed left-0 top-15 bottom-0 sidebar">
        <div v-if="!isVideoDetailPage" class="px-2 pt-2 relative"></div>
        <!--     <button @click.stop="showNewDropdown = !showNewDropdown"
                class="flex items-center space-x-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-600 rounded-full px-6 py-3 w-full transition-all group">
                <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clip-rule="evenodd" />
                </svg>
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100">New</span>
            </button>
            <div v-if="showNewDropdown" @click.stop
                class="absolute left-2 w-60 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                <!-<button @click="createNewFolder"
                    class="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors">
                    <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                    <div>
                        <div class="text-sm font-medium text-gray-900 dark:text-gray-100">New Post</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Create a new post (coming soon)</div>
                    </div>
                </button>--
                <button @click="triggerVideoUpload"
                    class="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors">
                    <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                    <div>
                        <div class="text-sm font-medium text-gray-900 dark:text-gray-100">Longformat Video upload</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Upload video files from your device</div>
                    </div>
                </button>
                <button @click="triggerVideoUpload"
                    class="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors">
                    <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                    <div>
                        <div class="text-sm font-medium text-gray-900 dark:text-gray-100">Shortformat Video upload</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Upload video files from your device</div>
                    </div>
                </button>
                <button @click="triggerVideoUpload"
                    class="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors">
                    <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                    <div>
                        <div class="text-sm font-medium text-gray-900 dark:text-gray-100">Create Post</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Create a post with our post creation tool
                        </div>
                    </div>
                </button>
            </div>
        </div>-->
        <nav class="flex-1 px-2 space-y-1 overflow-y-auto">
            <template v-if="isVideoDetailPage">
                <router-link to="/home"
                    class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20 rounded-lg transition-colors mb-4">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                            clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm font-medium">Channel Content</span>
                </router-link>
                <div class="px-2 py-4 mb-4">
                    <div class="bg-gray-900 rounded-lg overflow-hidden relative">
                        <div class="aspect-video bg-gray-800 relative">
                            <img v-if="currentVideoThumbnail" :src="currentVideoThumbnail"
                                :alt="currentVideoTitle || 'Video thumbnail'" class="w-full h-full object-cover" />
                            <div v-else class="w-full h-full bg-gray-700 flex items-center justify-center">
                                <svg class="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                </svg>
                            </div>
                            <div
                                class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                {{ currentVideoDuration || '0:00' }}
                            </div>
                        </div>
                    </div>
                    <video ref="hiddenVideo" v-if="currentVideoFilename"
                        :src="`${uploadURL}/uploads/${currentVideoFilename}`" @loadedmetadata="onVideoLoadedMetadata"
                        @canplay="generateThumbnail" @durationchange="updateDuration" class="hidden" muted
                        preload="metadata" crossorigin="anonymous"></video>
                    <canvas ref="thumbnailCanvas" class="hidden"></canvas>
                    <div class="mt-3">
                        <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {{ currentVideoTitle || 'Your video' }}
                        </h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            {{ currentVideoSubtitle || 'No Title' }}
                        </p>
                    </div>
                </div>
                <div class="px-2 pt-2 pb-3">
                    <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Video Details</span>
                </div>
                <router-link :to="{ name: 'video', params: { id: route.params.id } }"
                    class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                    active-class="bg-violet-100 dark:bg-violet-900/30 text-primary-900 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-violet-900/40">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <span class="text-sm font-medium">Details</span>
                </router-link>
                <router-link :to="{ name: 'video-analytics', params: { id: route.params.id } }"
                    class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                    active-class="bg-violet-100 dark:bg-violet-900/30 text-primary-900 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-violet-900/40">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    <span class="text-sm font-medium">Analytics</span>
                </router-link>
                <router-link :to="{ name: 'video-comments', params: { id: route.params.id } }"
                    class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                    active-class="bg-violet-100 dark:bg-violet-900/30 text-primary-900 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-violet-900/40">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                            clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm font-medium">Comments</span>
                </router-link>
                <!--<router-link :to="{ name: 'video', params: { id: route.params.id } }"
                    class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                    active-class="bg-violet-100 dark:bg-violet-900/30 text-primary-900 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-violet-900/40">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm font-medium">Editor</span>
                </router-link>
                <router-link :to="{ name: 'video', params: { id: route.params.id } }"
                    class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                    active-class="bg-violet-100 dark:bg-violet-900/30 text-primary-900 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-violet-900/40">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fill-rule="evenodd"
                            d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                            clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm font-medium">Advances Settings</span>
                </router-link>
                <router-link :to="{ name: 'video', params: { id: route.params.id } }"
                    class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                    active-class="bg-violet-100 dark:bg-violet-900/30 text-primary-900 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-violet-900/40">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    <span class="text-sm font-medium">Scheduling</span>
                </router-link>-->
            </template>
            <template v-else>
                <router-link to="/activity"
                    class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20 rounded-full transition-colors"
                    active-class="bg-violet-100 dark:bg-violet-900/30 text-primary-900 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-violet-900/40">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm font-medium">Activity</span>
                </router-link>
                <router-link to="/dashboard"
                    class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20 rounded-full transition-colors"
                    active-class="bg-violet-100 dark:bg-violet-900/30 text-primary-900 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-violet-900/40">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm font-medium">My Posts</span>
                </router-link>
                <!--<router-link to="/planning"
                    class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20 rounded-full transition-colors"
                    active-class="bg-violet-100 dark:bg-violet-900/30 text-primary-700 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-violet-900/40">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fill-rule="evenodd"
                            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.001a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.001a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                            clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm font-medium">Planning</span>
                </router-link>-->
                <router-link to="/schedule"
                    class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20 rounded-full transition-colors"
                    active-class="bg-violet-100 dark:bg-violet-900/30 text-primary-700 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-violet-900/40">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm font-medium">Schedule</span>
                </router-link>

                <router-link to="/analytics"
                    class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20 rounded-full transition-colors"
                    active-class="bg-violet-100 dark:bg-violet-900/30 text-primary-700 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-violet-900/40">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M3 3a1 1 0 011-1h1a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm5 6a1 1 0 011-1h1a1 1 0 011 1v8a1 1 0 01-1 1H9a1 1 0 01-1-1V9zm5-4a1 1 0 011-1h1a1 1 0 011 1v12a1 1 0 01-1 1h-1a1 1 0 01-1-1V5z" />
                    </svg>

                    <span class=" text-sm font-medium">Analytics</span>
                </router-link>
                <router-link to="/accounts"
                    class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20 rounded-full transition-colors"
                    active-class="bg-violet-100 dark:bg-violet-900/30 text-primary-700 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-violet-900/40">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm font-medium">Accounts</span>
                </router-link>
                <router-link to="/project-settings"
                    class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20 rounded-full transition-colors"
                    active-class="bg-violet-100 dark:bg-violet-900/30 text-primary-900 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-violet-900/40">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                            clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm font-medium">Project Settings</span>
                </router-link>
                <div class="border-t border-gray-200 dark:border-gray-700 my-2" v-if="isAdmin"></div>
                <div class="px-4 pt-2" v-if="isAdmin">
                    <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Admin Tools</span>
                </div>
                <router-link to="/workers" v-if="isAdmin"
                    class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20 rounded-full transition-colors"
                    active-class="bg-violet-100 dark:bg-violet-900/30 text-primary-900 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-violet-900/40">
                    <!--<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78.008 1.626.69 2.193A3.989 3.989 0 007 15a3.989 3.989 0 002.128-.981c.682-.567.94-1.413.69-2.193l-.818-2.552a1 1 0 00-1.9 0z" />
                    </svg>-->
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z" />
                    </svg>

                    <span class="text-sm font-medium">Workers</span>
                </router-link>
                <router-link to="/admin/users" v-if="isAdmin"
                    class="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/20 rounded-full transition-colors"
                    active-class="bg-violet-100 dark:bg-violet-900/30 text-primary-900 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-violet-900/40">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <span class="text-sm font-medium">User Management</span>
                </router-link>
                <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                <div class="px-4 pt-2">
                    <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Storage</span>
                </div>
                <div class="px-4 py-2">
                    <div class="space-y-2">
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-600 dark:text-gray-400">{{ storageUsed }} {{ unit }} of {{
                                storageTotal
                                }}
                                GB
                                used</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div v-if="usedBytes" class="bg-gray-600 dark:bg-gray-400 rounded-full h-2 transition-all"
                                :style="{ width: storagePercent > 3 ? storagePercent + '%' : '3%' }">
                            </div>
                        </div>
                        <!-- <button
                            class="text-xs text-gray-600 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 font-medium hover:underline">
                            Upgrade to Pro
                        </button>-->
                    </div>
                </div>
            </template>
        </nav>
        <div class="px-2 border-t border-gray-200 dark:border-gray-700 relative pb-2"><!--pb-4-->
            <button @click="toggleProjectDropdown"
                class="w-full flex items-center justify-between mt-2 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"><!-- mt-4-->
                <div class="flex items-center gap-3">
                    <div v-if="currentProject" class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        :style="{ background: `linear-gradient(to bottom right, ${currentProject.color1}, ${currentProject.color2})` }">
                        <span class="text-white font-bold text-sm">{{ currentProject.initials }}</span>
                    </div>
                    <div v-else
                        class="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span class="text-white font-bold text-sm">TP</span>
                    </div>
                    <div class="text-left">
                        <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ currentProject?.name ||
                            'Test Project' }}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Active workspace</div>
                    </div>
                </div>
                <svg class="w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform"
                    :class="{ 'rotate-180': showProjectDropdown }" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clip-rule="evenodd" />
                </svg>
            </button>
            <div v-if="showProjectDropdown"
                class="absolute bottom-full left-2 right-2 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 max-h-64 overflow-y-auto">
                <button v-for="project in projects" :key="project.id" @click="switchProject(project)"
                    :class="{ 'bg-gray-50 dark:bg-gray-700': currentProject?.id === project.id }"
                    class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                        :style="{ background: `linear-gradient(to bottom right, ${project.color1}, ${project.color2})` }">
                        <span class="text-white font-bold text-sm">{{ project.initials }}</span>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ project.name }}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">{{ project.video_count || 0 }} videos
                        </div>
                    </div>
                </button>
                <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                <button @click="createNewProject"
                    class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors text-primary-600 dark:text-primary-400">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm font-medium">Create new project</span>
                </button>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'

interface Project {
    id: number;
    name: string;
    initials: string;
    color1: string;
    color2: string;
    video_count?: number;
    user_id: number;
}

export default {
    name: 'AppSidebar',
    setup() {
        const authStore = useAuthStore()
        const route = useRoute()
        const uploadURL = import.meta.env.MODE === 'production' ? 'https://api.reelmia.com' : 'http://localhost:6709'
        return { authStore, route, uploadURL }
    },
    data() {
        return {
            storageUsed: 0,
            storageUsedInGB: 0,
            storageTotal: 0,
            unit: 'GB',
            showNewDropdown: false,
            showProjectDropdown: false,
            currentDrive: 'default',
            currentFolder: '',
            usedBytes: 0,
            totalBytes: 0,
            storagePercent: 0,
            projects: [] as Project[],
            currentProject: null as Project | null,
            currentVideoThumbnail: null as string | null,
            currentVideoTitle: null as string | null,
            currentVideoSubtitle: null as string | null,
            currentVideoDuration: null as string | null,
            currentVideoFilename: null as string | null
        };
    },
    computed: {
        isAdmin() {
            return this.authStore.isAdmin;
        },
        isVideoDetailPage() {
            return this.route.name === 'video' || this.route.name === 'video-analytics' || this.route.name === 'video-comments';
        }
    },
    created() {
        this.fetchUsedStorage();
        this.fetchProjects();
        if (this.isVideoDetailPage) {
            this.fetchCurrentVideoData();
        }
    },
    mounted() {
        document.addEventListener('click', this.handleClickOutside);
        window.addEventListener('project-changed', this.handleProjectChanged);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
        window.removeEventListener('project-changed', this.handleProjectChanged);
    },
    methods: {
        handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement;
            if (!target.closest('.sidebar')) {
                this.showNewDropdown = false;
                this.showProjectDropdown = false;
            }
        },
        handleProjectChanged(event: any) {
            if (event.detail) {
                this.currentProject = event.detail;
                const index = this.projects.findIndex(p => p.id === event.detail.id);
                if (index !== -1) {
                    this.projects[index] = { ...this.projects[index], ...event.detail };
                }
            }
        },
        toggleProjectDropdown() {
            this.showProjectDropdown = !this.showProjectDropdown;
        },
        async fetchProjects() {
            try {
                const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null;
                if (!user) return;

                const response = await (this as any).$axios.get(`/projects?user_id=${user.id}`);
                this.projects = response.data;

                const savedProjectId = localStorage.getItem('currentProjectId');
                if (savedProjectId) {
                    this.currentProject = this.projects.find(p => p.id === Number(savedProjectId)) || this.projects[0] || null;
                } else {
                    this.currentProject = this.projects[0] || null;
                    if (this.currentProject) {
                        localStorage.setItem('currentProjectId', String(this.currentProject.id));
                    }
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        },
        switchProject(project: Project) {
            this.currentProject = project;
            localStorage.setItem('currentProjectId', String(project.id));
            this.showProjectDropdown = false;
            window.dispatchEvent(new CustomEvent('project-changed', { detail: project }));
        },
        async createNewProject() {
            const projectName = prompt('Enter project name:');
            if (!projectName) return;

            try {
                const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null;
                if (!user) return;

                const initials = projectName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);

                const colors: [string, string][] = [
                    ['#ef4444', '#dc2626'],
                    ['#3b82f6', '#9333ea'],
                    ['#10b981', '#14b8a6'],
                    ['#f59e0b', '#ea580c'],
                    ['#8b5cf6', '#ec4899']
                ];
                const randomColor = colors[Math.floor(Math.random() * colors.length)] ?? colors[0];

                const response = await (this as any).$axios.post('/projects', {
                    name: projectName,
                    initials: initials,
                    color1: randomColor![0],
                    color2: randomColor![1],
                    user_id: user.id
                });

                this.projects.push(response.data);
                this.switchProject(response.data);
            } catch (error) {
                console.error('Error creating project:', error);
                alert('Failed to create project');
            }
        },
        triggerVideoUpload() {
            this.showNewDropdown = false;
            if (this.$route.path !== '/dashboard') {
                this.$router.push('/dashboard').then(() => {
                    setTimeout(() => {
                        const vueApp = (window as any).vueApp;
                        if (vueApp) {
                            vueApp.config.globalProperties.$eventBus = vueApp.config.globalProperties.$eventBus || {};
                            window.dispatchEvent(new CustomEvent('open-upload-modal'));
                        }
                    }, 100);
                });
            } else {
                window.dispatchEvent(new CustomEvent('open-upload-modal'));
            }
        },
        fetchUsedStorage() {
            const currentProjectId = localStorage.getItem('currentProjectId');

            (this as any).$axios.get('/used-storage?project_id=' + currentProjectId).then((res: any) => {
                this.usedBytes = Number(res.data.used_storage);
                this.totalBytes = Number(res.data.total_storage);
                this.storagePercent = this.totalBytes
                    ? Number(((this.usedBytes / this.totalBytes) * 100).toFixed(2))
                    : 0;

                this.storageTotal = this.totalBytes ? Number((this.totalBytes / (1024 * 1024 * 1024)).toFixed(2)) : 0;
                this.storageUsed = Number(this.getSizeInUnit(this.usedBytes, this.getStorageUnit(this.usedBytes)));
                this.unit = this.getStorageUnit(this.usedBytes);
            })
        },
        getStorageUnit(bytes: number) {
            if (bytes < 1024) return 'Bytes';
            else if (bytes < 1024 * 1024) return 'KB';
            else if (bytes < 1024 * 1024 * 1024) return 'MB';
            else return 'GB';
        },
        getSizeInUnit(bytes: number, unit: string) {
            switch (unit) {
                case 'Bytes':
                    return bytes;
                case 'KB':
                    return (bytes / 1024).toFixed(2);
                case 'MB':
                    return (bytes / (1024 * 1024)).toFixed(2);
                case 'GB':
                    return (bytes / (1024 * 1024 * 1024)).toFixed(2);
                default:
                    return bytes;
            }
        },
        async fetchCurrentVideoData() {
            try {
                const videoId = this.route.params.id;
                if (!videoId) return;

                const previousThumbnail = this.currentVideoThumbnail;
                const previousFilename = this.currentVideoFilename;

                const response = await (this as any).$axios.get(`/videos/${videoId}`);
                const video = response.data;

                this.currentVideoTitle = video.title || "Untitled Video";
                this.currentVideoSubtitle = video.description || `${this.currentProject?.name || 'Project'} - ${video.filename || 'Video'}`;
                this.currentVideoDuration = video.duration ? this.formatDuration(video.duration) : "0:00";
                this.currentVideoFilename = video.filename || null;

                if (video.thumbnail_url) {
                    this.currentVideoThumbnail = video.thumbnail_url;
                } else if (video.filename !== previousFilename) {
                    this.currentVideoThumbnail = null;
                } else if (previousThumbnail && previousThumbnail.startsWith('data:')) {
                    this.currentVideoThumbnail = previousThumbnail;
                } else {
                    this.currentVideoThumbnail = null;
                }

            } catch (error) {
                console.error('Error fetching video data:', error);
                this.currentVideoTitle = "Your video";
                this.currentVideoSubtitle = "No Title";
                this.currentVideoDuration = "0:00";
                this.currentVideoThumbnail = null;
                this.currentVideoFilename = null;
            }
        },
        formatDuration(seconds: number | string): string {
            const totalSeconds = typeof seconds === 'string' ? parseFloat(seconds) : seconds;
            if (isNaN(totalSeconds)) return "0:00";

            const minutes = Math.floor(totalSeconds / 60);
            const remainingSeconds = Math.floor(totalSeconds % 60);

            if (minutes >= 60) {
                const hours = Math.floor(minutes / 60);
                const remainingMinutes = minutes % 60;
                return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            }

            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        },
        onVideoLoadedMetadata() {
            const video = this.$refs.hiddenVideo as HTMLVideoElement;
            if (video) {
                // Seek to first frame
                video.currentTime = 0.1;
                this.updateDuration();
            }
        },
        generateThumbnail() {
            const video = this.$refs.hiddenVideo as HTMLVideoElement;
            const canvas = this.$refs.thumbnailCanvas as HTMLCanvasElement;

            if (!video || !canvas) return;

            if (video.videoWidth > 0 && video.videoHeight > 0) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    this.currentVideoThumbnail = canvas.toDataURL('image/jpeg', 0.8);
                }
            }
        },
        updateDuration() {
            const video = this.$refs.hiddenVideo as HTMLVideoElement;
            if (video && video.duration && !isNaN(video.duration)) {
                this.currentVideoDuration = this.formatDuration(video.duration);
            }
        },
    },
    watch: {
        '$route': {
            handler(newRoute, oldRoute) {
                if (this.isVideoDetailPage) {
                    const newId = newRoute.params?.id;
                    const oldId = oldRoute?.params?.id;
                    if (newId !== oldId || !oldRoute?.name?.toString().startsWith('video')) {
                        this.fetchCurrentVideoData();
                    }
                }
            },
            immediate: false
        },
        'route.params.id': {
            handler(newId, oldId) {
                if (this.isVideoDetailPage && newId && newId !== oldId) {
                    this.fetchCurrentVideoData();
                }
            },
            immediate: true
        }
    }
}
</script>

<style scoped>
.sidebar {
    background: #eff3f6;
}

@media (prefers-color-scheme: dark) {
    .sidebar {
        background: #1f2937;
    }
}

::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
}

@media (prefers-color-scheme: dark) {
    ::-webkit-scrollbar-thumb {
        background: #4b5563;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #6b7280;
    }
}
</style>
