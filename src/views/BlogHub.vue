<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const featuredPost = {
    id: 1,
    title: 'How to Create Viral TikTok Reels in 2025: Complete Guide',
    excerpt: 'Master the TikTok algorithm with proven strategies that increase your reach by 300%. Learn timing, editing, and engagement tactics.',
    category: 'TikTok',
    categoryColor: 'bg-pink-500',
    thumbnail: '/blog/featured.jpg',
    author: {
        name: 'Sarah Chen',
        avatar: '👩‍💼'
    },
    readTime: '12 min read',
    date: 'Jan 15, 2025',
    views: '24.5K'
}

const recentPosts = [
    {
        id: 2,
        title: 'Instagram Reels vs TikTok: Which Platform Wins in 2025?',
        excerpt: 'Compare reach, engagement, and monetization opportunities across both platforms.',
        category: 'Instagram',
        categoryColor: 'bg-rose-500',
        thumbnail: '/blog/ig-vs-tt.jpg',
        author: { name: 'Marcus Johnson', avatar: '👨‍💼' },
        readTime: '8 min',
        date: 'Jan 12, 2025'
    },
    {
        id: 3,
        title: 'YouTube Shorts Algorithm Explained: Get More Views',
        excerpt: 'Decode the YouTube Shorts algorithm and optimize your content for maximum visibility.',
        category: 'YouTube',
        categoryColor: 'bg-orange-500',
        thumbnail: '/blog/yt-algo.jpg',
        author: { name: 'Elena Rodriguez', avatar: '👩‍💼' },
        readTime: '10 min',
        date: 'Jan 10, 2025'
    },
    {
        id: 4,
        title: 'Content Calendar Template: Plan 30 Days in 2 Hours',
        excerpt: 'Free template and workflow to batch-create and schedule a month of content efficiently.',
        category: 'Productivity',
        categoryColor: 'bg-green-500',
        thumbnail: '/blog/calendar.jpg',
        author: { name: 'Sarah Chen', avatar: '👩‍💼' },
        readTime: '6 min',
        date: 'Jan 8, 2025'
    },
    {
        id: 5,
        title: 'Best Times to Post on TikTok in 2025 [Data-Backed]',
        excerpt: 'Analysis of 10M posts reveals optimal posting windows for maximum engagement.',
        category: 'TikTok',
        categoryColor: 'bg-pink-500',
        thumbnail: '/blog/timing.jpg',
        author: { name: 'Marcus Johnson', avatar: '👨‍💼' },
        readTime: '7 min',
        date: 'Jan 5, 2025'
    },
    {
        id: 6,
        title: 'How to Repurpose One Video Across 5 Platforms',
        excerpt: 'Maximize your content ROI by adapting one core video for TikTok, Instagram, YouTube, and more.',
        category: 'Productivity',
        categoryColor: 'bg-green-500',
        thumbnail: '/blog/repurpose.jpg',
        author: { name: 'Elena Rodriguez', avatar: '👩‍💼' },
        readTime: '9 min',
        date: 'Jan 3, 2025'
    }
]

