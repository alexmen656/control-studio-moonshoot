<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const currentStep = ref(1)
const totalSteps = 3

const selectedPlatforms = ref<string[]>([])
const platforms = [
    {
        id: 'tiktok',
        name: 'TikTok',
        icon: 'fab fa-tiktok',
        color: 'from-black to-gray-800',
        description: 'Short-form video content'
    },
    {
        id: 'instagram',
        name: 'Instagram',
        icon: 'fab fa-instagram',
        color: 'from-pink-500 to-purple-600',
        description: 'Reels & Stories'
    },
    {
        id: 'youtube',
        name: 'YouTube',
        icon: 'fab fa-youtube',
        color: 'from-violet-600 to-violet-700',
        description: 'Shorts & Videos'
    },
    {
        id: 'facebook',
        name: 'Facebook',
        icon: 'fab fa-facebook',
        color: 'from-blue-600 to-blue-700',
        description: 'Video posts'
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: 'fab fa-linkedin',
        color: 'from-blue-700 to-blue-800',
        description: 'Professional content'
    },
    {
        id: 'twitter',
        name: 'X (Twitter)',
        icon: 'fab fa-x-twitter',
        color: 'from-black to-gray-900',
        description: 'Short videos'
    }
]

const accountType = ref('')
const accountTypes = [
    {
        id: 'creator',
        name: 'Content Creator',
        icon: 'fas fa-user-circle',
        description: 'Solo creator managing your own content'
    },
    {
        id: 'team',
        name: 'Team / Agency',
        icon: 'fas fa-users',
        description: 'Multiple people collaborating on content'
    },
    {
        id: 'business',
        name: 'Business',
        icon: 'fas fa-building',
        description: 'Brand or company managing social presence'
    }
]

const selectedGoals = ref<string[]>([])
const goals = [
    { id: 'save-time', name: 'Save Time', icon: 'fas fa-clock' },
    { id: 'grow-audience', name: 'Grow Audience', icon: 'fas fa-chart-line' },
    { id: 'consistency', name: 'Post Consistently', icon: 'fas fa-calendar-check' },
    { id: 'analytics', name: 'Better Analytics', icon: 'fas fa-chart-bar' },
    { id: 'collaboration', name: 'Team Collaboration', icon: 'fas fa-users-cog' },
    { id: 'automation', name: 'Automate Posting', icon: 'fas fa-robot' }
]

const progressPercentage = computed(() => {
    return (currentStep.value / totalSteps) * 100
})

const canProceed = computed(() => {
    if (currentStep.value === 1) return selectedPlatforms.value.length > 0
    if (currentStep.value === 2) return accountType.value !== ''
    if (currentStep.value === 3) return selectedGoals.value.length > 0
    return false
})

const togglePlatform = (platformId: string) => {
    const index = selectedPlatforms.value.indexOf(platformId)
    if (index === -1) {
        selectedPlatforms.value.push(platformId)
    } else {
        selectedPlatforms.value.splice(index, 1)
    }
}

const toggleGoal = (goalId: string) => {
    const index = selectedGoals.value.indexOf(goalId)
    if (index === -1) {
        selectedGoals.value.push(goalId)
    } else {
        selectedGoals.value.splice(index, 1)
    }
}

const nextStep = () => {
    if (canProceed.value && currentStep.value < totalSteps) {
        currentStep.value++
    }
}

const prevStep = () => {
    if (currentStep.value > 1) {
        currentStep.value--
    }
}

const skip = () => {
    router.push('/home')
}

