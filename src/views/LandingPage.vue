<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const features = [
    {
        icon: 'share-nodes',
        title: 'Multi-Platform Publishing',
        description: 'Publish your videos simultaneously on TikTok, Instagram, YouTube, Facebook, X, and Reddit.'
    },
    {
        icon: 'calendar',
        title: 'Smart Scheduling',
        description: 'Plan your content strategy in advance and let your posts publish automatically at the perfect time.'
    },
    {
        icon: 'chart-line',
        title: 'Performance Tracking',
        description: 'Track your video performance across all platforms in one clear dashboard.'
    },
    {
        icon: 'layer-group',
        title: 'Batch Uploads',
        description: 'Save time with batch uploads and manage multiple videos at once.'
    },
    {
        icon: 'folder-open',
        title: 'Content Library',
        description: 'Organize and search your entire video library in one central location.'
    },
    {
        icon: 'wand-magic-sparkles',
        title: 'Workflow Automation',
        description: 'Automate recurring tasks and focus on creative content.'
    }
]

const platforms = [
    { name: 'TikTok', icon: 'tiktok', color: '#000000' },
    { name: 'Instagram', icon: 'instagram', color: '#E4405F' },
    { name: 'YouTube', icon: 'youtube', color: '#FF0000' },
    { name: 'X', icon: 'x-twitter', color: '#000000' },
    { name: 'Facebook', icon: 'facebook', color: '#1877F2' },
    { name: 'Reddit', icon: 'reddit', color: '#FF4500' }
]


const otherProducts = [
    {
        name: 'Control Center',
        description: 'Central administration platform for all your digital solutions',
        url: 'https://control-center.eu'
    }
]

const stats = [
    { value: '6+', label: 'Platforms' },
    { value: '∞', label: 'Videos' },
    { value: '100%', label: 'Control' }
]

const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
}

const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
}

const showModal = ref(false)
const platformName = ref('')
const email = ref('')
const message = ref('')

const submitForm = () => {
    alert(`Thank you for requesting ${platformName.value}. We'll let you know when we add it!!`)
    showModal.value = false
    platformName.value = ''
    email.value = ''
    message.value = ''
}
</script>

