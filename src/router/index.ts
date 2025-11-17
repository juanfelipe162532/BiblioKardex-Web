import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '../views/LoginView.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/admin',
      name: 'admin-login',
      component: () => import('../views/AdminLoginView.vue'),
    },
    {
      path: '/login',
      redirect: '/'
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/dashboard',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
        }
      ]
    },
    {
      path: '/admin/users',
      component: DashboardLayout,
      meta: { requiresAuth: true, adminOnly: true },
      children: [
        {
          path: '',
          name: 'admin-users',
          component: () => import('../views/AdminUsersView.vue'),
        }
      ]
    },
    {
      path: '/admin/support',
      component: DashboardLayout,
      meta: { requiresAuth: true, adminOnly: true },
      children: [
        {
          path: '',
          name: 'admin-support',
          component: () => import('../views/AdminSupportView.vue'),
        }
      ]
    },
    {
      path: '/admin/app-control',
      component: DashboardLayout,
      meta: { requiresAuth: true, adminOnly: true },
      children: [
        {
          path: '',
          name: 'admin-app-control',
          component: () => import('../views/AdminAppControlView.vue'),
        }
      ]
    },
    {
      path: '/users',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'users',
          component: () => import('../views/UsersView.vue'),
        }
      ]
    },
    {
      path: '/reports',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'reports',
          component: () => import('../views/ReportsView.vue'),
        }
      ]
    },
    {
      path: '/profile',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'profile',
          component: () => import('../views/ProfileView.vue'),
        }
      ]
    },
    {
      path: '/books',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'books',
          component: () => import('../views/BooksManagementView.vue'),
        }
      ]
    },
  ],
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/')
  } else if (to.path === '/' && authStore.isAuthenticated) {
    next('/dashboard')
  } else if (to.path === '/admin' && authStore.isAuthenticated) {
    next('/dashboard')
  } else if (to.meta.adminOnly && !authStore.isAdmin) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
