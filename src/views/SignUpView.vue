<template>
    <div class="min-h-screen bg-[#FAFAFA] flex">
        <div class="hidden lg:flex lg:w-[40%] bg-[#F5F3FF] py-12 px-12 relative overflow-y-auto">
            <div class="w-full max-w-md mx-auto flex flex-col justify-between min-h-full">
                <div>
                    <div class="mb-10">
                        <div class="flex items-center gap-3 mb-2">
                            <!-- <div
                                class="w-14 h-14 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                R
                            </div>-->

                            <div
                                class="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                <!--bg-gradient-to-br from-violet-600 to-blue-600-->
                                <img src="@/assets/new_new_logo.svg" alt="Reelmia.com logo">
                            </div>
                        </div>
                        <p class="text-sm text-slate-600">Social video management</p>
                    </div>
                    <h2 class="text-3xl font-bold text-slate-900 mb-8">
                        Everything you need
                    </h2>
                    <div class="space-y-4 mb-10">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-check text-white text-xs"></i>
                            </div>
                            <span class="text-base font-medium text-slate-700">Post to all platforms</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <div
                                class="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-check text-white text-xs"></i>
                            </div>
                            <span class="text-base font-medium text-slate-700">Smart scheduling</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <div
                                class="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-check text-white text-xs"></i>
                            </div>
                            <span class="text-base font-medium text-slate-700">Team collaboration</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <div
                                class="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-check text-white text-xs"></i>
                            </div>
                            <span class="text-base font-medium text-slate-700">No credit card</span>
                        </div>
                    </div>
                    <div class="mb-8">
                        <div
                            class="bg-white rounded-xl shadow-xl border border-slate-200/50 overflow-hidden w-full max-w-xs mx-auto">
                            <div
                                class="bg-gradient-to-r from-slate-900 to-slate-800 h-7 flex items-center px-3 gap-1.5">
                                <div class="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                <div class="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                <div class="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                            </div>
                            <div class="p-6 space-y-3">
                                <div class="flex gap-3 justify-center">
                                    <div class="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-lg"></div>
                                    <div class="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-600 rounded-lg"></div>
                                    <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg"></div>
                                </div>
                                <div class="space-y-2">
                                    <div class="h-2 bg-slate-200 rounded w-3/4 mx-auto"></div>
                                    <div class="h-2 bg-slate-200 rounded w-1/2 mx-auto"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-3 mt-auto">
                    <div class="flex -space-x-2">
                        <div
                            class="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 border-2 border-white">
                        </div>
                        <div
                            class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 border-2 border-white">
                        </div>
                        <div
                            class="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-400 border-2 border-white">
                        </div>
                    </div>
                    <span class="text-sm text-slate-600">
                        <span class="font-semibold text-slate-900">500+ creators</span> using Reelmia
                    </span>
                </div>
            </div>
        </div>
        <div class="w-full lg:w-[60%] flex flex-col bg-white overflow-y-auto">
            <div class="flex-1 flex items-center justify-center py-12 px-6 lg:px-16">
                <div class="w-full max-w-xl">
                    <div class="mb-20">
                        <button @click="router.push('/')"
                            class="text-[12px] text-slate-400 hover:text-slate-600 transition-colors">
                            <i class="fas fa-arrow-left mr-1"></i> Back to Home
                        </button>
                    </div>
                    <div class="lg:hidden flex items-center gap-2 mb-6">
                        <div
                            class="w-10 h-10 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            R
                        </div>
                        <span
                            class="text-lg font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Reelmia</span>
                    </div>
                    <h1 class="text-[28px] font-bold text-[#1F2937] mb-3 leading-tight">
                        Start Your Free Trial
                    </h1>
                    <div class="flex flex-wrap items-center gap-3 text-[13px] text-slate-600 mb-6">
                        <div class="flex items-center gap-1.5">
                            <i class="fas fa-check text-green-500 text-xs"></i>
                            <span>No credit card</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <i class="fas fa-check text-green-500 text-xs"></i>
                            <span>Cancel anytime</span>
                        </div>
                    </div>
                    <div class="mb-6">
                        <button :disabled="!isReady" @click="() => login()"
                            class="w-full h-12 flex items-center justify-center gap-3 border-2 border-slate-300 rounded-lg text-base text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            <svg class="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>Continue with Google</span>
                        </button>
                    </div>
                    <div class="relative mb-6">
                        <div class="absolute inset-0 flex items-center">
                            <div class="w-full border-t border-slate-200"></div>
                        </div>
                        <div class="relative flex justify-center text-sm">
                            <span class="px-4 bg-white text-slate-500">Or email</span>
                        </div>
                    </div>
                    <div v-if="error"
                        class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
                        <i class="fas fa-exclamation-circle mt-0.5"></i>
                        <span>{{ error }}</span>
                    </div>
                    <form @submit.prevent="register" class="space-y-5">
                        <div>
                            <label for="name" class="block text-sm font-semibold text-slate-700 mb-2">
                                Full Name
                            </label>
                            <div class="relative">
                                <input id="name" v-model="name" @blur="touchedFields.name = true" type="text"
                                    autocomplete="name" placeholder="John Doe" :disabled="authStore.isLoading" :class="[
                                        'w-full h-12 px-4 border-2 rounded-lg text-base transition-all',
                                        touchedFields.name && !name
                                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                            : name
                                                ? 'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                                                : 'border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20',
                                        authStore.isLoading && 'opacity-50 cursor-not-allowed'
                                    ]" />
                                <i v-if="name && !authStore.isLoading"
                                    class="fas fa-check absolute right-4 top-1/2 -translate-y-1/2 text-green-500"></i>
                            </div>
                        </div>
                        <div>
                            <label for="email" class="block text-sm font-semibold text-slate-700 mb-2">
                                Work Email
                            </label>
                            <div class="relative">
                                <input id="email" v-model="email" @blur="touchedFields.email = true" type="email"
                                    autocomplete="email" placeholder="you@company.com" required
                                    :disabled="authStore.isLoading" :class="[
                                        'w-full h-12 px-4 border-2 rounded-lg text-base transition-all',
                                        touchedFields.email && !email
                                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                            : email
                                                ? 'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                                                : 'border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20',
                                        authStore.isLoading && 'opacity-50 cursor-not-allowed'
                                    ]" />
                                <i v-if="email && !authStore.isLoading"
                                    class="fas fa-check absolute right-4 top-1/2 -translate-y-1/2 text-green-500"></i>
                            </div>
                            <p class="mt-2 text-xs text-slate-500">
                                We'll never spam you or share your email
                            </p>
                        </div>
                        <div>
                            <label for="password" class="block text-sm font-semibold text-slate-700 mb-2">
                                Password
                            </label>
                            <div class="relative">
                                <input id="password" v-model="password" @blur="touchedFields.password = true"
                                    :type="showPassword ? 'text' : 'password'" autocomplete="new-password"
                                    placeholder="Min. 8 characters" required :disabled="authStore.isLoading" :class="[
                                        'w-full h-12 px-4 pr-12 border-2 rounded-lg text-base transition-all',
                                        touchedFields.password && password.length < 8
                                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                            : 'border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20',
                                        authStore.isLoading && 'opacity-50 cursor-not-allowed'
                                    ]" />
                                <button type="button" @click="showPassword = !showPassword"
                                    class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    :disabled="authStore.isLoading">
                                    <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                </button>
                            </div>
                            <div v-if="password.length > 0" class="mt-3">
                                <div class="flex gap-1 mb-2">
                                    <div v-for="i in 4" :key="i" :class="[
                                        'h-1 flex-1 rounded-full transition-all',
                                        i <= passwordStrength.level ? passwordStrength.color : 'bg-slate-200'
                                    ]"></div>
                                </div>
                                <p class="text-xs text-slate-600">
                                    Strength: <span
                                        :class="passwordStrength.level >= 3 ? 'text-green-600 font-semibold' : 'text-orange-600'">{{
                                            passwordStrength.text }}</span>
                                </p>
                            </div>
                            <div v-if="touchedFields.password && password.length > 0 && password.length < 8"
                                class="mt-2 text-xs text-red-600">
                                Password must be at least 8 characters
                            </div>
                            <div v-if="password.length > 0" class="mt-3 space-y-1 text-xs text-slate-500">
                                <div class="flex items-center gap-2">
                                    <i :class="password.length >= 8 ? 'fas fa-check text-green-500' : 'fas fa-circle text-slate-300'"
                                        style="font-size: 8px"></i>
                                    <span>Min. 8 characters</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i :class="/\d/.test(password) ? 'fas fa-check text-green-500' : 'fas fa-circle text-slate-300'"
                                        style="font-size: 8px"></i>
                                    <span>At least 1 number</span>
                                </div>
                            </div>
                            <p class="mt-2 text-xs text-slate-500">
                                Your data is encrypted and secure
                            </p>
                        </div>
                        <div class="pt-2">
                            <label class="flex items-start gap-3 cursor-pointer">
                                <input v-model="termsAccepted" type="checkbox" :disabled="authStore.isLoading"
                                    class="w-4 h-4 mt-0.5 rounded border-2 border-slate-300 text-violet-600 focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" />
                                <span class="text-sm text-slate-600">
                                    I agree to the
                                    <a href="#" class="text-violet-600 underline hover:text-violet-700">Terms of
                                        Service</a>
                                    and
                                    <a href="#" class="text-violet-600 underline hover:text-violet-700">Privacy
                                        Policy</a>
                                </span>
                            </label>
                        </div>
                        <button type="submit" :disabled="authStore.isLoading" style="background: #FF6B35;"
                            class="w-full h-14 text-white text-lg font-bold rounded-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                            <span v-if="!authStore.isLoading">Start Free Trial</span>
                            <span v-else class="flex items-center justify-center gap-2">
                                <i class="fas fa-spinner fa-spin"></i>
                                Creating your account...
                            </span>
                        </button>
                    </form>
                    <p class="mt-6 text-center text-sm text-slate-600">
                        Already have an account?
                        <button @click="router.push('/login')"
                            class="text-violet-600 font-semibold hover:text-violet-700 transition-colors">
                            Log in
                        </button>
                    </p>
                </div>
            </div>
        </div>
        <div v-if="showPasskeySetup" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
                <div class="text-center">
                    <div class="flex justify-center mb-4">
                        <div class="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-key text-2xl text-violet-600"></i>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold text-slate-900 mb-2">
                        Set up Passkey
                    </h3>
                    <p class="text-sm text-slate-600">
                        Use your device's biometrics (Face ID, Touch ID, Windows Hello) for faster and more secure
                        sign-ins.
                    </p>
                </div>
                <div class="space-y-3">
                    <button @click="setupPasskey"
                        class="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-semibold">
                        Set up Passkey
                    </button>
                    <button @click="skipPasskey"
                        class="w-full py-3 px-4 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                        Skip for now
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
    useTokenClient,
    type AuthCodeFlowSuccessResponse,
    type AuthCodeFlowErrorResponse,
} from "vue3-google-signin";
import { startRegistration } from '@simplewebauthn/browser'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const termsAccepted = ref(false)
const showPassword = ref(false)
const error = ref<string | null>(null)
const showPasskeySetup = ref(false)
const touchedFields = ref<Record<string, boolean>>({})

