<template>
    <div
        class="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-gray-800 dark:via-gray-900 dark:to-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div class="text-center">
                <!-- <div class="flex justify-center">
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
                    Welcome back
                </h2>
                <p class="mt-2 text-sm text-primary-100 dark:text-gray-300">
                    Sign in to your Control Cloud account
                </p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6">
                <div v-if="authStore.error"
                    class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                    {{ authStore.error }}
                </div>

                <div class="space-y-3">
                    <button :disabled="!isReady" @click="() => login()"
                        class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors group">
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
                            Continue with Google
                        </span>
                    </button>

                    <!--  <button
                        class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors group">
                        <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path fill="#00A4EF"
                                d="M0 0h11.377v11.372H0V0zm12.623 0H24v11.372H12.623V0zM0 12.623h11.377V24H0V12.623zm12.623 0H24V24H12.623V12.623z" />
                        </svg>
                        <span
                            class="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                            Continue with Microsoft
                        </span>
                    </button>-->
                </div>
                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with
                            email</span>
                    </div>
                </div>
                <form class="space-y-4" @submit.prevent="handleLogin">
                    <div>
                        <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email or Username
                        </label>
                        <input id="username" v-model="username" name="username" type="text" required
                            :disabled="authStore.isLoading"
                            class="appearance-none block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="your@email.com or username">
                    </div>
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password
                        </label>
                        <input id="password" v-model="password" name="password" type="password" required
                            :disabled="authStore.isLoading"
                            class="appearance-none block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="••••••••">
                    </div>
                    <!--<div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <input id="remember-me" v-model="rememberMe" name="remember-me" type="checkbox"
                                :disabled="authStore.isLoading"
                                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700">
                            <label for="remember-me" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                Remember me
                            </label>
                        </div>
                        <div class="text-sm">
                            <a href="#"
                                class="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300">
                                Forgot password?
                            </a>
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
                        {{ authStore.isLoading ? 'Signing in...' : 'Sign in' }}
                    </button>
                </form>
                <div class="text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account?
                        <router-link to="/signup"
                            class="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300">
                            Sign up
                        </router-link>
                    </p>
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

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
//const rememberMe = ref(false)

const handleOnSuccess = async (response: AuthCodeFlowSuccessResponse) => {
    console.log("Access Token: ", response.access_token);

    try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                'Authorization': `Bearer ${response.access_token}`
            }
        });

        if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json();
            console.log("User Info: ", userInfo);

            const success = await authStore.loginWithGoogle(
                userInfo.email,
                userInfo.name,
                userInfo.sub
            );

            if (success) {
                router.push('/');
            }
        } else {
            authStore.error = 'Failed to fetch user information from Google';
        }
    } catch (error) {
        console.error("Error fetching user info:", error);
        authStore.error = 'Google login failed. Please try again.';
    }
};

const handleOnError = (errorResponse: AuthCodeFlowErrorResponse) => {
    console.log("Error: ", errorResponse);
    authStore.error = 'Google login was cancelled or failed';
};

const { isReady, login } = useTokenClient({
    onSuccess: handleOnSuccess,
    onError: handleOnError,
    scope: 'email profile',
});

const handleLogin = async () => {
    const success = await authStore.login(username.value, password.value)

    if (success) {
        router.push('/')
    }
}
</script>