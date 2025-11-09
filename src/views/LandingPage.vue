<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const benefits = [
    {
        icon: 'rocket',
        title: 'Create Once, Post Everywhere',
        description: 'Upload one video and publish simultaneously to TikTok, Instagram, YouTube, and more.'
    },
    {
        icon: 'clock',
        title: 'Smart Scheduling That Works',
        description: 'AI-powered timing suggestions ensure your content reaches viewers at peak moments.'
    },
    {
        icon: 'chart-line',
        title: 'Analytics at a Glance',
        description: 'Track performance across all platforms with unified metrics and insights.'
    },
    {
        icon: 'users',
        title: 'Collaborate Without Chaos',
        description: 'Team workflows, approvals, and content calendars built for collaboration.'
    }
]

const advancedFeatures = [
    {
        title: 'AI-Powered Captions',
        description: 'Automatic subtitle generation in 50+ languages for maximum accessibility and reach.'
    },
    {
        title: 'Content Optimization',
        description: 'Get platform-specific recommendations for titles, hashtags, and posting times.'
    },
    {
        title: 'Batch Operations',
        description: 'Manage, edit, and schedule dozens of videos at once with bulk actions.'
    },
    {
        title: 'Custom Branding',
        description: 'Apply consistent brand overlays, watermarks, and color corrections across videos.'
    },
    {
        title: 'API Access',
        description: 'Build custom workflows and integrate Reelmia with your existing tools.'
    },
    {
        title: 'Team Roles & Permissions',
        description: 'Granular control over who can upload, edit, approve, and publish content.'
    }
]

const testimonials = [
    {
        name: 'Sarah Chen',
        role: 'Content Creator',
        quote: 'Reelmia saves me 5 hours every week. No more jumping between apps.',
        avatar: '👩‍💼'
    },
    {
        name: 'Marcus Johnson',
        role: 'Social Media Manager',
        quote: 'Our posting consistency improved 80% since we switched. The team loves it.',
        avatar: '👨‍💼'
    },
    {
        name: 'Elena Rodriguez',
        role: 'Brand Manager',
        quote: 'The analytics are insane. Now we actually know what works.',
        avatar: '👩‍💼'
    }
]

const pricing = [
    {
        name: 'Creator',
        price: '$29',
        period: '/month',
        description: 'Perfect for solo creators',
        features: [
            'Up to 50 videos/month',
            '6 platform connections',
            'Basic analytics'
        ]
    },
    {
        name: 'Team',
        price: '$99',
        period: '/month',
        popular: true,
        description: 'For growing teams',
        features: [
            'Unlimited videos',
            'All platforms',
            'Advanced analytics',
            'Team collaboration'
        ]
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: 'pricing',
        description: 'For large organizations',
        features: [
            'Everything in Team',
            'Dedicated support',
            'Custom integrations',
            'SSO & security'
        ]
    }
]

const platforms = [
    { name: 'TikTok', icon: 'tiktok' },
    { name: 'Instagram', icon: 'instagram' },
    { name: 'YouTube', icon: 'youtube' },
    { name: 'Facebook', icon: 'facebook' },
    { name: 'LinkedIn', icon: 'linkedin' },
    { name: 'X', icon: 'x-twitter' }
]

const expandedFeature = ref<number | null>(null)
const isScrolled = ref(false)

const scrollToSection = (sectionId: string) => {
    if (typeof document !== 'undefined') {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    }
}

onMounted(() => {
    window.addEventListener('scroll', () => {
        isScrolled.value = window.scrollY > 100
    })
})
</script>

