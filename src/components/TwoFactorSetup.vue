<template>
    <div class="max-w-2xl mx-auto p-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Two-Factor Authentication (2FA)
        </h2>
        <div v-if="!twoFactorEnabled && !isSettingUp" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <div class="flex items-start">
                <div
                    class="flex-shrink-0 w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div class="ml-4 flex-1">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                        2FA is not enabled
                    </h3>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                </div>
            </div>
            <button @click="startSetup" :disabled="authStore.isLoading"
                class="w-full sm:w-auto px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <span v-if="authStore.isLoading">Setting up...</span>
                <span v-else>Enable 2FA</span>
            </button>
        </div>
        <div v-if="isSettingUp && !setupComplete" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                    Step 1: Scan QR Code
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <div v-if="qrCode" class="flex justify-center bg-white p-4 rounded-lg">
                    <img :src="qrCode" alt="QR Code" class="w-64 h-64" />
                </div>
                <div v-if="secret" class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Or enter this code manually:
                    </p>
                    <code class="text-sm font-mono text-gray-900 dark:text-white break-all">{{ secret }}</code>
                </div>
            </div>
            <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                    Step 2: Verify Code
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    Enter the 6-digit code from your authenticator app
                </p>
                <div class="flex gap-2">
                    <input v-model="verificationCode" type="text" maxlength="6" pattern="[0-9]*" inputmode="numeric"
                        placeholder="000000"
                        class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    <button @click="verifyAndEnable" :disabled="!verificationCode || verificationCode.length !== 6"
                        class="px-6 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        Verify
                    </button>
                </div>
                <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
            </div>
        </div>
        <div v-if="setupComplete && backupCodes.length > 0"
            class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <div class="flex items-start">
                <div
                    class="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div class="ml-4 flex-1">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                        2FA Enabled Successfully!
                    </h3>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Save these backup codes in a safe place. You can use them to access your account if you lose
                        access to your authenticator app.
                    </p>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <code v-for="code in backupCodes" :key="code"
                    class="text-sm font-mono text-gray-900 dark:text-white text-center py-1">
                    {{ code }}
                </code>
            </div>
            <div class="flex gap-2">
                <button @click="copyBackupCodes"
                    class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Copy Codes
                </button>
                <button @click="finishSetup"
                    class="flex-1 px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors">
                    Done
                </button>
            </div>
        </div>
        <div v-if="twoFactorEnabled && !isSettingUp" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <div class="flex items-start">
                <div
                    class="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <div class="ml-4 flex-1">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                        2FA is enabled
                    </h3>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Your account is protected with two-factor authentication.
                    </p>
                </div>
            </div>
            <button @click="showDisableConfirm = true"
                class="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Disable 2FA
            </button>
        </div>
        <div v-if="showDisableConfirm"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                    Disable Two-Factor Authentication
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    Enter your authenticator code or password to disable 2FA.
                </p>
                <input v-model="disableToken" type="text" placeholder="6-digit code or password"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
                <div class="flex gap-2">
                    <button @click="showDisableConfirm = false"
                        class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        Cancel
                    </button>
                    <button @click="confirmDisable" :disabled="!disableToken"
                        class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        Disable
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const twoFactorEnabled = ref(false)
const isSettingUp = ref(false)
const setupComplete = ref(false)
const qrCode = ref('')
const secret = ref('')
const verificationCode = ref('')
const backupCodes = ref<string[]>([])
const error = ref('')
const showDisableConfirm = ref(false)
const disableToken = ref('')

onMounted(async () => {
    try {
        const status = await authStore.get2FAStatus()
        twoFactorEnabled.value = status.enabled
    } catch (err) {
        console.error('Failed to get 2FA status:', err)
    }
})

const startSetup = async () => {
    try {
        error.value = ''
        const response = await authStore.setup2FA()
        qrCode.value = response.qrCode
        secret.value = response.secret
        isSettingUp.value = true
    } catch (err: any) {
        error.value = err.response?.data?.error || 'Failed to setup 2FA'
    }
}

const verifyAndEnable = async () => {
    try {
        error.value = ''
        const response = await authStore.enable2FA(verificationCode.value)
        backupCodes.value = response.backupCodes
        setupComplete.value = true
        twoFactorEnabled.value = true
    } catch (err: any) {
        error.value = err.response?.data?.error || 'Invalid code. Please try again.'
    }
}

const copyBackupCodes = () => {
    const codesText = backupCodes.value.join('\n')
    navigator.clipboard.writeText(codesText)
}

const finishSetup = () => {
    isSettingUp.value = false
    setupComplete.value = false
    backupCodes.value = []
    verificationCode.value = ''
}

const confirmDisable = async () => {
    try {
        error.value = ''
        const isToken = /^\d{6}$/.test(disableToken.value)

        if (isToken) {
            await authStore.disable2FA(disableToken.value)
        } else {
            await authStore.disable2FA(undefined, disableToken.value)
        }

        twoFactorEnabled.value = false
        showDisableConfirm.value = false
        disableToken.value = ''
    } catch (err: any) {
        error.value = err.response?.data?.error || 'Failed to disable 2FA'
    }
}
</script>