const complete = async () => {
    const onboardingData = {
        platforms: selectedPlatforms.value,
        accountType: accountType.value,
        goals: selectedGoals.value
    }
    
    console.log('Onboarding completed:', onboardingData)
    
    if (window.gtag) {
        window.gtag('event', 'onboarding_complete', {
            platforms: selectedPlatforms.value.length,
            account_type: accountType.value,
            goals: selectedGoals.value.length
        })
    }
    
    router.push({ name: 'home', query: { welcome: '1' } })
}
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-slate-50 flex items-center justify-center px-4 py-8">
        <div class="w-full max-w-4xl">
            <div class="text-center mb-8">
                <div class="flex items-center justify-center gap-2 mb-6">
                    <div class="w-10 h-10 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        R
                    </div>
                    <span class="text-xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Reelmia</span>
                </div>
                <h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                    Let's get you set up
                </h1>
                <p class="text-slate-600">
                    This will only take a minute
                </p>
            </div>
            <div class="mb-12">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-slate-700">Step {{ currentStep }} of {{ totalSteps }}</span>
                    <button @click="skip" class="text-sm text-slate-500 hover:text-slate-700 transition-colors">
                        Skip for now →
                    </button>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                        class="bg-gradient-to-r from-violet-600 to-blue-600 h-full transition-all duration-500 ease-out"
                        :style="{ width: `${progressPercentage}%` }"
                    ></div>
                </div>
            </div>
            <div class="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-12 mb-6">
                <div v-if="currentStep === 1" class="space-y-6">
                    <div class="text-center mb-8">
                        <div class="w-16 h-16 bg-gradient-to-br from-violet-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-share-alt text-2xl text-violet-600"></i>
                        </div>
                        <h2 class="text-2xl font-bold text-slate-900 mb-2">
                            Which platforms do you use?
                        </h2>
                        <p class="text-slate-600">
                            Select all that apply. You can add more later.
                        </p>
                    </div>
                    <div class="grid md:grid-cols-3 gap-4">
                        <button
                            v-for="platform in platforms"
                            :key="platform.id"
                            @click="togglePlatform(platform.id)"
                            :class="[
                                'p-6 rounded-xl border-2 transition-all duration-200 text-left',
                                selectedPlatforms.includes(platform.id)
                                    ? 'border-violet-500 bg-violet-50 shadow-md scale-105'
                                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                            ]"
                        >
                            <div class="flex items-start justify-between mb-3">
                                <div :class="`w-12 h-12 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center text-white text-xl`">
                                    <i :class="platform.icon"></i>
                                </div>
                                <div v-if="selectedPlatforms.includes(platform.id)" class="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center">
                                    <i class="fas fa-check text-white text-xs"></i>
                                </div>
                            </div>
                            <h3 class="font-semibold text-slate-900 mb-1">{{ platform.name }}</h3>
                            <p class="text-sm text-slate-600">{{ platform.description }}</p>
                        </button>
                    </div>
                    <p class="text-center text-sm text-slate-500 mt-6">
                        Selected {{ selectedPlatforms.length }} platform{{ selectedPlatforms.length !== 1 ? 's' : '' }}
                    </p>
                </div>
                <div v-if="currentStep === 2" class="space-y-6">
                    <div class="text-center mb-8">
                        <div class="w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-user-check text-2xl text-orange-600"></i>
                        </div>
                        <h2 class="text-2xl font-bold text-slate-900 mb-2">
                            How will you use Reelmia?
                        </h2>
                        <p class="text-slate-600">
                            This helps us customize your experience
                        </p>
                    </div>
                    <div class="space-y-4 max-w-2xl mx-auto">
                        <button
                            v-for="type in accountTypes"
                            :key="type.id"
                            @click="accountType = type.id"
                            :class="[
                                'w-full p-6 rounded-xl border-2 transition-all duration-200 flex items-center gap-6',
                                accountType === type.id
                                    ? 'border-violet-500 bg-violet-50 shadow-md'
                                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                            ]"
                        >
                            <div class="w-14 h-14 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-2xl flex-shrink-0">
                                <i :class="type.icon"></i>
                            </div>
                            <div class="text-left flex-1">
                                <h3 class="font-semibold text-slate-900 mb-1">{{ type.name }}</h3>
                                <p class="text-sm text-slate-600">{{ type.description }}</p>
                            </div>
                            <div v-if="accountType === type.id" class="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-check text-white text-xs"></i>
                            </div>
                        </button>
                    </div>
                </div>
                <div v-if="currentStep === 3" class="space-y-6">
                    <div class="text-center mb-8">
                        <div class="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-bullseye text-2xl text-green-600"></i>
                        </div>
                        <h2 class="text-2xl font-bold text-slate-900 mb-2">
                            What are your goals?
                        </h2>
                        <p class="text-slate-600">
                            Select all that matter to you
                        </p>
                    </div>
                    <div class="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                        <button
                            v-for="goal in goals"
                            :key="goal.id"
                            @click="toggleGoal(goal.id)"
                            :class="[
                                'p-6 rounded-xl border-2 transition-all duration-200',
                                selectedGoals.includes(goal.id)
                                    ? 'border-violet-500 bg-violet-50 shadow-md scale-105'
                                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                            ]"
                        >
                            <div class="flex flex-col items-center text-center gap-3">
                                <div :class="[
                                    'w-12 h-12 rounded-full flex items-center justify-center text-xl',
                                    selectedGoals.includes(goal.id)
                                        ? 'bg-violet-600 text-white'
                                        : 'bg-slate-100 text-slate-600'
                                ]">
                                    <i :class="goal.icon"></i>
                                </div>
                                <h3 class="font-semibold text-slate-900">{{ goal.name }}</h3>
                            </div>
                        </button>
                    </div>
                    <p class="text-center text-sm text-slate-500 mt-6">
                        Selected {{ selectedGoals.length }} goal{{ selectedGoals.length !== 1 ? 's' : '' }}
                    </p>
                </div>
            </div>
            <div class="flex items-center justify-between gap-4">
                <button
                    v-if="currentStep > 1"
                    @click="prevStep"
                    class="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                >
                    <i class="fas fa-arrow-left mr-2"></i>
                    Back
                </button>
                <div v-else></div>
                <button
                    v-if="currentStep < totalSteps"
                    @click="nextStep"
                    :disabled="!canProceed"
                    class="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    Continue
                    <i class="fas fa-arrow-right ml-2"></i>
                </button>
                <button
                    v-else
                    @click="complete"
                    :disabled="!canProceed"
                    class="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    <i class="fas fa-check mr-2"></i>
                    Get Started
                </button>
            </div>
            <p class="text-center mt-6 text-sm text-slate-500">
                You can change these settings anytime in your account preferences
            </p>
        </div>
    </div>
</template>

<style scoped>
* {
    transition-property: transform, opacity, background-color, border-color, box-shadow;
    transition-timing-function: ease-out;
}
</style>
