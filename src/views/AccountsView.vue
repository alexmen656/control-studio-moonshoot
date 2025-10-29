<template>
    <div class="h-full flex flex-col bg-white dark:bg-gray-900">
        <div class="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <div class="mb-4">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Connected Accounts</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Connect your social media accounts to start publishing
                </p>
            </div>
        </div>
        <div class="flex-1 overflow-y-auto p-8">
            <div class="max-w-4xl mx-auto">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all overflow-hidden">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center gap-4">
                                    <div
                                        class="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                                        <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="currentColor"
                                            viewBox="0 0 24 24">
                                            <path
                                                d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">YouTube</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Video platform</p>
                                    </div>
                                </div>
                                <span v-if="connectedAccounts.youtube"
                                    class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium rounded-full">
                                    Connected
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Upload and share videos with millions of viewers worldwide
                            </p>
                            <button v-if="!connectedAccounts.youtube" @click="connectYouTube"
                                class="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Connect YouTube
                            </button>
                            <button v-else @click="disconnectYouTube"
                                class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg transition-all font-medium">
                                Disconnect
                            </button>
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all overflow-hidden">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center gap-4">
                                    <div
                                        class="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                                        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Instagram
                                        </h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Photos & Reels</p>
                                    </div>
                                </div>
                                <span v-if="connectedAccounts.instagram"
                                    class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium rounded-full">
                                    Connected
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Share your moments and short videos with your followers
                            </p>
                            <button v-if="!connectedAccounts.instagram" @click="connectInstagram"
                                class="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Connect Instagram
                            </button>
                            <button v-else @click="disconnectInstagram"
                                class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg transition-all font-medium">
                                Disconnect
                            </button>
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all overflow-hidden">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center gap-4">
                                    <div
                                        class="w-14 h-14 bg-gray-900 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                                        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">TikTok</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Short-form videos</p>
                                    </div>
                                </div>
                                <span v-if="connectedAccounts.tiktok"
                                    class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium rounded-full">
                                    Connected
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Create and discover entertaining short videos
                            </p>
                            <button v-if="!connectedAccounts.tiktok" @click="connectTiktok"
                                class="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Connect TikTok
                            </button>
                            <button v-else @click="disconnectTiktok"
                                class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg transition-all font-medium">
                                Disconnect
                            </button>
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all overflow-hidden">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center gap-4">
                                    <div
                                        class="w-14 h-14 bg-blue-600 dark:bg-blue-700 rounded-xl flex items-center justify-center">
                                        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Facebook</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Social network</p>
                                    </div>
                                </div>
                                <span v-if="connectedAccounts.facebook"
                                    class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium rounded-full">
                                    Connected
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Connect with friends and share your content
                            </p>
                            <button v-if="!connectedAccounts.facebook" @click="connectFacebook"
                                class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Connect Facebook
                            </button>
                            <button v-else @click="disconnectFacebook"
                                class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg transition-all font-medium">
                                Disconnect
                            </button>
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all overflow-hidden">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center gap-4">
                                    <div class="w-14 h-14 bg-black rounded-xl flex items-center justify-center">
                                        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M17.53 2H21L14.19 10.09L22.25 22H15.97L10.98 15.13L5.29 22H2L9.17 13.38L1.39 2H7.86L12.41 8.32L17.53 2ZM16.36 20H18.19L7.7 4H5.73L16.36 20Z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">X (Twitter)
                                        </h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Microblogging</p>
                                    </div>
                                </div>
                                <span v-if="connectedAccounts.x"
                                    class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium rounded-full">
                                    Connected
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Share updates and engage with your audience in real-time
                            </p>
                            <button v-if="!connectedAccounts.x" @click="connectX"
                                class="w-full bg-gradient-to-r from-black to-gray-800 hover:from-gray-900 hover:to-black text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Connect X
                            </button>
                            <button v-else @click="disconnectX"
                                class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg transition-all font-medium">
                                Disconnect
                            </button>
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all overflow-hidden">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center gap-4">
                                    <div
                                        class="w-14 h-14 bg-gradient-to-br from-black via-gray-700 to-white rounded-xl flex items-center justify-center">
                                        <svg class="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm0 18a8 8 0 110-16 8 8 0 010 16zm.5-13c-2.485 0-4.5 2.015-4.5 4.5 0 2.485 2.015 4.5 4.5 4.5s4.5-2.015 4.5-4.5c0-2.485-2.015-4.5-4.5-4.5zm0 7a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Threads
                                            (Instagram)</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Text-based sharing</p>
                                    </div>
                                </div>
                                <span v-if="connectedAccounts.threads"
                                    class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium rounded-full">
                                    Connected
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Share text updates with your Instagram community
                            </p>
                            <button v-if="!connectedAccounts.threads" @click="connectThreads"
                                class="w-full bg-gradient-to-r from-black to-gray-700 hover:from-gray-800 hover:to-black text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Connect Threads
                            </button>
                            <button v-else @click="disconnectThreads"
                                class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg transition-all font-medium">
                                Disconnect
                            </button>
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all overflow-hidden">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center gap-4">
                                    <div class="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
                                        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">LinkedIn</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Professional network</p>
                                    </div>
                                </div>
                                <span v-if="connectedAccounts.linkedin"
                                    class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium rounded-full">Connected</span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Share professional updates and grow
                                your network</p>
                            <button v-if="!connectedAccounts.linkedin" @click="connectLinkedIn"
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Connect LinkedIn
                            </button>
                            <button v-else @click="disconnectLinkedIn"
                                class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg transition-all font-medium">Disconnect</button>
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all overflow-hidden">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center gap-4">
                                    <div class="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center">
                                        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Pinterest
                                        </h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Visual discovery</p>
                                    </div>
                                </div>
                                <span v-if="connectedAccounts.pinterest"
                                    class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium rounded-full">Connected</span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Share and discover creative ideas
                            </p>
                            <button v-if="!connectedAccounts.pinterest" @click="connectPinterest"
                                class="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Connect Pinterest
                            </button>
                            <button v-else @click="disconnectPinterest"
                                class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg transition-all font-medium">Disconnect</button>
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all overflow-hidden">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center gap-4">
                                    <div class="w-14 h-14 bg-yellow-400 rounded-xl flex items-center justify-center">
                                        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M12.206 2.175c-1.504.064-2.746.428-3.702 1.08-.748.51-1.342 1.148-1.765 1.898a6.273 6.273 0 00-.849 2.27c-.141.785-.193 1.607-.193 2.394v.284c-.017.397-.106.788-.26 1.15-.14.324-.334.616-.576.864a2.8 2.8 0 01-.861.56c-.322.14-.656.216-1 .216l-.247.004a.423.423 0 00-.298.134.433.433 0 00-.114.313v.053a2.91 2.91 0 001.026 2.185c.332.285.725.493 1.152.608.47.127.96.19 1.452.187.36-.004.718-.038 1.071-.1.22-.038.437-.092.65-.161l.125-.041c.156.682.37 1.341.638 1.977.264.626.587 1.22.965 1.773a7.95 7.95 0 001.385 1.528 7.158 7.158 0 001.876 1.134c.355.14.723.246 1.1.316.355.066.715.1 1.076.1.36 0 .72-.034 1.075-.1.377-.07.745-.176 1.1-.316a7.158 7.158 0 001.876-1.134 7.95 7.95 0 001.385-1.528 11.61 11.61 0 00.965-1.773c.268-.636.482-1.295.638-1.977l.125.041c.213.069.43.123.65.161.353.062.71.096 1.071.1.492.003.982-.06 1.452-.187.427-.115.82-.323 1.152-.608a2.91 2.91 0 001.026-2.185v-.053a.433.433 0 00-.114-.313.423.423 0 00-.298-.134l-.247-.004c-.344 0-.678-.076-1-.216a2.8 2.8 0 01-.861-.56 2.792 2.792 0 01-.576-.864 2.807 2.807 0 01-.26-1.15v-.284c0-.787-.052-1.609-.193-2.394a6.273 6.273 0 00-.849-2.27c-.423-.75-1.017-1.388-1.765-1.898-.956-.652-2.198-1.016-3.702-1.08-.244-.01-.488-.014-.733-.011-.245-.003-.49.001-.733.011z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Snapchat</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Ephemeral sharing</p>
                                    </div>
                                </div>
                                <span v-if="connectedAccounts.snapchat"
                                    class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium rounded-full">Connected</span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Share moments that disappear</p>
                            <button v-if="!connectedAccounts.snapchat" @click="connectSnapchat"
                                class="w-full bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Connect Snapchat
                            </button>
                            <button v-else @click="disconnectSnapchat"
                                class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg transition-all font-medium">Disconnect</button>
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all overflow-hidden">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center gap-4">
                                    <div class="w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center">
                                        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Reddit</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Community forums</p>
                                    </div>
                                </div>
                                <span v-if="connectedAccounts.reddit"
                                    class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium rounded-full">Connected</span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Join discussions and share content
                                in communities</p>
                            <button v-if="!connectedAccounts.reddit" @click="connectReddit"
                                class="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Connect Reddit
                            </button>
                            <button v-else @click="disconnectReddit"
                                class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg transition-all font-medium">Disconnect</button>
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all overflow-hidden">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center gap-4">
                                    <div class="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center">
                                        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">WhatsApp</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Messaging</p>
                                    </div>
                                </div>
                                <span v-if="connectedAccounts.whatsapp"
                                    class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium rounded-full">Connected</span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Send messages and share media with
                                contacts</p>
                            <button v-if="!connectedAccounts.whatsapp" @click="connectWhatsApp"
                                class="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Connect WhatsApp
                            </button>
                            <button v-else @click="disconnectWhatsApp"
                                class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg transition-all font-medium">Disconnect</button>
                        </div>
                    </div>
                </div>
                <div
                    class="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                    <div class="flex gap-3">
                        <svg class="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor"
                            viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clip-rule="evenodd" />
                        </svg>
                        <div>
                            <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">Why connect accounts?</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                By connecting your social media accounts, you can upload and publish videos to multiple
                                platforms simultaneously, schedule posts, and track performance all in one place.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue'
