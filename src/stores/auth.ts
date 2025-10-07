import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService, type LoginRequest } from '@/services/api'

export interface User {
  id: string
  nombre: string
  email: string
  bibliotecaId?: string
  role?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const hasLibrary = computed(() => !!user.value?.bibliotecaId)

  // Inicializar desde localStorage si existe
  const initializeAuth = () => {
    const storedUser = localStorage.getItem('auth_user')
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (err) {
        console.error('Error parsing stored user:', err)
        localStorage.removeItem('auth_user')
      }
    }
  }

  const signIn = async (email: string, password: string): Promise<User | null> => {
    loading.value = true
    error.value = null

    try {
      const credentials: LoginRequest = { email, password }
      const response = await apiService.login(credentials)

      if (response.success && response.user) {
        user.value = response.user
        // Guardar usuario en localStorage
        localStorage.setItem('auth_user', JSON.stringify(response.user))
        return response.user
      } else {
        error.value = response.message || 'Error de autenticación'
        return null
      }
    } catch (err) {
      console.error('Login error:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
      return null
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    loading.value = true
    try {
      await apiService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      user.value = null
      error.value = null
      localStorage.removeItem('auth_user')
      loading.value = false
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }

  const clearError = () => {
    error.value = null
  }

  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData }
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    }
  }

  // Verificar si el token sigue siendo válido
  const verifyToken = async (): Promise<boolean> => {
    try {
      const profile = await apiService.getUserProfile()
      if (profile && profile.success) {
        updateUser(profile.user)
        return true
      }
      return false
    } catch (err) {
      console.error('Token verification failed:', err)
      await signOut()
      return false
    }
  }

  // Inicializar al crear el store
  initializeAuth()

  return {
    user,
    loading,
    error,
    isAuthenticated,
    hasLibrary,
    signIn,
    signOut,
    clearError,
    updateUser,
    verifyToken,
    initializeAuth
  }
})