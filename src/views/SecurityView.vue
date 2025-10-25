<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AppHeader />
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Security Settings</h1>
                <p class="mt-2 text-gray-600 dark:text-gray-400">
                    Manage your account security and authentication methods
                </p>
            </div>
            <div class="space-y-6">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                            Two-Factor Authentication
                        </h2>
                    </div>
                    <div class="p-6">
                        <TwoFactorSetup />
                    </div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                            Passkeys
                        </h2>
                    </div>
                    <div class="p-6">
                        <PasskeyManagement />
                    </div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                            Change Password
                        </h2>
                    </div>
                    <div class="p-6">
                        <form @submit.prevent="changePassword" class="max-w-md space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Current Password
                                </label>
                                <input v-model="currentPassword" type="password" required
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    New Password
                                </label>
                                <input v-model="newPassword" type="password" required minlength="6"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Confirm New Password
                                </label>
                                <input v-model="confirmNewPassword" type="password" required
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                            </div>
                            <p v-if="passwordError" class="text-sm text-red-600 dark:text-red-400">{{ passwordError }}
                            </p>
                            <p v-if="passwordSuccess" class="text-sm text-green-600 dark:text-green-400">{{
                                passwordSuccess }}</p>
                            <button type="submit"
                                class="px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors">
                                Change Password
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import TwoFactorSetup from '@/components/TwoFactorSetup.vue'
import PasskeyManagement from '@/components/PasskeyManagement.vue'

const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')

const changePassword = async () => {
    // Change password comming soon (hopefully)
    passwordError.value = ''
    passwordSuccess.value = ''

    if (newPassword.value !== confirmNewPassword.value) {
        passwordError.value = 'Passwords do not match'
        return
    }

    if (newPassword.value.length < 6) {
        passwordError.value = 'Password must be at least 6 characters long'
        return
    }

    passwordSuccess.value = 'Password changed successfully'
    currentPassword.value = ''
    newPassword.value = ''
    confirmNewPassword.value = ''
}
</script>