<template>
    <div class="w-full min-h-screen bg-gray-100 overflow-x-hidden">
        <header class="sticky top-0 bg-slate-50/95 backdrop-blur-[10px] border-b border-black/10 z-[1000] py-3">
            <div class="max-w-[1280px] mx-auto px-8">
                <nav class="flex justify-between items-center gap-8">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-red-600 to-red-500 rounded-lg flex items-center justify-center text-xl">CS</div>
                        <span class="text-base font-semibold text-slate-900">Control Studio</span>
                    </div>
                    <div class="flex items-center gap-6">
                        <button @click="scrollToSection('product')" class="bg-transparent border-none text-slate-600 text-sm font-medium cursor-pointer transition-colors duration-200 py-2 hover:text-slate-900">Product</button>
                        <button @click="scrollToSection('features')" class="bg-transparent border-none text-slate-600 text-sm font-medium cursor-pointer transition-colors duration-200 py-2 hover:text-slate-900">Features</button>
                        <button @click="router.push('/login')" class="bg-transparent border-none text-slate-600 text-sm font-medium cursor-pointer transition-colors duration-200 py-2 hover:text-slate-900">Login</button>
                        <button @click="router.push('/signup')" class="bg-gradient-to-br from-red-600 to-red-500 text-white px-5 py-2.5 rounded-lg border-none font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(220,38,38,0.4)]">Start for free</button>
                    </div>
                </nav>
            </div>
        </header>
        
        <section id="product" class="py-24 pb-16 relative">
            <div class="max-w-[1280px] mx-auto px-8">
                <div class="text-center mb-16">
                    <h1 class="text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-[1.1] text-slate-900 mb-6 tracking-tight text-center">
                        Your Content.<br />
                        All Platforms.<br />
                        <span class="bg-gradient-to-r from-red-100 to-red-500 bg-clip-text text-transparent">One Dashboard.</span>
                    </h1>
                    <p class="text-xl leading-7 text-slate-600 max-w-2xl mx-auto mb-10">
                        Manage, schedule, and publish your social media videos across all major
                        platforms – all from a single dashboard.
                    </p>
                    <div class="flex gap-4 justify-center flex-wrap mb-16">
                        <button @click="router.push('/signup')" class="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold rounded-xl border-none cursor-pointer transition-all duration-200 bg-gradient-to-br from-red-600 to-red-800 text-white shadow-[0_4px_12px_rgba(220,38,38,0.3)] hover:-translate-y-0.5 hover:shadow-[0_9px_20px_rgba(220,38,38,0.3)]">
                            Start for free
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button>
                        <button @click="scrollToFeatures" class="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold rounded-xl border-none cursor-pointer transition-all duration-200 bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50">
                            Learn More
                        </button>
                    </div>
                    <div class="flex gap-16 justify-center flex-wrap">
                        <div v-for="stat in stats" :key="stat.label" class="text-center">
                            <div class="text-[2.5rem] font-extrabold bg-gradient-to-br from-red-600 to-red-500 bg-clip-text text-transparent mb-1">{{ stat.value }}</div>
                            <div class="text-sm text-slate-600 font-medium">{{ stat.label }}</div>
                        </div>
                    </div>
                </div>
                <div class="relative max-w-[900px] mx-auto">
                    <div class="text-center mb-8">
                        <h3 class="text-2xl font-bold text-slate-900 mb-2">Supported platforms</h3>
                        <p class="text-base text-slate-600">Publish to all your social media platforms. Don't see yours? <button @click="showModal = true" class="bg-transparent border-none p-0 font-inherit text-red-600 underline cursor-pointer transition-colors duration-200 hover:text-red-700">Let us know.</button></p>
                    </div>
                    <div class="flex overflow-hidden w-full relative">
                        <div class="flex gap-6 animate-scroll">
                            <div v-for="platform in platforms" :key="platform.name" class="w-[120px] text-red-600 h-20 flex justify-center items-center mx-4 transition-all duration-300">
                                <i :class="`fab fa-${platform.icon}`" class="text-[2.5rem]"></i>
                            </div>
                            <div v-for="platform in platforms" :key="platform.name + '-duplicate'" class="w-[120px] text-red-600 h-20 flex justify-center items-center mx-4 transition-all duration-300">
                                <i :class="`fab fa-${platform.icon}`" class="text-[2.5rem]"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <section id="features" class="py-24 bg-white">
            <div class="max-w-[1280px] mx-auto px-8">
                <div class="text-center mb-16">
                    <h2 class="text-[clamp(2rem,4vw,3rem)] font-extrabold text-slate-900 mb-4">Everything You Need</h2>
                    <p class="text-lg text-slate-600 max-w-2xl mx-auto">
                        Professional social media management that adapts to your needs
                    </p>
                </div>
                <div class="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-8">
                    <div v-for="feature in features" :key="feature.title" class="p-8 rounded-2xl bg-slate-50 transition-all duration-300 hover:bg-white hover:shadow-[0_4px_16px_rgba(220,38,38,0.1)] hover:-translate-y-0.5">
                        <div class="text-2xl text-white mb-5 w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center">
                            <i :class="`fas fa-${feature.icon}`"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-900 mb-3">{{ feature.title }}</h3>
                        <p class="text-base leading-relaxed text-slate-600">{{ feature.description }}</p>
                    </div>
                </div>
            </div>
        </section>
       
        <section id="cta" class="py-24 bg-gradient-to-r from-red-600 via-red-500 to-red-400 relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-[url('data:image/svg+xml,%3Csvg%20width=%2760%27%20height=%2760%27%20viewBox=%270%200%2060%2060%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27none%27%20fill-rule=%27evenodd%27%3E%3Cg%20fill=%27%23ffffff%27%20fill-opacity=%270.05%27%3E%3Cpath%20d=%27M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] before:opacity-40">
            <div class="max-w-[1280px] mx-auto px-8">
                <div class="text-center relative z-10">
                    <h2 class="text-[clamp(2rem,4vw,3rem)] font-extrabold text-white mb-4">Ready to Get Started?</h2>
                    <p class="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                        Start today and take your social media presence to the next level.
                    </p>
                    <div class="flex flex-col items-center gap-4">
                        <button @click="router.push('/signup')" class="inline-flex items-center gap-2 px-10 py-4.5 text-lg font-semibold rounded-xl border-none cursor-pointer transition-all duration-200 bg-gradient-to-br from-red-600 to-red-800 text-white shadow-[0_4px_12px_rgba(220,38,38,0.3)] hover:-translate-y-0.5 hover:shadow-[0_9px_20px_rgba(220,38,38,0.3)]">
                            Try Free Now
                        </button>
                        <p class="text-sm text-white/80">No credit card required</p>
                    </div>
                </div>
            </div>
        </section>
        <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] rounded-xl" @click="showModal = false">
            <div class="bg-white p-8 rounded-xl max-w-[400px] w-[90%] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)]" @click.stop>
                <h3 class="mb-2 text-slate-900">Request a platform</h3>
                <p class="mb-6 text-slate-600">Let us know what platform you want us to support.</p>
                <form @submit.prevent="submitForm">
                    <input v-model="platformName" type="text" placeholder="Platform name." required class="w-full p-3 border border-gray-300 text-slate-900 bg-white rounded-md mb-4 text-base">
                    <input v-model="email" type="text" placeholder="Email - so that we can get back to you." required class="w-full p-3 border border-gray-300 text-slate-900 bg-white rounded-md mb-4 text-base placeholder:text-slate-600">
                    <textarea v-model="message" placeholder="Any additional details (optional)" class="w-full p-3 border border-gray-300 text-slate-900 bg-white rounded-md mb-4 text-base resize-y min-h-[80px] placeholder:text-slate-600"></textarea>
                    <div class="flex gap-4 justify-end">
                        <button type="button" @click="showModal = false" class="bg-red-500 text-white border-none px-2 py-2 rounded-md cursor-pointer transition-colors duration-200">Cancel</button>
                        <button type="submit" class="bg-red-600 text-white border-none px-2 py-2 rounded-md cursor-pointer transition-colors duration-200">Submit Request</button>
                    </div>
                </form>
            </div>
        </div>
        <footer class="bg-slate-50 text-slate-900 py-16 pb-8">
            <div class="max-w-[1280px] mx-auto px-8">
                <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-12 pb-12 border-b border-black/10">
                    <div class="col-span-2">
                        <h3 class="text-2xl font-bold mb-3 text-slate-900">Control Studio</h3>
                        <p class="text-slate-600 text-sm mb-6">All SM platforms, one dashboard.</p>
                        <div class="flex flex-col gap-3 mt-6">
                            <div class="flex items-center gap-2 text-sm text-slate-600 p-2 rounded-md bg-black/5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" class="shrink-0">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                <span>SSL Secured</span>
                            </div>
                            <div class="flex items-center gap-2 text-sm text-slate-600 p-2 rounded-md bg-black/5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" class="shrink-0">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>GDPR Compliant</span>
                            </div>
                            <div class="flex items-center gap-2 text-sm bg-gradient-to-br from-red-600/15 to-red-500/15 text-red-500 font-semibold p-2 rounded-md border border-red-600/30">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" class="shrink-0 text-red-300">
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span>Made & hosted in Austria</span>
                            </div>
                        </div>
                    </div>

                    <div class="min-w-0">
                        <h4 class="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Product</h4>
                        <ul class="list-none flex flex-col gap-3">
                            <li><button @click="scrollToSection('features')" class="bg-transparent border-none text-slate-600 cursor-pointer text-sm transition-colors duration-200 text-left p-0 hover:text-slate-900">Features</button></li>
                            <li><button @click="router.push('/login')" class="bg-transparent border-none text-slate-600 cursor-pointer text-sm transition-colors duration-200 text-left p-0 hover:text-slate-900">Login</button></li>
                            <li><button @click="router.push('/signup')" class="bg-transparent border-none text-slate-600 cursor-pointer text-sm transition-colors duration-200 text-left p-0 hover:text-slate-900">Sign Up</button></li>
                        </ul>
                    </div>

                    <div class="min-w-0">
                        <h4 class="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Contact</h4>
                        <ul class="list-none flex flex-col gap-4">
                            <li class="flex items-start gap-3">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" class="shrink-0 mt-0.5 text-indigo-500">
                                    <path
                                        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                <a href="mailto:info@control-studio.eu" class="bg-transparent border-none text-slate-600 cursor-pointer text-sm transition-colors duration-200 no-underline hover:text-slate-900">info@control-studio.eu</a>
                            </li>
                            <li class="flex items-start gap-3">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" class="shrink-0 mt-0.5 text-indigo-500">
                                    <path
                                        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                <a href="tel:+4312345678" class="bg-transparent border-none text-slate-600 cursor-pointer text-sm transition-colors duration-200 no-underline hover:text-slate-900">+43 1 234 56 78</a>
                            </li>
                            <li class="flex items-start gap-3">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" class="shrink-0 mt-0.5 text-indigo-500">
                                    <path
                                        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                </svg>
                                <a href="https://wa.me/436641234567" class="bg-transparent border-none text-slate-600 cursor-pointer text-sm transition-colors duration-200 no-underline hover:text-slate-900">+43 664 123 45 67
                                    (WhatsApp)</a>
                            </li>
                            <li class="flex items-start gap-3">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" class="shrink-0 mt-0.5 text-indigo-500">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span class="text-slate-600 text-sm">123 Main Street<br />10010 Vienna, Austria</span>
                            </li>
                        </ul>
                    </div>
                    
                    <div class="min-w-0">
                        <h4 class="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Legal</h4>
                        <ul class="list-none flex flex-col gap-3">
                            <li><a href="#" class="bg-transparent border-none text-slate-600 cursor-pointer text-sm transition-colors duration-200 no-underline hover:text-slate-900">Imprint</a></li>
                            <li><a href="#" class="bg-transparent border-none text-slate-600 cursor-pointer text-sm transition-colors duration-200 no-underline hover:text-slate-900">Privacy Policy</a></li>
                            <li><a href="#" class="bg-transparent border-none text-slate-600 cursor-pointer text-sm transition-colors duration-200 no-underline hover:text-slate-900">Terms of Service</a></li>
                            <li><a href="#" class="bg-transparent border-none text-slate-600 cursor-pointer text-sm transition-colors duration-200 no-underline hover:text-slate-900">Cookie Settings</a></li>
                        </ul>
                    </div>
                </div>
                <div class="pt-8 flex justify-center items-center text-slate-600 text-sm">
                    <p>&copy; {{ new Date().getFullYear() }} Control Studio. All rights reserved.</p>
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

/* Responsive overrides for Tailwind */
@media (max-width: 1024px) {
    .nav-menu {
        gap: 1rem;
    }
}

@media (max-width: 768px) {
    nav {
        flex-direction: column;
        gap: 1rem;
    }

    .footer-grid {
        grid-template-columns: 1fr !important;
    }

    .col-span-2 {
        grid-column: span 1 !important;
    }
}
</style>
