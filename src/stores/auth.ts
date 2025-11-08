import { defineStore } from 'pinia'
import apiClient from '@/api/client'
import { ref, computed } from 'vue'

interface User {
  id: number
  email: string
  username: string
  fullName?: string
  role?: string
  createdAt: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = ref(false)

  const initAuth = async () => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
      
      await checkAdminFromBackend()
    }
  }
  
  const checkAdminFromBackend = async () => {
    try {
      const response = await apiClient.get('/auth/check-admin')
      isAdmin.value = response.data.isAdmin
      
      if (user.value) {
        user.value.role = response.data.role
        localStorage.setItem('user', JSON.stringify(user.value))
      }
    } catch (error) {
      console.error('Admin check failed:', error)
      isAdmin.value = false
    }
  }

  const register = async (email: string, username: string, password: string, fullName?: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiClient.post('/auth/register', {
        email,
        username,
        password,
        fullName,
      })

      token.value = response.data.token
      user.value = response.data.user

      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      return true
    } catch (err: any) {
      console.error('Registration error:', err)
      error.value = err.response?.data?.error || 'Registration failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const login = async (
    identifier: string,
    password: string,
    twoFactorToken?: string,
    isBackupCode?: boolean,
  ) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiClient.post('/auth/login', {
        identifier,
        password,
        twoFactorToken,
        isBackupCode,
      })

      if (response.data.requires2FA) {
        return {
          requires2FA: true,
          userId: response.data.userId,
        }
      }

      token.value = response.data.token
      user.value = response.data.user

      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      await checkAdminFromBackend()

      return { success: true }
    } catch (err: any) {
      console.error('Login error:', err)
      error.value = err.response?.data?.error || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const loginWithGoogle = async (email: string, fullName: string, googleId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiClient.post('/auth/google', {
        email,
        fullName,
        googleId,
      })

      token.value = response.data.token
      user.value = response.data.user

      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      return true
    } catch (err: any) {
      console.error('Google login error:', err)
      error.value = err.response?.data?.error || 'Google login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const getCurrentUser = async () => {
    try {
      const response = await apiClient.get('/auth/me')
      user.value = response.data
      localStorage.setItem('user', JSON.stringify(response.data))
      
      await checkAdminFromBackend()
      
      return true
    } catch (err: any) {
      console.error('Get user error:', err)
      logout()
      return false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    isAdmin.value = false
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  const setup2FA = async () => {
    try {
      const response = await apiClient.post('/auth/2fa/setup')
      return response.data
    } catch (err: any) {
      console.error('2FA setup error:', err)
      throw err
    }
  }

  const enable2FA = async (token: string) => {
    try {
      const response = await apiClient.post('/auth/2fa/enable', { token })
      return response.data
    } catch (err: any) {
      console.error('2FA enable error:', err)
      throw err
    }
  }

  const disable2FA = async (token?: string, password?: string) => {
    try {
      const response = await apiClient.post('/auth/2fa/disable', { token, password })
      return response.data
    } catch (err: any) {
      console.error('2FA disable error:', err)
      throw err
    }
  }

  const get2FAStatus = async () => {
    try {
      const response = await apiClient.get('/auth/2fa/status')
      return response.data
    } catch (err: any) {
      console.error('2FA status error:', err)
      throw err
    }
  }

  const getPasskeyRegistrationOptions = async () => {
    try {
      const response = await apiClient.post('/auth/passkey/register/options')
      return response.data
    } catch (err: any) {
      console.error('Passkey registration options error:', err)
      throw err
    }
  }

  const verifyPasskeyRegistration = async (response: any, deviceName?: string) => {
    try {
      const result = await apiClient.post('/auth/passkey/register/verify', {
        response,
        deviceName,
      })
      return result.data
    } catch (err: any) {
      console.error('Passkey registration verification error:', err)
      throw err
    }
  }

  const getPasskeyAuthenticationOptions = async (identifier?: string) => {
    try {
      const response = await apiClient.post('/auth/passkey/authenticate/options', {
        email: identifier,
        username: identifier,
      })
      return response.data
    } catch (err: any) {
      console.error('Passkey authentication options error:', err)
      throw err
    }
  }

  const verifyPasskeyAuthentication = async (response: any, challengeKey: string) => {
    try {
      const result = await apiClient.post('/auth/passkey/authenticate/verify', {
        response,
        challengeKey,
      })

      if (result.data.token) {
        token.value = result.data.token
        user.value = result.data.user

        localStorage.setItem('auth_token', result.data.token)
        localStorage.setItem('user', JSON.stringify(result.data.user))
      }

      return result.data
    } catch (err: any) {
      console.error('Passkey authentication verification error:', err)
      throw err
    }
  }

  const getPasskeys = async () => {
    try {
      const response = await apiClient.get('/auth/passkey/list')
      return response.data
    } catch (err: any) {
      console.error('Get passkeys error:', err)
      throw err
    }
  }

  const deletePasskey = async (id: number) => {
    try {
      await apiClient.delete(`/auth/passkey/${id}`)
    } catch (err: any) {
      console.error('Delete passkey error:', err)
      throw err
    }
  }

  const updatePasskey = async (id: number, deviceName: string) => {
    try {
      await apiClient.patch(`/auth/passkey/${id}`, { deviceName })
    } catch (err: any) {
      console.error('Update passkey error:', err)
      throw err
    }
  }

  initAuth()

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    register,
    login,
    loginWithGoogle,
    getCurrentUser,
    logout,
    setup2FA,
    enable2FA,
    disable2FA,
    get2FAStatus,
    getPasskeyRegistrationOptions,
    verifyPasskeyRegistration,
    getPasskeyAuthenticationOptions,
    verifyPasskeyAuthentication,
    getPasskeys,
    deletePasskey,
    updatePasskey,
  }
})
