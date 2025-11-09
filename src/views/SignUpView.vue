<template>
    <div class="min-h-screen bg-white flex">
        <div class="w-full lg:w-1/2 flex flex-col">
            <header class="p-6 lg:p-8">
                <button @click="router.push('/')"
                    class="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                    <i class="fas fa-arrow-left"></i>
                    <span class="text-sm font-medium">Back to Home</span>
                </button>
            </header>
            <div class="flex-1 flex items-center justify-center px-6 lg:px-16 py-12">
                <div class="w-full max-w-md">
                    <div class="lg:hidden flex items-center gap-2 mb-8">
                        <div
                            class="w-10 h-10 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            R
                        </div>
                        <span
                            class="text-xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Reelmia</span>
                    </div>
                    <div class="mb-8">
                        <h1 class="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
                            Start Your Free 14-Day Trial
                        </h1>
                        <div class="flex flex-col gap-2 text-sm text-slate-600">
                            <div class="flex items-center gap-2">
                                <i class="fas fa-check text-green-500"></i>
                                <span>No credit card required</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <i class="fas fa-check text-green-500"></i>
                                <span>Cancel anytime</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <i class="fas fa-check text-green-500"></i>
                                <span>Full access to all features</span>
                            </div>
                        </div>
                    </div>
                    <div class="space-y-3 mb-6">
                        <button :disabled="!isReady" @click="() => login()"
                            class="w-full h-12 flex items-center justify-center gap-3 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
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
                            <span class="px-4 bg-white text-slate-500">Or sign up with email</span>
                        </div>
                    </div>
                    <div v-if="error"
                        class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
                        <i class="fas fa-exclamation-circle mt-0.5"></i>
                        <span>{{ error }}</span>
                    </div>
                    <form @submit.prevent="register" class="space-y-5">
                        <div>
                            <label for="name" class="block text-sm font-semibold text-slate-700 mb-1.5">
                                Full Name
                            </label>
                            <div class="relative">
                                <input id="name" v-model="name" @blur="touchedFields.name = true" type="text"
                                    autocomplete="name" placeholder="John Doe" :disabled="authStore.isLoading" :class="[
                                        'w-full h-12 px-4 border rounded-lg text-base transition-all',
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
                            <label for="email" class="block text-sm font-semibold text-slate-700 mb-1.5">
                                Work Email
                            </label>
                            <div class="relative">
                                <input id="email" v-model="email" @blur="touchedFields.email = true" type="email"
                                    autocomplete="email" placeholder="you@company.com" required
                                    :disabled="authStore.isLoading" :class="[
                                        'w-full h-12 px-4 border rounded-lg text-base transition-all',
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
                            <p class="mt-1.5 text-xs text-slate-500">
                                We'll never spam you or share your email
                            </p>
                        </div>
                        <div>
                            <label for="username" class="block text-sm font-semibold text-slate-700 mb-1.5">
                                Username
                            </label>
                            <input id="username" v-model="username" type="text" autocomplete="username"
                                placeholder="john_doe" :disabled="authStore.isLoading"
                                class="w-full h-12 px-4 border border-slate-300 rounded-lg text-base focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
                        </div>
                        <div>
                            <label for="password" class="block text-sm font-semibold text-slate-700 mb-1.5">
                                Password
                            </label>
                            <div class="relative">
                                <input id="password" v-model="password" @blur="touchedFields.password = true"
                                    :type="showPassword ? 'text' : 'password'" autocomplete="new-password"
                                    placeholder="Min. 8 characters" required :disabled="authStore.isLoading" :class="[
                                        'w-full h-12 px-4 pr-10 border rounded-lg text-base transition-all',
                                        touchedFields.password && password.length < 6
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

                            <div v-if="touchedFields.password && password.length < 6"
                                class="mt-1.5 text-sm text-red-600">
                                Password must be at least 6 characters
                            </div>
                            <div v-else class="mt-2 space-y-1 text-xs text-slate-500">
                                <div class="flex items-center gap-2">
                                    <i :class="password.length >= 6 ? 'fas fa-check text-green-500' : 'fas fa-circle text-slate-300'"
                                        style="font-size: 6px"></i>
                                    <span>Min. 6 characters</span>
                                </div>
                            </div>
                            <p class="mt-1.5 text-xs text-slate-500">
                                Your data is encrypted and secure
                            </p>
                        </div>
                        <div>
                            <label for="confirm-password" class="block text-sm font-semibold text-slate-700 mb-1.5">
                                Confirm Password
                            </label>
                            <input id="confirm-password" v-model="confirmPassword"
                                @blur="touchedFields.confirmPassword = true" :type="showPassword ? 'text' : 'password'"
                                autocomplete="new-password" placeholder="Confirm your password" required
                                :disabled="authStore.isLoading" :class="[
                                    'w-full h-12 px-4 border rounded-lg text-base transition-all',
                                    touchedFields.confirmPassword && password !== confirmPassword
                                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                        : 'border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20',
                                    authStore.isLoading && 'opacity-50 cursor-not-allowed'
                                ]" />
                            <p v-if="touchedFields.confirmPassword && password !== confirmPassword"
                                class="mt-1.5 text-sm text-red-600">
                                Passwords do not match
                            </p>
                        </div>
                        <div>
                            <label class="flex items-start gap-3 cursor-pointer">
                                <input v-model="termsAccepted" type="checkbox" :disabled="authStore.isLoading"
                                    class="w-5 h-5 mt-0.5 rounded border-2 border-slate-300 text-violet-600 focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" />
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
                        <button type="submit" :disabled="authStore.isLoading"
                            class="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg font-semibold rounded-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                            <span v-if="!authStore.isLoading">Start Free Trial</span>
                            <span v-else class="flex items-center justify-center gap-2">
                                <i class="fas fa-spinner fa-spin"></i>
                                Creating your account...
                            </span>
                        </button>

                        <p class="text-center text-xs text-slate-500">
                            By signing up, you'll get instant access to all features
                        </p>
                    </form>
                    <div class="mt-8 flex flex-wrap justify-center gap-6 text-xs text-slate-500">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-lock"></i>
                            <span>256-bit SSL Encryption</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="fas fa-check-circle"></i>
                            <span>GDPR Compliant</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="fas fa-bolt"></i>
                            <span>Instant Setup</span>
                        </div>
                    </div>
                    <p class="mt-8 text-center text-sm text-slate-600">
                        Already have an account?
                        <button @click="router.push('/login')"
                            class="text-violet-600 font-semibold hover:text-violet-700 transition-colors">
                            Log in
                        </button>
                    </p>
                </div>
            </div>
        </div>
        <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-50 via-blue-50 to-slate-50 p-16">
            <div class="w-full max-w-lg mx-auto flex flex-col justify-center">
                <div class="flex items-center gap-2 mb-12">
                    <div
                        class="w-10 h-10 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        R
                    </div>
                    <span
                        class="text-xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Reelmia</span>
                </div>
                <h2 class="text-3xl font-bold text-slate-900 mb-8">
                    Everything you need to manage social videos
                </h2>
                <div class="space-y-6 mb-12">
                    <div class="flex gap-4">
                        <div
                            class="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-check text-white"></i>
                        </div>
                        <div>
                            <h3 class="text-base font-semibold text-slate-900 mb-1">
                                Upload once, post everywhere
                            </h3>
                            <p class="text-sm text-slate-600">
                                Schedule to TikTok, Instagram Reels, YouTube Shorts from one dashboard
                            </p>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <div
                            class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-check text-white"></i>
                        </div>
                        <div>
                            <h3 class="text-base font-semibold text-slate-900 mb-1">
                                Smart scheduling that works
                            </h3>
                            <p class="text-sm text-slate-600">
                                AI-powered best time suggestions and automated posting
                            </p>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <div
                            class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-check text-white"></i>
                        </div>
                        <div>
                            <h3 class="text-base font-semibold text-slate-900 mb-1">
                                Analytics that make sense
                            </h3>
                            <p class="text-sm text-slate-600">
                                Track performance across all platforms in real-time
                            </p>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <div
                            class="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-check text-white"></i>
                        </div>
                        <div>
                            <h3 class="text-base font-semibold text-slate-900 mb-1">
                                Collaborate with your team
                            </h3>
                            <p class="text-sm text-slate-600">
                                Role-based permissions and seamless workflow management
                            </p>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <div
                            class="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-check text-white"></i>
                        </div>
                        <div>
                            <h3 class="text-base font-semibold text-slate-900 mb-1">
                                No credit card required
                            </h3>
                            <p class="text-sm text-slate-600">
                                Full access to all features for 14 days, absolutely free
                            </p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-2xl p-6 shadow-xl border border-slate-200/50">
                    <div
                        class="bg-gradient-to-r from-slate-900 to-slate-800 h-8 flex items-center px-4 gap-2 rounded-t-lg -mt-6 -mx-6 mb-4">
                        <div class="w-3 h-3 rounded-full bg-red-500"></div>
                        <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div class="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div class="space-y-3">
                        <div class="flex gap-2">
                            <div class="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-lg"></div>
                            <div class="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-600 rounded-lg"></div>
                            <div class="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg"></div>
                        </div>
                        <div class="space-y-2">
                            <div class="h-2.5 bg-slate-200 rounded w-3/4"></div>
                            <div class="h-2.5 bg-slate-200 rounded w-1/2"></div>
                        </div>
                        <div class="flex gap-3 pt-2">
                            <i class="fab fa-tiktok text-lg text-slate-600"></i>
                            <i class="fab fa-instagram text-lg text-slate-600"></i>
                            <i class="fab fa-youtube text-lg text-slate-600"></i>
                            <i class="fab fa-facebook text-lg text-slate-600"></i>
                        </div>
                    </div>
                </div>
                <div class="mt-8 flex items-center gap-4">
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
                        <div
                            class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white">
                        </div>
                    </div>
                    <div>
                        <div class="flex gap-0.5 mb-1">
                            <i v-for="i in 5" :key="i" class="fas fa-star text-orange-500 text-xs"></i>
                        </div>
                        <p class="text-sm text-slate-600">
                            <span class="font-semibold text-slate-900">500+ creators</span> already using Reelmia
                        </p>
                    </div>
                </div>
                <div class="mt-6 p-4 bg-white rounded-xl border border-slate-200">
                    <p class="text-sm text-slate-600 italic mb-3">
                        "Reelmia cut my posting time from 2 hours to 15 minutes per week."
                    </p>
                    <div class="flex items-center gap-3">
                        <div class="text-2xl">👩‍💼</div>
                        <div>
                            <p class="text-sm font-semibold text-slate-900">Sarah Chen</p>
                            <p class="text-xs text-slate-600">Content Creator</p>
                        </div>
                    </div>
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
import { ref } from 'vue'
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
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const termsAccepted = ref(false)
const showPassword = ref(false)
const error = ref<string | null>(null)
const showPasskeySetup = ref(false)
const touchedFields = ref<Record<string, boolean>>({})

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
                router.push('/home');
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

    if (password.value !== confirmPassword.value) {
        error.value = 'Passwords do not match';
        return;
    }

    if (password.value.length < 6) {
        error.value = 'Password must be at least 6 characters long';
        return;
    }

    const success = await authStore.register(
        email.value,
        username.value,
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
        router.push('/home')
    } catch (err: any) {
        console.error('Passkey registration error:', err)
        window.dispatchEvent(new Event('auth-change'))
        router.push('/home')
    }
}

const skipPasskey = () => {
    window.dispatchEvent(new Event('auth-change'))
    router.push('/home')
}
</script>