<template>
    <div class="h-full flex flex-col bg-white dark:bg-gray-900">
        <div class="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <div class="mb-4">
                <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100">Connected Accounts</h1>
                <!--<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Connect your social media accounts to start publishing
                </p>-->
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
        <div class="flex-1 overflow-y-auto p-8">
            <div class="mx-auto space-y-8">
                <div>
                    <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <svg class="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Popular Platforms
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <PlatformCard platform="youtube" name="YouTube" subtitle="Video platform"
                            description="Upload and share videos with millions of viewers worldwide"
                            :connected="accountDetails.youtube" :expanded="expandedPlatforms.youtube ?? false"
                            :formats="['Long Video', 'Short Video']" iconColor="bg-violet-100 dark:bg-violet-900/30"
                            iconTextColor="text-violet-600 dark:text-violet-400"
                            buttonGradient="from-violet-500 to-violet-600 hover:from-orange-600 hover:to-orange-700"
                            @connect="connectYouTube" @disconnect="disconnectYouTube"
                            @toggle-expand="toggleExpand('youtube')">
                            <template #icon>
                                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </template>
                        </PlatformCard>

                        <PlatformCard platform="instagram" name="Instagram" subtitle="Photos & Reels"
                            description="Share your moments and short videos with your followers"
                            :connected="accountDetails.instagram" :expanded="expandedPlatforms.instagram ?? false"
                            :formats="['Short Video', 'Image Post']"
                            iconColor="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500"
                            iconTextColor="text-white"
                            buttonGradient="from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            @connect="connectInstagram" @disconnect="disconnectInstagram"
                            @toggle-expand="toggleExpand('instagram')">
                            <template #icon>
                                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </template>
                        </PlatformCard>

                        <PlatformCard platform="tiktok" name="TikTok" subtitle="Short-form videos"
                            description="Create and discover entertaining short videos"
                            :connected="accountDetails.tiktok" :expanded="expandedPlatforms.tiktok ?? false"
                            :formats="['Short Video']" iconColor="bg-gray-900 dark:bg-gray-700"
                            iconTextColor="text-white"
                            buttonGradient="from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black"
                            @connect="connectTiktok" @disconnect="disconnectTiktok"
                            @toggle-expand="toggleExpand('tiktok')">
                            <template #icon>
                                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                </svg>
                            </template>
                        </PlatformCard>

                        <PlatformCard platform="facebook" name="Facebook" subtitle="Social network"
                            description="Connect with friends and share your content"
                            :connected="accountDetails.facebook" :expanded="expandedPlatforms.facebook ?? false"
                            :formats="['Long Video', 'Short Video', 'Text Post', 'Image Post']"
                            iconColor="bg-blue-100 dark:bg-blue-900/30" iconTextColor="text-blue-600 dark:text-blue-400"
                            buttonGradient="from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                            @connect="connectFacebook" @disconnect="disconnectFacebook"
                            @toggle-expand="toggleExpand('facebook')">
                            <template #icon>
                                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </template>
                        </PlatformCard>
                    </div>
                </div>
                <div v-show="false">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <svg class="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                        Video Platforms
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <PlatformCard platform="snapchat" name="Snapchat" subtitle="Disappearing content"
                            description="Share moments that disappear with friends" :connected="accountDetails.snapchat"
                            :expanded="expandedPlatforms.snapchat ?? false" :formats="['Short Video', 'Image Story']"
                            iconColor="bg-yellow-100 dark:bg-yellow-900/30"
                            iconTextColor="text-yellow-500 dark:text-yellow-400"
                            buttonGradient="bg-yellow-400 hover:bg-yellow-500" buttonTextColor="text-black"
                            @connect="connectSnapchat" @disconnect="disconnectSnapchat"
                            @toggle-expand="toggleExpand('snapchat')">
                            <template #icon>
                                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M12.206 2.024c-1.128 0-2.08.692-2.832 1.917-.55.896-.913 2.075-1.073 3.235-.01.07-.062.127-.13.142a.158.158 0 0 1-.116-.024c-.32-.227-.658-.363-1.007-.363-.38 0-.754.157-1.073.438-.297.262-.5.608-.586.99-.084.375-.028.762.157 1.096.175.315.443.568.774.732.297.148.54.192.706.192.052 0 .095-.005.13-.013.052-.013.095-.032.13-.058a.42.42 0 0 0 .095-.095c.026-.04.04-.084.04-.13 0-.052-.014-.096-.04-.13a.42.42 0 0 0-.095-.095.42.42 0 0 1-.095-.095c-.026-.04-.04-.084-.04-.13 0-.092.035-.175.095-.236.06-.06.142-.095.236-.095.175 0 .38.087.606.245.297.206.606.463.916.73.32.28.636.56.948.806.32.254.628.463.916.606.297.148.568.222.806.222.24 0 .51-.074.808-.222.288-.143.596-.352.916-.606.312-.246.628-.526.948-.806.31-.267.62-.524.916-.73.226-.158.43-.245.606-.245.094 0 .175.035.236.095.06.06.095.144.095.236 0 .046-.014.09-.04.13a.42.42 0 0 1-.095.095.42.42 0 0 0-.095.095c-.026.034-.04.078-.04.13 0 .046.014.09.04.13a.42.42 0 0 0 .095.095c.035.026.078.045.13.058.035.008.078.013.13.013.166 0 .41-.044.706-.192.33-.164.6-.417.774-.732.185-.334.24-.72.157-1.096a1.948 1.948 0 0 0-.586-.99 1.948 1.948 0 0 0-1.073-.438c-.35 0-.687.136-1.007.363a.158.158 0 0 1-.116.024.158.158 0 0 1-.13-.142c-.16-1.16-.523-2.34-1.073-3.235-.752-1.225-1.704-1.917-2.832-1.917z" />
                                </svg>
                            </template>
                        </PlatformCard>
                    </div>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                                clip-rule="evenodd" />
                        </svg>
                        Text-based Platforms
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <PlatformCard platform="x" name="X (Twitter)" subtitle="Microblogging"
                            description="Share your thoughts and engage in conversations" :connected="accountDetails.x"
                            :expanded="expandedPlatforms.x ?? false"
                            :formats="['Text Post', 'Image Post', 'Short Video']" iconColor="bg-black dark:bg-gray-800"
                            iconTextColor="text-white"
                            buttonGradient="from-black to-gray-800 hover:from-gray-900 hover:to-black"
                            @connect="connectX" @disconnect="disconnectX" @toggle-expand="toggleExpand('x')">
                            <template #icon>
                                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </template>
                        </PlatformCard>

                        <!--  <PlatformCard 
                            platform="threads"
                            name="Threads"
                            subtitle="Text conversations"
                            description="Share text updates and join the conversation"
                            :connected="accountDetails.threads"
                            :expanded="expandedPlatforms.threads ?? false"
                            :formats="['Text Post', 'Image Post']"
                            iconColor="bg-black dark:bg-gray-800"
                            iconTextColor="text-white"
                            buttonGradient="from-black to-gray-700 hover:from-gray-800 hover:to-black"
                            @connect="connectThreads"
                            @disconnect="disconnectThreads"
                            @toggle-expand="toggleExpand('threads')"
                        >
                            <template #icon>
                                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.186 3.998a8.998 8.998 0 1 0 0 17.996 8.998 8.998 0 0 0 0-17.996zM12 2.5c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10zm0 3.5c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5 6.5-2.91 6.5-6.5-2.91-6.5-6.5-6.5z" />
                                </svg>
                            </template>
                        </PlatformCard>-->

                        <PlatformCard platform="reddit" name="Reddit" subtitle="Communities & Discussions"
                            description="Share content and engage with communities" :connected="accountDetails.reddit"
                            :expanded="expandedPlatforms.reddit ?? false"
                            :formats="['Text Post', 'Image Post', 'Video Post']"
                            iconColor="bg-orange-100 dark:bg-orange-900/30"
                            iconTextColor="text-orange-600 dark:text-orange-400"
                            buttonGradient="bg-orange-600 hover:bg-orange-700" @connect="connectReddit"
                            @disconnect="disconnectReddit" @toggle-expand="toggleExpand('reddit')">
                            <template #icon>
                                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                                </svg>
                            </template>
                        </PlatformCard>
                    </div>
                </div>
                <div v-show="false">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <svg class="w-6 h-6 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                                clip-rule="evenodd" />
                            <path
                                d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                        </svg>
                        Professional & Creative
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <PlatformCard platform="linkedin" name="LinkedIn" subtitle="Professional networking"
                            description="Build your professional network and share insights"
                            :connected="accountDetails.linkedin" :expanded="expandedPlatforms.linkedin ?? false"
                            :formats="['Text Post', 'Image Post', 'Video Post', 'Article']"
                            iconColor="bg-blue-100 dark:bg-blue-900/30" iconTextColor="text-blue-700 dark:text-blue-400"
                            buttonGradient="bg-blue-600 hover:bg-blue-700" @connect="connectLinkedIn"
                            @disconnect="disconnectLinkedIn" @toggle-expand="toggleExpand('linkedin')">
                            <template #icon>
                                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </template>
                        </PlatformCard>

                        <PlatformCard platform="pinterest" name="Pinterest" subtitle="Visual discovery"
                            description="Discover and save creative ideas" :connected="accountDetails.pinterest"
                            :expanded="expandedPlatforms.pinterest ?? false"
                            :formats="['Image Pin', 'Video Pin', 'Idea Pin']" iconColor="bg-violet-100 dark:bg-violet-900/30"
                            iconTextColor="text-violet-600 dark:text-violet-400" buttonGradient="bg-violet-600 hover:bg-violet-700"
                            @connect="connectPinterest" @disconnect="disconnectPinterest"
                            @toggle-expand="toggleExpand('pinterest')">
                            <template #icon>
                                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                                </svg>
                            </template>
                        </PlatformCard>

                        <PlatformCard platform="whatsapp" name="WhatsApp" subtitle="Messaging"
                            description="Send messages and share updates with your contacts"
                            :connected="accountDetails.whatsapp" :expanded="expandedPlatforms.whatsapp ?? false"
                            :formats="['Text Message', 'Image', 'Video', 'Document']"
                            iconColor="bg-green-100 dark:bg-green-900/30"
                            iconTextColor="text-green-600 dark:text-green-400"
                            buttonGradient="bg-green-500 hover:bg-green-600" @connect="connectWhatsApp"
                            @disconnect="disconnectWhatsApp" @toggle-expand="toggleExpand('whatsapp')">
                            <template #icon>
                                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            </template>
                        </PlatformCard>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue'