const instance = getCurrentInstance()
const axios = instance?.appContext.config.globalProperties.$axios

const connectedAccounts = ref({
    youtube: false,
    instagram: false,
    tiktok: false,
    facebook: false,
    x: false,
    threads: false,
    linkedin: false,
    pinterest: false,
    snapchat: false,
    reddit: false,
    whatsapp: false
})

const checkConnectedAccounts = () => {
    const projectId = localStorage.getItem('currentProjectId') || 1;
    axios.get(`/accounts/status?project_id=${projectId}`)
        .then(response => {
            connectedAccounts.value.youtube = response.data.youtube || false
            connectedAccounts.value.instagram = response.data.instagram || false
            connectedAccounts.value.tiktok = response.data.tiktok || false
            connectedAccounts.value.facebook = response.data.facebook || false
            connectedAccounts.value.x = response.data.x || false
            connectedAccounts.value.threads = response.data.threads || false
            connectedAccounts.value.linkedin = response.data.linkedin || false
            connectedAccounts.value.pinterest = response.data.pinterest || false
            connectedAccounts.value.snapchat = response.data.snapchat || false
            connectedAccounts.value.reddit = response.data.reddit || false
            connectedAccounts.value.whatsapp = response.data.whatsapp || false
        })
        .catch(error => {
            console.error('Error fetching connected accounts status:', error)
        })
}
const connectLinkedIn = () => {
    axios.post(`/connect/linkedin?project_id=${localStorage.getItem('currentProjectId')}`)
        .then(response => {
            console.log('LinkedIn connection initiated')
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
            connectedAccounts.value.linkedin = true
        })
        .catch(error => {
            console.error('Error connecting to LinkedIn:', error)
        })
}