const passwordStrength = computed(() => {
    const pwd = password.value
    if (!pwd) return { level: 0, text: '', color: '' }

    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++

    if (strength <= 1) return { level: 1, text: 'Weak', color: 'bg-red-500' }
    if (strength === 2) return { level: 2, text: 'Medium', color: 'bg-orange-500' }
    if (strength === 3) return { level: 3, text: 'Good', color: 'bg-yellow-500' }
    return { level: 4, text: 'Strong', color: 'bg-green-500' }
})

const handleOnSuccess = async (response: AuthCodeFlowSuccessResponse) => {
    console.log("Access Token: ", response.access_token);
    error.value = null;

    try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                'Authorization': `Bearer ${response.access_token}`
            }
        });

        if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json();
            console.log("User Info: ", userInfo);

            name.value = userInfo.name || '';
            email.value = userInfo.email || '';

            const success = await authStore.loginWithGoogle(
                userInfo.email,
                userInfo.name,
                userInfo.sub
            );

            if (success) {
                router.push('/onboarding');
            } else {
                error.value = 'Google sign up failed. Please try again.';
            }
        } else {
            error.value = 'Failed to fetch user information from Google';
        }
    } catch (err) {
        console.error("Error fetching user info:", err);
        error.value = 'Google sign up failed. Please try again.';
    }
};