import PlatformCard from '../components/PlatformCard.vue'

const instance = getCurrentInstance()
const axios = instance?.appContext.config.globalProperties.$axios

const accountDetails = ref<Record<string, any>>({
    youtube: null,
    instagram: null,
    tiktok: null,
    facebook: null,
    x: null,
    threads: null,
    linkedin: null,
    pinterest: null,
    snapchat: null,
    reddit: null,
    whatsapp: null
})

const expandedPlatforms = ref<Record<string, boolean>>({
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

const toggleExpand = (platform: string) => {
    expandedPlatforms.value[platform] = !expandedPlatforms.value[platform]
}

const checkConnectedAccounts = () => {
    const projectId = localStorage.getItem('currentProjectId') || 1
    axios.get(`/accounts/status?project_id=${projectId}`)
        .then((response: any) => {
            accountDetails.value.youtube = response.data.youtube || null
            accountDetails.value.instagram = response.data.instagram || null
            accountDetails.value.tiktok = response.data.tiktok || null
            accountDetails.value.facebook = response.data.facebook || null
            accountDetails.value.x = response.data.x || null
            accountDetails.value.threads = response.data.threads || null
            accountDetails.value.linkedin = response.data.linkedin || null
            accountDetails.value.pinterest = response.data.pinterest || null
            accountDetails.value.snapchat = response.data.snapchat || null
            accountDetails.value.reddit = response.data.reddit || null
            accountDetails.value.whatsapp = response.data.whatsapp || null
        })
        .catch((error: any) => {
            console.error('Error fetching connected accounts status:', error)
        })
}

const currentProjectId = localStorage.getItem('currentProjectId') || 1

const connectYouTube = () => {
    axios.post(`/connect/youtube?project_id=${currentProjectId}`)
        .then((response: any) => {
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
        })
        .catch((error: any) => console.error('Error connecting to YouTube:', error))
}

const connectInstagram = () => {
    axios.post(`/connect/instagram?project_id=${currentProjectId}`)
        .then((response: any) => {
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
        })
        .catch((error: any) => console.error('Error connecting to Instagram:', error))
}

const connectTiktok = () => {
    axios.post(`/connect/tiktok?project_id=${currentProjectId}`)
        .then((response: any) => {
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
        })
        .catch((error: any) => console.error('Error connecting to TikTok:', error))
}

const connectFacebook = () => {
    axios.post(`/connect/facebook?project_id=${currentProjectId}`)
        .then((response: any) => {
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
        })
        .catch((error: any) => console.error('Error connecting to Facebook:', error))
}

const connectX = () => {
    axios.post(`/connect/x?project_id=${currentProjectId}`)
        .then((response: any) => {
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
        })
        .catch((error: any) => console.error('Error connecting to X:', error))
}

const connectThreads = () => {
    axios.post(`/connect/threads?project_id=${currentProjectId}`)
        .then((response: any) => {
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
        })
        .catch((error: any) => console.error('Error connecting to Threads:', error))
}

const connectLinkedIn = () => {
    axios.post(`/connect/linkedin?project_id=${currentProjectId}`)
        .then((response: any) => {
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
        })
        .catch((error: any) => console.error('Error connecting to LinkedIn:', error))
}

const connectPinterest = () => {
    axios.post(`/connect/pinterest?project_id=${currentProjectId}`)
        .then((response: any) => {
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
        })
        .catch((error: any) => console.error('Error connecting to Pinterest:', error))
}

const connectSnapchat = () => {
    axios.post(`/connect/snapchat?project_id=${currentProjectId}`)
        .then((response: any) => {
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
        })
        .catch((error: any) => console.error('Error connecting to Snapchat:', error))
}

const connectReddit = () => {
    axios.post(`/connect/reddit?project_id=${currentProjectId}`)
        .then((response: any) => {
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
        })
        .catch((error: any) => console.error('Error connecting to Reddit:', error))
}

const connectWhatsApp = () => {
    axios.post(`/connect/whatsapp?project_id=${currentProjectId}`)
        .then((response: any) => {
            if (response.data.authUrl) {
                window.location.href = response.data.authUrl
            }
        })
        .catch((error: any) => console.error('Error connecting to WhatsApp:', error))
}

const disconnectYouTube = () => {
    if (confirm('Disconnect YouTube account?')) {
        axios.post(`/disconnect/youtube?project_id=${currentProjectId}`)
            .then(() => {
                accountDetails.value.youtube = null
            })
            .catch((error: any) => console.error('Error disconnecting YouTube:', error))
    }
}

const disconnectInstagram = () => {
    if (confirm('Disconnect Instagram account?')) {
        axios.post(`/disconnect/instagram?project_id=${currentProjectId}`)
            .then(() => {
                accountDetails.value.instagram = null
            })
            .catch((error: any) => console.error('Error disconnecting Instagram:', error))
    }
}

const disconnectTiktok = () => {
    if (confirm('Disconnect TikTok account?')) {
        axios.post(`/disconnect/tiktok?project_id=${currentProjectId}`)
            .then(() => {
                accountDetails.value.tiktok = null
            })
            .catch((error: any) => console.error('Error disconnecting TikTok:', error))
    }
}

const disconnectFacebook = () => {
    if (confirm('Disconnect Facebook account?')) {
        axios.post(`/disconnect/facebook?project_id=${currentProjectId}`)
            .then(() => {
                accountDetails.value.facebook = null
            })
            .catch((error: any) => console.error('Error disconnecting Facebook:', error))
    }
}

const disconnectX = () => {
    if (confirm('Disconnect X account?')) {
        axios.post(`/disconnect/x?project_id=${currentProjectId}`)
            .then(() => {
                accountDetails.value.x = null
            })
            .catch((error: any) => console.error('Error disconnecting X:', error))
    }
}

const disconnectThreads = () => {
    if (confirm('Disconnect Threads account?')) {
        axios.post(`/disconnect/threads?project_id=${currentProjectId}`)
            .then(() => {
                accountDetails.value.threads = null
            })
            .catch((error: any) => console.error('Error disconnecting Threads:', error))
    }
}

const disconnectLinkedIn = () => {
    if (confirm('Disconnect LinkedIn account?')) {
        axios.post(`/disconnect/linkedin?project_id=${currentProjectId}`)
            .then(() => {
                accountDetails.value.linkedin = null
            })
            .catch((error: any) => console.error('Error disconnecting LinkedIn:', error))
    }
}

const disconnectPinterest = () => {
    if (confirm('Disconnect Pinterest account?')) {
        axios.post(`/disconnect/pinterest?project_id=${currentProjectId}`)
            .then(() => {
                accountDetails.value.pinterest = null
            })
            .catch((error: any) => console.error('Error disconnecting Pinterest:', error))
    }
}

const disconnectSnapchat = () => {
    if (confirm('Disconnect Snapchat account?')) {
        axios.post(`/disconnect/snapchat?project_id=${currentProjectId}`)
            .then(() => {
                accountDetails.value.snapchat = null
            })
            .catch((error: any) => console.error('Error disconnecting Snapchat:', error))
    }
}

const disconnectReddit = () => {
    if (confirm('Disconnect Reddit account?')) {
        axios.post(`/disconnect/reddit?project_id=${currentProjectId}`)
            .then(() => {
                accountDetails.value.reddit = null
            })
            .catch((error: any) => console.error('Error disconnecting Reddit:', error))
    }
}

const disconnectWhatsApp = () => {
    if (confirm('Disconnect WhatsApp account?')) {
        axios.post(`/disconnect/whatsapp?project_id=${currentProjectId}`)
            .then(() => {
                accountDetails.value.whatsapp = null
            })
            .catch((error: any) => console.error('Error disconnecting WhatsApp:', error))
    }
}

onMounted(() => {
    checkConnectedAccounts()
})
</script>