const categoryPosts = {
    tiktok: [
        { id: 7, title: 'TikTok Hashtag Strategy That Actually Works', category: 'TikTok', readTime: '5 min', thumbnail: '/blog/hashtags.jpg' },
        { id: 8, title: 'TikTok Live: Complete Beginner\'s Guide', category: 'TikTok', readTime: '11 min', thumbnail: '/blog/live.jpg' },
        { id: 9, title: 'How to Get Your First 10K TikTok Followers', category: 'TikTok', readTime: '8 min', thumbnail: '/blog/10k.jpg' },
        { id: 10, title: 'TikTok SEO: Rank Higher in Search Results', category: 'TikTok', readTime: '6 min', thumbnail: '/blog/seo.jpg' }
    ],
    instagram: [
        { id: 11, title: 'Instagram Reels Editing Hacks for Viral Content', category: 'Instagram', readTime: '7 min', thumbnail: '/blog/editing.jpg' },
        { id: 12, title: 'How to Use Instagram Insights for Growth', category: 'Instagram', readTime: '9 min', thumbnail: '/blog/insights.jpg' },
        { id: 13, title: 'Instagram Stories vs Reels: When to Use Each', category: 'Instagram', readTime: '5 min', thumbnail: '/blog/stories.jpg' },
        { id: 14, title: 'Collaborate with Brands on Instagram in 2025', category: 'Instagram', readTime: '10 min', thumbnail: '/blog/brands.jpg' }
    ],
    youtube: [
        { id: 15, title: 'YouTube Shorts Monetization: Complete Guide', category: 'YouTube', readTime: '12 min', thumbnail: '/blog/money.jpg' },
        { id: 16, title: 'How to Optimize YouTube Shorts Thumbnails', category: 'YouTube', readTime: '6 min', thumbnail: '/blog/thumbs.jpg' },
        { id: 17, title: 'YouTube Shorts vs Long-Form: Which to Choose?', category: 'YouTube', readTime: '8 min', thumbnail: '/blog/format.jpg' },
        { id: 18, title: 'Cross-Promote YouTube Shorts on Other Platforms', category: 'YouTube', readTime: '7 min', thumbnail: '/blog/cross.jpg' }
    ],
    productivity: [
        { id: 19, title: 'Batch Content Creation: Save 10 Hours Per Week', category: 'Productivity', readTime: '9 min', thumbnail: '/blog/batch.jpg' },
        { id: 20, title: 'Best Video Editing Apps for Mobile Creators', category: 'Productivity', readTime: '11 min', thumbnail: '/blog/apps.jpg' },
        { id: 21, title: 'Content Workflow Automation for Solo Creators', category: 'Productivity', readTime: '8 min', thumbnail: '/blog/auto.jpg' },
        { id: 22, title: 'How to Organize Your Video Library Effectively', category: 'Productivity', readTime: '6 min', thumbnail: '/blog/organize.jpg' }
    ]
}

const popularPosts = [
    { id: 1, title: 'How to Create Viral TikTok Reels in 2025', views: '24.5K', thumbnail: '/blog/featured.jpg' },
    { id: 23, title: 'Instagram Algorithm Changes: What You Need to Know', views: '18.2K', thumbnail: '/blog/algo.jpg' },
    { id: 24, title: 'Complete Guide to YouTube Shorts Success', views: '15.8K', thumbnail: '/blog/success.jpg' },
    { id: 25, title: 'Content Planning 101: From Idea to Upload', views: '12.4K', thumbnail: '/blog/planning.jpg' },
    { id: 26, title: 'Analytics That Matter: Track What Counts', views: '11.1K', thumbnail: '/blog/metrics.jpg' }
]

const searchQuery = ref('')
const newsletterEmail = ref('')

const scrollToSection = (sectionId: string) => {
    if (typeof document !== 'undefined') {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    }
}

const subscribeNewsletter = () => {
    if (newsletterEmail.value) {
        alert(`Subscribed! Check ${newsletterEmail.value} for confirmation.`)
        newsletterEmail.value = ''
    }
}
</script>