const connectPinterest = () => {
    axios.post(`/connect/pinterest?project_id=${localStorage.getItem('currentProjectId')}`)
        .then(response => {
            console.log('Pinterest connection initiated')
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
            connectedAccounts.value.pinterest = true
        })
        .catch(error => {
            console.error('Error connecting to Pinterest:', error)
        })
}

const connectSnapchat = () => {
    axios.post(`/connect/snapchat?project_id=${localStorage.getItem('currentProjectId')}`)
        .then(response => {
            console.log('Snapchat connection initiated')
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
            connectedAccounts.value.snapchat = true
        })
        .catch(error => {
            console.error('Error connecting to Snapchat:', error)
        })
}

const connectReddit = () => {
    axios.post(`/connect/reddit?project_id=${localStorage.getItem('currentProjectId')}`)
        .then(response => {
            console.log('Reddit connection initiated')
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
            connectedAccounts.value.reddit = true
        })
        .catch(error => {
            console.error('Error connecting to Reddit:', error)
        })
}

const connectWhatsApp = () => {
    axios.post(`/connect/whatsapp?project_id=${localStorage.getItem('currentProjectId')}`)
        .then(response => {
            console.log('WhatsApp connection initiated')
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
            connectedAccounts.value.whatsapp = true
        })
        .catch(error => {
            console.error('Error connecting to WhatsApp:', error)
        })
}

const disconnectLinkedIn = () => {
    if (confirm('Disconnect LinkedIn account?')) {
        connectedAccounts.value.linkedin = false
        console.log('LinkedIn disconnected')
    }
}

const disconnectPinterest = () => {
    if (confirm('Disconnect Pinterest account?')) {
        connectedAccounts.value.pinterest = false
        console.log('Pinterest disconnected')
    }
}

