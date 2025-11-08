import apiClient from './client'

export const checkAdminStatus = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/auth/check-admin')
    return response.data.isAdmin
  } catch (error) {
    console.error('Admin check failed:', error)
    return false
  }
}

export const getUserRole = async (): Promise<string> => {
  try {
    const response = await apiClient.get('/auth/me')
    return response.data.role || 'user'
  } catch (error) {
    console.error('Get user role failed:', error)
    return 'user'
  }
}
