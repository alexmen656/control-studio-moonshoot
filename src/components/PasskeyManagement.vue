<template>
    <div class="max-w-2xl mx-auto p-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Passkeys
        </h2>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Passkeys provide passwordless authentication using your device's biometrics (Face ID, Touch ID,
                    Windows Hello) or security keys.
                </p>
                <button @click="registerPasskey" :disabled="isRegistering"
                    class="px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <span v-if="isRegistering">Registering...</span>
                    <span v-else>Add Passkey</span>
                </button>
                <p v-if="error" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
                <p v-if="success" class="mt-2 text-sm text-green-600 dark:text-green-400">{{ success }}</p>
            </div>
            <div v-if="passkeys.length > 0" class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                    Your Passkeys
                </h3>
                <div class="space-y-2">
                    <div v-for="passkey in passkeys" :key="passkey.id"
                        class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div class="flex-1">
                            <p class="font-medium text-gray-900 dark:text-white">
                                {{ passkey.deviceName || 'Unnamed Device' }}
                            </p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                Added {{ formatDate(passkey.createdAt) }}
                            </p>
                            <p v-if="passkey.lastUsedAt" class="text-xs text-gray-500 dark:text-gray-500">
                                Last used {{ formatDate(passkey.lastUsedAt) }}
                            </p>
                        </div>
                        <div class="flex gap-2">
                            <button @click="editPasskey(passkey)"
                                class="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button @click="removePasskey(passkey.id)"
                                class="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
                No passkeys registered yet
            </div>
        </div>
        <div v-if="editingPasskey"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                    Edit Passkey Name
                </h3>
                <input v-model="newDeviceName" type="text" placeholder="Device name"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                <div class="flex gap-2">
                    <button @click="editingPasskey = null"
                        class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        Cancel
                    </button>
                    <button @click="savePasskeyName"
                        class="flex-1 px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors">
                        Save
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { startRegistration } from '@simplewebauthn/browser'

const authStore = useAuthStore()

interface Passkey {
    id: number
    deviceName: string
    createdAt: string
    lastUsedAt: string | null
}

const passkeys = ref<Passkey[]>([])
const isRegistering = ref(false)
const error = ref('')
const success = ref('')
const editingPasskey = ref<Passkey | null>(null)
const newDeviceName = ref('')

onMounted(async () => {
    await loadPasskeys()
})

const loadPasskeys = async () => {
    try {
        passkeys.value = await authStore.getPasskeys()
    } catch (err) {
        console.error('Failed to load passkeys:', err)
    }
}

const registerPasskey = async () => {
    try {
        isRegistering.value = true
        error.value = ''
        success.value = ''

        const options = await authStore.getPasskeyRegistrationOptions()
        const attResp = await startRegistration(options)
        const deviceName = prompt('Enter a name for this device (optional):') || undefined
        await authStore.verifyPasskeyRegistration(attResp, deviceName)

        success.value = 'Passkey registered successfully!'
        await loadPasskeys()
    } catch (err: any) {
        console.error('Passkey registration error:', err)
        if (err.name === 'NotAllowedError') {
            error.value = 'Registration was cancelled or not allowed'
        } else {
            error.value = err.response?.data?.error || 'Failed to register passkey'
        }
    } finally {
        isRegistering.value = false
    }
}

const editPasskey = (passkey: Passkey) => {
    editingPasskey.value = passkey
    newDeviceName.value = passkey.deviceName
}

const savePasskeyName = async () => {
    if (!editingPasskey.value) return

    try {
        await authStore.updatePasskey(editingPasskey.value.id, newDeviceName.value)
        await loadPasskeys()
        editingPasskey.value = null
        success.value = 'Passkey name updated!'
        setTimeout(() => success.value = '', 3000)
    } catch (err: any) {
        error.value = err.response?.data?.error || 'Failed to update passkey'
    }
}

const removePasskey = async (id: number) => {
    if (!confirm('Are you sure you want to remove this passkey?')) return

    try {
        await authStore.deletePasskey(id)
        await loadPasskeys()
        success.value = 'Passkey removed successfully!'
        setTimeout(() => success.value = '', 3000)
    } catch (err: any) {
        error.value = err.response?.data?.error || 'Failed to remove passkey'
    }
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}
</script>