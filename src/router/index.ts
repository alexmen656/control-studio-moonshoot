import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LandingPage from '../views/LandingPage.vue'
import { useAuthStore } from '../stores/auth'
import apiClient from '../api/client'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingPage,
    },
    {
      path: '/blog',
      name: 'blog',
      component: () => import('../views/BlogHub.vue'),
    },
    {
      path: '/blog/:id',
      name: 'blog-post',
      component: () => import('../views/BlogPost.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignUpView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('../views/OnboardingView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/posts',
      name: 'posts',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/videos',
      name: 'videos',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/video/:id',
      name: 'video',
      component: () => import('../views/VideoView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/activity',
      name: 'activity',
      component: () => import('../views/ActivityView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/schedule',
      name: 'schedule',
      component: () => import('../views/CalendarView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/planning',
      name: 'planning',
      component: () => import('../views/PlanView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: () => import('../views/AccountsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/project-settings',
      name: 'project-settings',
      component: () => import('../views/ProjectSettingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/security',
      name: 'security',
      component: () => import('../views/SecurityView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('../views/AnalyticsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/workers',
      name: 'workers',
      component: () => import('../views/WorkersView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/AdminUsersView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('auth_token')
  const isAuthenticated = !!token

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
    return
  }
  
  if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'home' })
    return
  }
  
  if (to.meta.requiresAdmin && isAuthenticated) {
    try {
      const response = await apiClient.get('/auth/check-admin')
      if (!response.data.isAdmin) {
        console.warn('Access denied: Admin privileges required')
        next({ name: 'dashboard' })
        return
      }
    } catch (error) {
      console.error('Admin check failed:', error)
      next({ name: 'dashboard' })
      return
    }
  }
  
  next()
})

export default router
