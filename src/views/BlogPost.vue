<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const postId = route.params.id

const post = {
    title: 'How to Create Viral TikTok Reels in 2025: Complete Guide',
    category: 'TikTok',
    categoryColor: 'bg-pink-500',
    author: {
        name: 'Sarah Chen',
        role: 'Social Media Strategist',
        avatar: '👩‍💼',
        bio: 'Sarah has helped 100+ creators grow their TikTok following. Former social media manager at TechCorp.'
    },
    publishDate: 'January 15, 2025',
    lastUpdated: 'January 16, 2025',
    readTime: '12 min read',
    views: '24.5K',
    content: `
        <h2>Understanding the TikTok Algorithm</h2>
        <p>The TikTok algorithm in 2025 prioritizes engagement velocity, watch time, and completion rates. Here's what you need to know...</p>
        
        <h3>Key Ranking Factors</h3>
        <p>Watch time remains the #1 factor. Videos that keep viewers engaged for 80%+ of the duration get massive algorithmic boosts.</p>
        
        <h3>Common Mistakes to Avoid</h3>
        <p>Don't post at random times. Data shows specific windows deliver 3-5x better reach...</p>
        
        <h2>Best Posting Times for Maximum Reach</h2>
        <p>After analyzing 10M posts, we found optimal windows vary by niche...</p>
    `
}

const relatedPosts = [
    { id: 2, title: 'TikTok Hashtag Strategy That Actually Works', thumbnail: '/blog/hashtags.jpg', readTime: '5 min' },
    { id: 3, title: 'How to Get Your First 10K TikTok Followers', thumbnail: '/blog/10k.jpg', readTime: '8 min' },
    { id: 4, title: 'TikTok SEO: Rank Higher in Search Results', thumbnail: '/blog/seo.jpg', readTime: '6 min' }
]