<template>
    <div class="w-full min-h-screen bg-white overflow-x-hidden">
        <header
            :class="['sticky top-0 z-[1000] transition-all duration-300', isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm py-3' : 'bg-white/50 backdrop-blur-sm py-4']">
            <div class="max-w-[1200px] mx-auto px-6">
                <nav class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <div class="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            <!--bg-gradient-to-br from-violet-600 to-blue-600-->
                            <img src="@/assets/new_new_logo.svg" alt="Reelmia.com logo">
                        </div>
                        <span
                            class="text-lg font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Reelmia</span>
                    </div>
                    <div class="hidden md:flex items-center gap-8">
                        <button @click="scrollToSection('benefits')"
                            class="text-slate-600 text-sm font-medium hover:text-slate-900 transition-colors">Features</button>
                        <button @click="scrollToSection('pricing')"
                            class="text-slate-600 text-sm font-medium hover:text-slate-900 transition-colors">Pricing</button>
                        <a href="#"
                            class="text-slate-600 text-sm font-medium hover:text-slate-900 transition-colors">Docs</a>
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
        <section class="relative pt-20 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-white via-blue-50/30 to-white">
            <div class="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    class="absolute top-20 right-20 w-72 h-72 bg-violet-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30">
                </div>
                <div
                    class="absolute bottom-20 left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30">
                </div>
            </div>
            <div class="max-w-[1200px] mx-auto px-6 relative z-10">
                <div class="grid md:grid-cols-[1fr_1fr] gap-12 items-center">
                    <div class="space-y-8">
                        <div class="space-y-4">
                            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-slate-900">
                                Manage all social videos in one place
                            </h1>
                            <p class="text-lg md:text-xl text-slate-600 leading-relaxed">
                                Plan, publish, and analyze your TikTok, Instagram Reels, YouTube Shorts and more –
                                without switching between apps.
                            </p>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-4 pt-4">
                            <button @click="router.push('/signup')"
                                class="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl text-base font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                                Start Free Trial
                            </button>
                            <button
                                class="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-xl text-base font-semibold hover:border-slate-400 hover:bg-slate-50 transition-colors">
                                <i class="fas fa-play text-orange-500 mr-2"></i> Watch Demo
                            </button>
                        </div>
                        <div class="flex flex-wrap gap-4 text-sm text-slate-600">
                            <div class="flex items-center gap-2">
                                <i class="fas fa-check text-green-500"></i>
                                <span>No credit card required</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <i class="fas fa-check text-green-500"></i>
                                <span>14 days free trial</span>
                            </div>
                        </div>
                    </div>
                    <div class="relative hidden md:block">
                        <div
                            class="relative bg-gradient-to-br from-violet-500/10 to-blue-500/10 rounded-2xl p-6 backdrop-blur-xl border border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2">
                            <div class="bg-white rounded-lg overflow-hidden shadow-lg">
                                <div
                                    class="bg-gradient-to-r from-slate-900 to-slate-800 h-10 flex items-center px-4 gap-2">
                                    <div class="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div class="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <div class="p-6 space-y-4">
                                    <div class="flex gap-2">
                                        <div class="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-lg">
                                        </div>
                                        <div class="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-600 rounded-lg">
                                        </div>
                                        <div class="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                                        </div>
                                    </div>
                                    <div class="space-y-2">
                                        <div class="h-3 bg-slate-200 rounded w-3/4"></div>
                                        <div class="h-3 bg-slate-200 rounded w-1/2"></div>
                                    </div>
                                    <div class="flex gap-2">
                                        <i class="fab fa-tiktok text-lg text-slate-600"></i>
                                        <i class="fab fa-instagram text-lg text-slate-600"></i>
                                        <i class="fab fa-youtube text-lg text-slate-600"></i>
                                    </div>
                                </div>
                            </div>
                            <div
                                class="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 opacity-0 blur-2xl -z-10 group-hover:opacity-50 transition-opacity duration-300">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section class="py-12 border-b border-slate-100">
            <div class="max-w-[1200px] mx-auto px-6">
                <div class="text-center mb-8">
                    <p class="text-sm font-semibold text-slate-500 uppercase tracking-wide">Trusted by creators
                        worldwide</p>
                </div>
                <div class="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                    <div v-for="i in 5" :key="i" class="flex items-center gap-2">
                        <div class="flex -space-x-2">
                            <div
                                class="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 border-2 border-white">
                            </div>
                            <div
                                class="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 border-2 border-white">
                            </div>
                            <div
                                class="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-400 border-2 border-white">
                            </div>
                        </div>
                        <span class="text-sm font-semibold text-slate-700">500+</span>
                        <span class="text-sm text-slate-600">Creators</span>
                    </div>
                </div>
            </div>
        </section>
        <section class="py-20 md:py-28 bg-slate-50">
            <div class="max-w-[1200px] mx-auto px-6">
                <div class="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Too many tools, too little time?
                        </h2>
                        <div class="space-y-4">
                            <div class="flex gap-4 items-start">
                                <div
                                    class="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-1">
                                    <i class="fas fa-times text-white text-sm"></i>
                                </div>
                                <div>
                                    <p class="font-semibold text-slate-900">Switching between platforms</p>
                                    <p class="text-slate-600 text-sm">Jumping between TikTok, Instagram, YouTube drains
                                        your focus and time.</p>
                                </div>
                            </div>
                            <div class="flex gap-4 items-start">
                                <div
                                    class="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-1">
                                    <i class="fas fa-times text-white text-sm"></i>
                                </div>
                                <div>
                                    <p class="font-semibold text-slate-900">Missed posting times</p>
                                    <p class="text-slate-600 text-sm">Without planning, you miss peak engagement
                                        windows.</p>
                                </div>
                            </div>
                            <div class="flex gap-4 items-start">
                                <div
                                    class="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-1">
                                    <i class="fas fa-times text-white text-sm"></i>
                                </div>
                                <div>
                                    <p class="font-semibold text-slate-900">No unified analytics</p>
                                    <p class="text-slate-600 text-sm">Tracking performance across platforms is a
                                        nightmare.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="hidden md:block bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                        <div class="space-y-4">
                            <div
                                class="flex gap-3 items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-not-allowed opacity-60">
                                <span class="text-sm font-medium text-slate-700">TikTok</span>
                                <i class="fab fa-tiktok text-slate-400"></i>
                            </div>
                            <div
                                class="flex gap-3 items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-not-allowed opacity-60">
                                <span class="text-sm font-medium text-slate-700">Instagram</span>
                                <i class="fab fa-instagram text-slate-400"></i>
                            </div>
                            <div
                                class="flex gap-3 items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-not-allowed opacity-60">
                                <span class="text-sm font-medium text-slate-700">YouTube</span>
                                <i class="fab fa-youtube text-slate-400"></i>
                            </div>
                            <div
                                class="flex gap-3 items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-not-allowed opacity-60">
                                <span class="text-sm font-medium text-slate-700">Facebook</span>
                                <i class="fab fa-facebook text-slate-400"></i>
                            </div>
                        </div>
                        <p class="text-center text-slate-500 text-xs mt-4">Scattered across multiple apps...</p>
                    </div>
                </div>
            </div>
        </section>
        <section id="benefits" class="py-20 md:py-28">
            <div class="max-w-[1200px] mx-auto px-6">
                <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">All you need. Nothing you don't.</h2>
                    <p class="text-lg text-slate-600 max-w-2xl mx-auto">Everything built for content creators and social
                        media managers</p>
                </div>
                <div class="grid md:grid-cols-2 gap-8">
                    <div v-for="(benefit, index) in benefits" :key="index"
                        class="group relative p-8 rounded-2xl border border-slate-200 hover:border-orange-300 bg-white hover:bg-gradient-to-br hover:from-orange-50 to-transparent transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <div
                            class="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xl mb-6 group-hover:scale-110 transition-transform">
                            <i :class="`fas fa-${benefit.icon}`"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-900 mb-2">{{ benefit.title }}</h3>
                        <p class="text-slate-600 leading-relaxed">{{ benefit.description }}</p>
                    </div>
                </div>
            </div>
        </section>
        <section class="py-20 md:py-28 bg-slate-50">
            <div class="max-w-[1200px] mx-auto px-6">
                <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">And if you want more...</h2>
                    <p class="text-lg text-slate-600">Advanced features for power users</p>
                </div>

                <div class="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <div v-for="(feature, index) in advancedFeatures" :key="index"
                        class="group cursor-pointer bg-white rounded-xl border border-slate-200 hover:border-orange-300 overflow-hidden transition-all duration-300 hover:shadow-md">
                        <button @click="expandedFeature = expandedFeature === index ? null : index"
                            class="w-full p-5 text-left flex justify-between items-center hover:bg-slate-50 transition-colors">
                            <div>
                                <h4 class="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
                                    {{ feature.title }}</h4>
                            </div>
                            <i
                                :class="['fas fa-chevron-down transition-transform duration-300', expandedFeature === index ? 'rotate-180' : '']"></i>
                        </button>
                        <div v-if="expandedFeature === index" class="border-t border-slate-200 px-5 py-4 bg-slate-50">
                            <p class="text-slate-600 text-sm">{{ feature.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section class="py-20 md:py-28">
            <div class="max-w-[1200px] mx-auto px-6">
                <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Loved by creators everywhere</h2>
                </div>
                <div class="grid md:grid-cols-3 gap-8">
                    <div v-for="(testimonial, index) in testimonials" :key="index"
                        class="bg-white rounded-2xl p-8 border border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300">
                        <div class="flex gap-1 mb-4">
                            <i v-for="i in 5" :key="i" class="fas fa-star text-orange-500 text-sm"></i>
                        </div>
                        <p class="text-slate-600 mb-6 italic">{{ testimonial.quote }}</p>
                        <div class="flex items-center gap-3">
                            <div class="text-3xl">{{ testimonial.avatar }}</div>
                            <div>
                                <p class="font-semibold text-slate-900">{{ testimonial.name }}</p>
                                <p class="text-sm text-slate-600">{{ testimonial.role }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section id="pricing" class="py-20 md:py-28 bg-slate-50">
            <div class="max-w-[1200px] mx-auto px-6">
                <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
                    <p class="text-lg text-slate-600">Choose the plan that fits your needs</p>
                </div>

                <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div v-for="(plan, index) in pricing" :key="index" :class="['rounded-2xl p-8 border transition-all duration-300',
                        plan.popular
                            ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-white shadow-xl scale-105'
                            : 'border-slate-200 bg-white hover:border-orange-300']">
                        <div v-if="plan.popular"
                            class="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full mb-4">
                            Most Popular
                        </div>
                        <h3 class="text-2xl font-bold text-slate-900 mb-2">{{ plan.name }}</h3>
                        <p class="text-slate-600 text-sm mb-6">{{ plan.description }}</p>
                        <div class="mb-6">
                            <span class="text-4xl font-bold text-slate-900">{{ plan.price }}</span>
                            <span class="text-slate-600 text-sm">{{ plan.period }}</span>
                        </div>
                        <button
                            :class="['w-full py-3 rounded-lg font-semibold transition-all duration-200 mb-8',
                                plan.popular
                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:-translate-y-1'
                                    : 'border-2 border-slate-300 text-slate-700 hover:border-orange-300 hover:bg-slate-50']">
                            Get Started
                        </button>
                        <div class="space-y-3">
                            <div v-for="feature in plan.features" :key="feature"
                                class="flex gap-3 items-center text-sm">
                                <i class="fas fa-check text-green-500"></i>
                                <span class="text-slate-700">{{ feature }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="text-center mt-12">
                    <p class="text-slate-600 mb-3">Want to compare all features?</p>
                    <a href="#" class="text-orange-600 font-semibold hover:text-orange-700 transition-colors">View full
                        feature comparison →</a>
                </div>
            </div>
        </section>
        <section
            class="relative py-20 md:py-28 bg-gradient-to-r from-violet-600 via-blue-600 to-blue-500 overflow-hidden">
            <div class="absolute inset-0 opacity-10">
                <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" stroke-width="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid)" />
                </svg>
            </div>
            <div class="max-w-[1200px] mx-auto px-6 relative z-10">
                <div class="text-center space-y-8">
                    <h2 class="text-3xl md:text-5xl font-bold text-white">Ready to simplify your workflow?</h2>
                    <p class="text-xl text-blue-100 max-w-2xl mx-auto">Join 500+ creators who've already switched. Start
                        your 14-day free trial today.</p>

                    <div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <button @click="router.push('/signup')"
                            class="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                            Start Free Trial
                        </button>
                        <button
                            class="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                            Schedule a Demo
                        </button>
                    </div>
                    <div class="flex flex-col sm:flex-row justify-center gap-6 pt-8 border-t border-white/20">
                        <div class="flex items-center gap-2 text-white text-sm">
                            <i class="fas fa-shield-alt"></i>
                            <span>GDPR Compliant</span>
                        </div>
                        <div class="flex items-center gap-2 text-white text-sm">
                            <i class="fas fa-lock"></i>
                            <span>SSL Encrypted</span>
                        </div>
                        <div class="flex items-center gap-2 text-white text-sm">
                            <i class="fas fa-undo"></i>
                            <span>14-Day Money Back</span>
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
                            <!--<div
                                class="w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                R</div>-->
                            <div
                                class="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                <!--bg-gradient-to-br from-violet-600 to-blue-600-->
                                <img src="@/assets/new_new_logo.svg" alt="Reelmia.com logo">
                            </div>
                            <span class="text-lg font-bold text-white">Reelmia</span>
                        </div>
                        <p class="text-sm text-slate-400">Manage all your social media videos in one place.</p>
                    </div>
                    <div>
                        <h4 class="font-semibold text-white mb-4">Product</h4>
                        <ul class="space-y-2 text-sm">
                            <li><a href="#" class="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#" class="hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="#" class="hover:text-white transition-colors">Integrations</a></li>
                            <li><a href="#" class="hover:text-white transition-colors">Docs</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold text-white mb-4">Company</h4>
                        <ul class="space-y-2 text-sm">
                            <li><a href="#" class="hover:text-white transition-colors">About</a></li>
                            <li><a href="#" class="hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" class="hover:text-white transition-colors">Contact</a></li>
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
                <div
                    class="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
                    <p>&copy; 2025 Reelmia. All rights reserved.</p>
                    <div class="flex gap-4 mt-4 md:mt-0">
                        <a href="#" class="hover:text-white transition-colors"><i class="fab fa-twitter"></i></a>
                        <a href="#" class="hover:text-white transition-colors"><i class="fab fa-linkedin"></i></a>
                        <a href="#" class="hover:text-white transition-colors"><i class="fab fa-instagram"></i></a>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
@keyframes scroll {
    0% {
        transform: translateX(0);
    }

    100% {
        transform: translateX(-50%);
    }
}

.animate-scroll {
    animation: scroll 20s linear infinite;
}

html {
    scroll-behavior: smooth;
}
</style>