<template>
    <div class="w-full min-h-screen bg-white">
        <header class="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm z-[1000] py-3">
            <div class="max-w-[1200px] mx-auto px-6">
                <nav class="flex justify-between items-center">
                    <div class="flex items-center gap-2 cursor-pointer" @click="router.push('/')">
                        <!--<div
                            class="w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            R</div>-->
                        <div class="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            <!--bg-gradient-to-br from-violet-600 to-blue-600-->
                            <img src="@/assets/new_new_logo.svg" alt="Reelmia.com logo">
                        </div>
                        <span
                            class="text-lg font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Reelmia</span>
                    </div>
                    <div class="hidden md:flex items-center gap-8">
                        <button @click="router.push('/')"
                            class="text-slate-600 text-sm font-medium hover:text-slate-900 transition-colors">Home</button>
                        <button @click="scrollToSection('categories')"
                            class="text-slate-600 text-sm font-medium hover:text-slate-900 transition-colors">Categories</button>
                        <a href="#"
                            class="text-slate-600 text-sm font-medium hover:text-slate-900 transition-colors">About</a>
                    </div>
                    <div class="flex items-center gap-3">
                        <button @click="router.push('/login')"
                            class="hidden sm:block bg-transparent border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:border-slate-400 transition-colors">Login</button>
                        <button @click="router.push('/signup')"
                            class="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">Start
                            Free</button>
                    </div>
                </nav>
            </div>
        </header>
        <div class="bg-slate-50 border-b border-slate-200">
            <div class="max-w-[1200px] mx-auto px-6 py-3">
                <div class="flex items-center gap-2 text-sm text-slate-600">
                    <button @click="router.push('/')" class="hover:text-slate-900">Home</button>
                    <i class="fas fa-chevron-right text-xs"></i>
                    <span class="text-slate-900 font-medium">Blog</span>
                </div>
            </div>
        </div>
        <section class="relative py-16 bg-gradient-to-br from-violet-50 via-blue-50 to-white overflow-hidden">
            <div class="absolute inset-0 opacity-30">
                <div
                    class="absolute top-10 left-10 w-64 h-64 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl">
                </div>
                <div
                    class="absolute bottom-10 right-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl">
                </div>
            </div>
            <div class="max-w-[1200px] mx-auto px-6 relative z-10">
                <div class="text-center space-y-6">
                    <h1 class="text-4xl md:text-5xl font-bold text-slate-900">The Reelmia Creator Hub</h1>
                    <p class="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">Guides, tips, and strategies to
                        master TikTok, Instagram Reels, and YouTube Shorts</p>
                    <div class="max-w-xl mx-auto relative">
                        <input v-model="searchQuery" type="text" placeholder="Search articles..."
                            class="w-full px-6 py-4 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-violet-200 outline-none text-slate-900 pr-12">
                        <button class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                    <div class="flex items-center justify-center gap-3 flex-wrap">
                        <input v-model="newsletterEmail" type="email" placeholder="Enter your email"
                            class="px-4 py-2 rounded-lg border border-slate-300 text-slate-900 w-64">
                        <button @click="subscribeNewsletter"
                            class="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all">
                            Subscribe to Weekly Tips
                        </button>
                    </div>
                </div>
            </div>
        </section>
        <section class="py-16">
            <div class="max-w-[1200px] mx-auto px-6">
                <div class="relative group cursor-pointer" @click="router.push(`/blog/${featuredPost.id}`)">
                    <div
                        class="absolute -top-3 left-6 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold z-10">
                        Featured
                    </div>
                    <div
                        class="grid md:grid-cols-2 gap-8 bg-gradient-to-br from-slate-50 to-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300">
                        <div
                            class="aspect-video bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center">
                            <i class="fas fa-play-circle text-6xl text-violet-600"></i>
                        </div>
                        <div class="p-8 flex flex-col justify-center">
                            <span
                                :class="[featuredPost.categoryColor, 'text-white text-xs font-semibold px-3 py-1 rounded-full w-fit mb-4']">
                                {{ featuredPost.category }}
                            </span>
                            <h2
                                class="text-3xl font-bold text-slate-900 mb-4 group-hover:text-violet-600 transition-colors">
                                {{ featuredPost.title }}
                            </h2>
                            <p class="text-slate-600 mb-6 line-clamp-3">{{ featuredPost.excerpt }}</p>
                            <div class="flex items-center gap-4 text-sm text-slate-600">
                                <div class="flex items-center gap-2">
                                    <span class="text-2xl">{{ featuredPost.author.avatar }}</span>
                                    <span class="font-medium">{{ featuredPost.author.name }}</span>
                                </div>
                                <span>•</span>
                                <span>{{ featuredPost.readTime }}</span>
                                <span>•</span>
                                <span>{{ featuredPost.date }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section class="py-16 bg-slate-50">
            <div class="max-w-[1200px] mx-auto px-6">
                <h2 class="text-3xl font-bold text-slate-900 mb-12">Latest Insights</h2>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div v-for="post in recentPosts" :key="post.id"
                        class="group cursor-pointer bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-violet-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        @click="router.push(`/blog/${post.id}`)">
                        <div
                            class="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <i class="fas fa-image text-3xl text-slate-400"></i>
                        </div>
                        <div class="p-6">
                            <span
                                :class="[post.categoryColor, 'text-white text-xs font-semibold px-2 py-1 rounded-full']">
                                {{ post.category }}
                            </span>
                            <h3
                                class="text-xl font-bold text-slate-900 mt-3 mb-2 group-hover:text-violet-600 transition-colors line-clamp-2">
                                {{ post.title }}
                            </h3>
                            <p class="text-slate-600 text-sm mb-4 line-clamp-2">{{ post.excerpt }}</p>
                            <div class="flex items-center gap-3 text-sm text-slate-600">
                                <span class="text-xl">{{ post.author.avatar }}</span>
                                <span>{{ post.author.name }}</span>
                                <span>•</span>
                                <span>{{ post.readTime }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section id="categories" class="py-16">
            <div class="max-w-[1200px] mx-auto px-6 space-y-16">
                <div>
                    <div class="flex justify-between items-center mb-8">
                        <h2 class="text-3xl font-bold text-slate-900">🎵 TikTok Growth Strategies</h2>
                        <button class="text-violet-600 font-semibold hover:text-violet-700 transition-colors">
                            View All TikTok Posts →
                        </button>
                    </div>
                    <div class="grid md:grid-cols-2 gap-6">
                        <div v-for="post in categoryPosts.tiktok" :key="post.id"
                            class="group cursor-pointer flex gap-4 bg-white rounded-xl p-4 border border-slate-200 hover:border-pink-300 hover:shadow-md transition-all"
                            @click="router.push(`/blog/${post.id}`)">
                            <div
                                class="w-24 h-24 bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                                <i class="fab fa-tiktok text-2xl text-pink-600"></i>
                            </div>
                            <div class="flex-1">
                                <h3 class="font-bold text-slate-900 group-hover:text-pink-600 transition-colors mb-2">{{
                                    post.title }}</h3>
                                <span class="text-sm text-slate-600">{{ post.readTime }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="flex justify-between items-center mb-8">
                        <h2 class="text-3xl font-bold text-slate-900">📸 Instagram Reels Mastery</h2>
                        <button class="text-violet-600 font-semibold hover:text-violet-700 transition-colors">
                            View All Instagram Posts →
                        </button>
                    </div>
                    <div class="grid md:grid-cols-2 gap-6">
                        <div v-for="post in categoryPosts.instagram" :key="post.id"
                            class="group cursor-pointer flex gap-4 bg-white rounded-xl p-4 border border-slate-200 hover:border-rose-300 hover:shadow-md transition-all"
                            @click="router.push(`/blog/${post.id}`)">
                            <div
                                class="w-24 h-24 bg-gradient-to-br from-rose-100 to-rose-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                                <i class="fab fa-instagram text-2xl text-rose-600"></i>
                            </div>
                            <div class="flex-1">
                                <h3 class="font-bold text-slate-900 group-hover:text-rose-600 transition-colors mb-2">{{
                                    post.title }}</h3>
                                <span class="text-sm text-slate-600">{{ post.readTime }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="flex justify-between items-center mb-8">
                        <h2 class="text-3xl font-bold text-slate-900">🎬 YouTube Shorts Optimization</h2>
                        <button class="text-violet-600 font-semibold hover:text-violet-700 transition-colors">
                            View All YouTube Posts →
                        </button>
                    </div>
                    <div class="grid md:grid-cols-2 gap-6">
                        <div v-for="post in categoryPosts.youtube" :key="post.id"
                            class="group cursor-pointer flex gap-4 bg-white rounded-xl p-4 border border-slate-200 hover:border-red-300 hover:shadow-md transition-all"
                            @click="router.push(`/blog/${post.id}`)">
                            <div
                                class="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                                <i class="fab fa-youtube text-2xl text-orange-600"></i>
                            </div>
                            <div class="flex-1">
                                <h3 class="font-bold text-slate-900 group-hover:text-orange-600 transition-colors mb-2">{{
                                    post.title }}</h3>
                                <span class="text-sm text-slate-600">{{ post.readTime }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="flex justify-between items-center mb-8">
                        <h2 class="text-3xl font-bold text-slate-900">⚡ Content Planning & Productivity</h2>
                        <button class="text-violet-600 font-semibold hover:text-violet-700 transition-colors">
                            View All Planning Posts →
                        </button>
                    </div>
                    <div class="grid md:grid-cols-2 gap-6">
                        <div v-for="post in categoryPosts.productivity" :key="post.id"
                            class="group cursor-pointer flex gap-4 bg-white rounded-xl p-4 border border-slate-200 hover:border-green-300 hover:shadow-md transition-all"
                            @click="router.push(`/blog/${post.id}`)">
                            <div
                                class="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                                <i class="fas fa-rocket text-2xl text-green-600"></i>
                            </div>
                            <div class="flex-1">
                                <h3 class="font-bold text-slate-900 group-hover:text-green-600 transition-colors mb-2">
                                    {{ post.title }}</h3>
                                <span class="text-sm text-slate-600">{{ post.readTime }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section class="py-20 bg-gradient-to-r from-violet-600 via-blue-600 to-blue-500 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10">
                <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <pattern id="blog-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" stroke-width="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#blog-grid)" />
                </svg>
            </div>
            <div class="max-w-[600px] mx-auto px-6 relative z-10 text-center">
                <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Never Miss a Post</h2>
                <p class="text-lg text-blue-100 mb-8">Weekly social media tips, platform updates, and creator strategies
                    delivered to your inbox</p>

                <div class="flex flex-col sm:flex-row gap-3 justify-center">
                    <input v-model="newsletterEmail" type="email" placeholder="Enter your email"
                        class="px-6 py-3 rounded-lg text-slate-900 flex-1 max-w-sm">
                    <button @click="subscribeNewsletter"
                        class="bg-white text-violet-600 px-8 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors">
                        Subscribe
                    </button>
                </div>

                <p class="text-sm text-blue-100 mt-4">Join 5,000+ creators. Unsubscribe anytime.</p>
            </div>
        </section>
        <section class="py-16 bg-slate-50">
            <div class="max-w-[1200px] mx-auto px-6">
                <h2 class="text-3xl font-bold text-slate-900 mb-8">Most Read This Month</h2>

                <div class="grid md:grid-cols-5 gap-4">
                    <div v-for="(post, index) in popularPosts" :key="post.id"
                        class="group cursor-pointer bg-white rounded-xl p-4 border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all relative"
                        @click="router.push(`/blog/${post.id}`)">
                        <div
                            class="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {{ index + 1 }}
                        </div>
                        <div
                            class="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-3 flex items-center justify-center">
                            <i class="fas fa-image text-2xl text-slate-400"></i>
                        </div>
                        <h3
                            class="font-semibold text-slate-900 text-sm mb-2 line-clamp-2 group-hover:text-violet-600 transition-colors">
                            {{ post.title }}
                        </h3>
                        <div class="flex items-center gap-2 text-xs text-slate-600">
                            <i class="fas fa-eye"></i>
                            <span>{{ post.views }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <footer class="bg-slate-900 text-slate-300 py-12">
            <div class="max-w-[1200px] mx-auto px-6">
                <div class="grid md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div class="flex items-center gap-2 mb-4">
                            <!-- <div
                                class="w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                R</div>-->
                            <div
                                class="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                <!--bg-gradient-to-br from-violet-600 to-blue-600-->
                                <img src="@/assets/new_new_logo.svg" alt="Reelmia.com logo">
                            </div>
                            <span class="text-lg font-bold text-white">Reelmia Blog</span>
                        </div>
                        <p class="text-sm text-slate-400">Insights for content creators and social media managers.</p>
                    </div>
                    <div>
                        <h4 class="font-semibold text-white mb-4">Categories</h4>
                        <ul class="space-y-2 text-sm">
                            <li><a href="#" class="hover:text-white transition-colors">TikTok Marketing</a></li>
                            <li><a href="#" class="hover:text-white transition-colors">Instagram Reels</a></li>
                            <li><a href="#" class="hover:text-white transition-colors">YouTube Shorts</a></li>
                            <li><a href="#" class="hover:text-white transition-colors">Productivity</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold text-white mb-4">Product</h4>
                        <ul class="space-y-2 text-sm">
                            <li><button @click="router.push('/')"
                                    class="hover:text-white transition-colors">Home</button></li>
                            <li><a href="#" class="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#" class="hover:text-white transition-colors">Pricing</a></li>
                            <li><button @click="router.push('/signup')" class="hover:text-white transition-colors">Start
                                    Free Trial</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold text-white mb-4">Legal</h4>
                        <ul class="space-y-2 text-sm">
                            <li><a href="#" class="hover:text-white transition-colors">Privacy</a></li>
                            <li><a href="#" class="hover:text-white transition-colors">Terms</a></li>
                            <li><a href="#" class="hover:text-white transition-colors">Imprint</a></li>
                        </ul>
                    </div>
                </div>
                <div class="border-t border-slate-800 pt-8 text-center text-sm">
                    <p>&copy; 2025 Reelmia. All rights reserved.</p>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>