const newsletterEmail = ref('')

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
                        <div
                            class="w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            R</div>
                        <span
                            class="text-lg font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Reelmia</span>
                    </div>

                    <div class="hidden md:flex items-center gap-8">
                        <button @click="router.push('/')"
                            class="text-slate-600 text-sm font-medium hover:text-slate-900 transition-colors">Home</button>
                        <button @click="router.push('/blog')"
                            class="text-slate-600 text-sm font-medium hover:text-slate-900 transition-colors">Blog</button>
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
            <div class="max-w-[800px] mx-auto px-6 py-3">
                <div class="flex items-center gap-2 text-sm text-slate-600">
                    <button @click="router.push('/')" class="hover:text-slate-900">Home</button>
                    <i class="fas fa-chevron-right text-xs"></i>
                    <button @click="router.push('/blog')" class="hover:text-slate-900">Blog</button>
                    <i class="fas fa-chevron-right text-xs"></i>
                    <span :class="[post.categoryColor, 'text-white px-2 py-0.5 rounded text-xs']">{{ post.category
                        }}</span>
                </div>
            </div>
        </div>
        <article class="py-12">
            <div class="max-w-[800px] mx-auto px-6">
                <span
                    :class="[post.categoryColor, 'text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4']">
                    {{ post.category }}
                </span>

                <h1 class="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                    {{ post.title }}
                </h1>
                <div class="flex flex-wrap items-center gap-4 pb-6 border-b border-slate-200 mb-8">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">{{ post.author.avatar }}</span>
                        <div>
                            <p class="font-semibold text-slate-900">{{ post.author.name }}</p>
                            <p class="text-sm text-slate-600">{{ post.author.role }}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-4 text-sm text-slate-600">
                        <span>{{ post.publishDate }}</span>
                        <span>•</span>
                        <span>{{ post.readTime }}</span>
                        <span>•</span>
                        <div class="flex items-center gap-1">
                            <i class="fas fa-eye"></i>
                            <span>{{ post.views }}</span>
                        </div>
                    </div>
                </div>
                <div
                    class="aspect-video bg-gradient-to-br from-violet-100 to-blue-100 rounded-2xl mb-12 flex items-center justify-center">
                    <i class="fas fa-image text-6xl text-violet-400"></i>
                </div>
                <div class="prose prose-lg max-w-none">
                    <div v-html="post.content" class="text-slate-700 leading-relaxed"></div>
                </div>
                <div
                    class="my-12 p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-300">
                    <h3 class="text-2xl font-bold text-slate-900 mb-3">Ready to automate your posting?</h3>
                    <p class="text-slate-600 mb-6">Try Reelmia free for 14 days. Schedule, publish, and analyze all your
                        social videos in one place.</p>
                    <button @click="router.push('/signup')"
                        class="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                        Start Free Trial
                    </button>
                </div>
                <div class="my-12 p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <div class="flex gap-4">
                        <span class="text-5xl">{{ post.author.avatar }}</span>
                        <div>
                            <h4 class="text-xl font-bold text-slate-900 mb-1">{{ post.author.name }}</h4>
                            <p class="text-sm text-slate-600 mb-2">{{ post.author.role }}</p>
                            <p class="text-slate-700">{{ post.author.bio }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </article>
        <section class="py-16 bg-slate-50">
            <div class="max-w-[1200px] mx-auto px-6">
                <h2 class="text-3xl font-bold text-slate-900 mb-8">Continue Reading</h2>
                <div class="grid md:grid-cols-3 gap-8">
                    <div v-for="related in relatedPosts" :key="related.id"
                        class="group cursor-pointer bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-violet-300 hover:shadow-lg transition-all"
                        @click="router.push(`/blog/${related.id}`)">
                        <div
                            class="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <i class="fas fa-image text-2xl text-slate-400"></i>
                        </div>
                        <div class="p-6">
                            <h3 class="font-bold text-slate-900 mb-2 group-hover:text-violet-600 transition-colors">
                                {{ related.title }}
                            </h3>
                            <span class="text-sm text-slate-600">{{ related.readTime }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section class="py-16">
            <div class="max-w-[600px] mx-auto px-6 text-center">
                <h2 class="text-3xl font-bold text-slate-900 mb-4">Enjoyed this article?</h2>
                <p class="text-lg text-slate-600 mb-8">Get weekly insights like these in your inbox</p>
                <div class="flex flex-col sm:flex-row gap-3 justify-center">
                    <input v-model="newsletterEmail" type="email" placeholder="Enter your email"
                        class="px-6 py-3 rounded-lg border border-slate-300 text-slate-900 flex-1 max-w-sm">
                    <button @click="subscribeNewsletter"
                        class="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                        Subscribe
                    </button>
                </div>
            </div>
        </section>
        <footer class="bg-slate-900 text-slate-300 py-12">
            <div class="max-w-[1200px] mx-auto px-6">
                <div class="grid md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div class="flex items-center gap-2 mb-4">
                            <div
                                class="w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                R</div>
                            <span class="text-lg font-bold text-white">Reelmia</span>
                        </div>
                        <p class="text-sm text-slate-400">Manage all your social media videos in one place.</p>
                    </div>
                    <div>
                        <h4 class="font-semibold text-white mb-4">Blog</h4>
                        <ul class="space-y-2 text-sm">
                            <li><button @click="router.push('/blog')" class="hover:text-white transition-colors">All
                                    Posts</button></li>
                            <li><a href="#" class="hover:text-white transition-colors">TikTok</a></li>
                            <li><a href="#" class="hover:text-white transition-colors">Instagram</a></li>
                            <li><a href="#" class="hover:text-white transition-colors">YouTube</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold text-white mb-4">Product</h4>
                        <ul class="space-y-2 text-sm">
                            <li><button @click="router.push('/')"
                                    class="hover:text-white transition-colors">Home</button></li>
                            <li><a href="#" class="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#" class="hover:text-white transition-colors">Pricing</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold text-white mb-4">Legal</h4>
                        <ul class="space-y-2 text-sm">
                            <li><a href="#" class="hover:text-white transition-colors">Privacy</a></li>
                            <li><a href="#" class="hover:text-white transition-colors">Terms</a></li>
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
.prose h2 {
    font-size: 2rem;
    font-weight: 600;
    color: #1e293b;
    margin-top: 3rem;
    margin-bottom: 1.5rem;
}

.prose h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #334155;
    margin-top: 2rem;
    margin-bottom: 1rem;
}

.prose p {
    font-size: 1.125rem;
    line-height: 1.75;
    margin-bottom: 1.5rem;
}
</style>