const handleOnError = (errorResponse: AuthCodeFlowErrorResponse) => {
    console.log("Error: ", errorResponse);
    error.value = 'Google sign up was cancelled or failed';
};

const { isReady, login } = useTokenClient({
    onSuccess: handleOnSuccess,
    onError: handleOnError,
    scope: 'email profile',
});

const register = async () => {
    error.value = null;

    if (password.value.length < 8) {
        error.value = 'Password must be at least 8 characters long';
        return;
    }

    const generatedUsername = email.value.split('@')[0] || 'user';

    const success = await authStore.register(
        email.value,
        generatedUsername,
        password.value,
        name.value || undefined
    );

    if (success) {
        showPasskeySetup.value = true;
    } else {
        error.value = authStore.error || 'Registration failed';
    }
}

const setupPasskey = async () => {
    try {
        const options = await authStore.getPasskeyRegistrationOptions()
        const attResp = await startRegistration(options)
        const deviceName = prompt('Enter a name for this device (optional):') || undefined
        await authStore.verifyPasskeyRegistration(attResp, deviceName)

        window.dispatchEvent(new Event('auth-change'))
        router.push('/onboarding')
    } catch (err: any) {
        console.error('Passkey registration error:', err)
        window.dispatchEvent(new Event('auth-change'))
        router.push('/onboarding')
    }
}

const skipPasskey = () => {
    window.dispatchEvent(new Event('auth-change'))
    router.push('/onboarding')
}
</script>