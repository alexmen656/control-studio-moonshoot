<template>
    <div
        class="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-gray-800 dark:via-gray-900 dark:to-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div class="text-center">
                <!--<div class="flex justify-center">
                    <div
                        class="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg class="w-10 h-10 text-primary-600 dark:text-primary-400" fill="currentColor"
                            viewBox="0 0 20 20">
                            <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                            <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                            <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                        </svg>
                    </div>
                </div>-->
                <h2 class="mt-6 text-3xl font-extrabold dark:text-white">
                    Create your account
                </h2>
                <p class="mt-2 text-sm text-primary-100 dark:text-gray-300">
                    Get started with Control Studio
                </p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6">
                <div v-if="error"
                    class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                    {{ error }}
                </div>

                <div class="space-y-3">
                    <button :disabled="!isReady" @click="() => login()"
                        class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span
                            class="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                            Sign up with Google
                        </span>
                    </button>

                    <!--   <button
                        class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors group">
                        <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path fill="#00A4EF"
                                d="M0 0h11.377v11.372H0V0zm12.623 0H24v11.372H12.623V0zM0 12.623h11.377V24H0V12.623zm12.623 0H24V24H12.623V12.623z" />
                        </svg>
                        <span
                            class="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                            Sign up with Microsoft
                        </span>
                    </button>-->
                </div>
                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or sign up with
                            email</span>
                    </div>
                </div>
                <form class="space-y-4" :class="{ 'opacity-50 cursor-not-allowed': authStore.isLoading }"
                    @submit.prevent="register">
                    <div>
                        <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Full name
                        </label>
                        <input id="name" name="name" type="text" :disabled="authStore.isLoading"
                            class="appearance-none block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="John Doe" v-model="name">
                    </div>
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email address
                        </label>
                        <input id="email" name="email" type="email" required :disabled="authStore.isLoading"
                            class="appearance-none block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="you@example.com" v-model="email">
                    </div>
                    <div>
                        <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            User name
                        </label>
                        <input id="username" name="username" type="text" :disabled="authStore.isLoading"
                            class="appearance-none block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="john_doe" v-model="username">
                    </div>
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password
                        </label>
                        <input id="password" name="password" type="password" required :disabled="authStore.isLoading"
                            class="appearance-none block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="••••••••" v-model="password">
                    </div>
                    <div>
                        <label for="confirm-password"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Confirm password
                        </label>
                        <input id="confirm-password" name="confirm-password" type="password" required
                            :disabled="authStore.isLoading"
                            class="appearance-none block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="••••••••" v-model="confirmPassword">
                    </div>
                    <!--  <div class="flex items-start">
                        <div class="flex items-center h-5">
                            <input id="terms" name="terms" type="checkbox" v-model="termsAccepted" :disabled="isLoading"
                                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700">
                        </div>
                        <div class="ml-3 text-sm">
                            <label for="terms" class="text-gray-700 dark:text-gray-300">
                                I agree to the
                                <a href="#"
                                    class="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300">Terms
                                    of
                                    Service</a>
                                and
                                <a href="#"
                                    class="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300">Privacy
                                    Policy</a>
                            </label>
                        </div>
                    </div>-->
                    <button type="submit" :disabled="authStore.isLoading"
                        class="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium dark:text-white bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:bg-primary-400 dark:disabled:bg-primary-600 disabled:cursor-not-allowed">
                        <svg v-if="authStore.isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        {{ authStore.isLoading ? 'Creating account...' : 'Create account' }}
                    </button>
                </form>
                <div class="text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?
                        <router-link to="/login"
                            class="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300">
                            Sign in
                        </router-link>
                    </p>
                </div>
            </div>
        </div>
        <div v-if="showPasskeySetup"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
                <div class="text-center">
                    <div class="flex justify-center mb-4">
                        <div
                            class="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                            <svg class="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Set up Passkey
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        Use your device's biometrics (Face ID, Touch ID, Windows Hello) for faster and more secure
                        sign-ins.
                    </p>
                </div>
                <div class="space-y-3">
                    <button @click="setupPasskey"
                        class="w-full py-3 px-4 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors font-medium">
                        Set up Passkey
                    </button>
                    <button @click="skipPasskey"
                        class="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
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
//const termsAccepted = ref(false)
const error = ref<string | null>(null)
const showPasskeySetup = ref(false)

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