const disconnectSnapchat = () => {
    if (confirm('Disconnect Snapchat account?')) {
        connectedAccounts.value.snapchat = false
        console.log('Snapchat disconnected')
    }
}

const disconnectReddit = () => {
    if (confirm('Disconnect Reddit account?')) {
        connectedAccounts.value.reddit = false
        console.log('Reddit disconnected')
    }
}

const disconnectWhatsApp = () => {
    if (confirm('Disconnect WhatsApp account?')) {
        connectedAccounts.value.whatsapp = false
        console.log('WhatsApp disconnected')
    }
}

const connectX = () => {
    axios.post(`/connect/x?project_id=${localStorage.getItem('currentProjectId')}`)
        .then(response => {
            console.log('X connection initiated')
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
            connectedAccounts.value.x = true
        })
        .catch(error => {
            console.error('Error connecting to X:', error)
        })
}

const connectThreads = () => {
    axios.post(`/connect/threads?project_id=${localStorage.getItem('currentProjectId')}`)
        .then(response => {
            console.log('Threads connection initiated')
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
            connectedAccounts.value.threads = true
        })
        .catch(error => {
            console.error('Error connecting to Threads:', error)
        })
}

const disconnectX = () => {
    if (confirm('Disconnect X account?')) {
        connectedAccounts.value.x = false
        console.log('X disconnected')
    }
}

const disconnectThreads = () => {
    if (confirm('Disconnect Threads account?')) {
        connectedAccounts.value.threads = false
        console.log('Threads disconnected')
    }
}

checkConnectedAccounts()

const connectYouTube = () => {
    axios.post(`/connect/youtube?project_id=${localStorage.getItem('currentProjectId')}`)
        .then(response => {
            console.log('YouTube connection initiated')
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
            connectedAccounts.value.youtube = true
        })
        .catch(error => {
            console.error('Error connecting to YouTube:', error)
        })
}

const connectInstagram = () => {
    axios.post(`/connect/instagram?project_id=${localStorage.getItem('currentProjectId')}`)
        .then(response => {
            console.log('Instagram connection initiated')
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
            connectedAccounts.value.instagram = true
        })
        .catch(error => {
            console.error('Error connecting to Instagram:', error)
        })
}

const connectTiktok = () => {
    axios.post(`/connect/tiktok?project_id=${localStorage.getItem('currentProjectId')}`)
        .then(response => {
            console.log('TikTok connection initiated')
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
            connectedAccounts.value.tiktok = true
        })
        .catch(error => {
            console.error('Error connecting to TikTok:', error)
        })
}

const connectFacebook = () => {
    axios.post(`/connect/facebook?project_id=${localStorage.getItem('currentProjectId')}`)
        .then(response => {
            console.log('Facebook connection initiated')
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
            connectedAccounts.value.facebook = true
        })
        .catch(error => {
            console.error('Error connecting to Facebook:', error)
        })
}

const currentProjectId = localStorage.getItem('currentProjectId') || 1;

const disconnectYouTube = () => {
    if (confirm('Disconnect YouTube account?')) {
        axios.post(`/disconnect/youtube?project_id=${currentProjectId}`)
            .then(response => {
                console.log('YouTube disconnected')
                connectedAccounts.value.youtube = false
            })
            .catch(error => {
                console.error('Error disconnecting YouTube on server:', error)
            })
    }
}

const disconnectInstagram = () => {
    if (confirm('Disconnect Instagram account?')) {
        axios.post(`/disconnect/instagram?project_id=${currentProjectId}`)
            .then(response => {
                console.log('Instagram disconnected')
                connectedAccounts.value.instagram = false
            })
            .catch(error => {
                console.error('Error disconnecting Instagram on server:', error)
            })
    }
}

const disconnectTiktok = () => {
    if (confirm('Disconnect TikTok account?')) {
        axios.post(`/disconnect/tiktok?project_id=${currentProjectId}`)
            .then(response => {
                console.log('TikTok disconnected')
                connectedAccounts.value.tiktok = false
            })
            .catch(error => {
                console.error('Error disconnecting TikTok on server:', error)
            })
    }
}

const disconnectFacebook = () => {
    if (confirm('Disconnect Facebook account?')) {
        axios.post(`/disconnect/facebook?project_id=${currentProjectId}`)
            .then(response => {
                console.log('Facebook disconnected')
                connectedAccounts.value.facebook = false
            })
            .catch(error => {
                console.error('Error disconnecting Facebook on server:', error)
            })
    }
}
</script>