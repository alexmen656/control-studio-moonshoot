import { defineStore } from 'pinia'
import apiClient from '@/api/client'
import { ref, computed } from 'vue'

interface User {
  id: number
  email: string
  username: string
  fullName?: string
  createdAt: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isAuthenticated = computed(() => !!token.value)

  const initAuth = () => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
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

  const login = async (identifier: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiClient.post('/auth/login', {
        identifier,
        password,
      })

      token.value = response.data.token
      user.value = response.data.user

      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      return true
    } catch (err: any) {
      console.error('Login error:', err)
      error.value = err.response?.data?.error || 'Login failed'
      return false
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
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  initAuth()

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    register,
    login,
    loginWithGoogle,
    getCurrentUser,
    logout,
  }
})
