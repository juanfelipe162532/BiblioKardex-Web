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

export interface Biblioteca {
  _id: string
  id?: string
  nombre: string
  email: string
  direccion?: string
  telefono?: string
  configuracion?: {
    maxPrestamos: number
    diasPrestamo: number
    permitirRenovaciones?: boolean
    maxRenovaciones?: number
  }
}

export interface SessionData {
  biblioteca: Biblioteca
  operadorActual: User
  sessionId: string
  config: {
    maxPrestamos: number
    diasPrestamo: number
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<SessionData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value && !!session.value)
  const isAdmin = computed(() => (user.value?.role || '').toUpperCase() === 'ADMIN')
  const hasLibrary = computed(() => !!session.value?.biblioteca)
  const biblioteca = computed(() => session.value?.biblioteca || null)
  const config = computed(() => session.value?.config || null)

  // Inicializar desde localStorage si existe
  const initializeAuth = () => {
    const storedUser = localStorage.getItem('auth_user')
    const storedSession = localStorage.getItem('auth_session')
    
    if (storedUser && storedSession) {
      try {
        user.value = JSON.parse(storedUser)
        session.value = JSON.parse(storedSession)
      } catch (err) {
        console.error('Error parsing stored auth data:', err)
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_session')
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
      await apiService.adminLogout().catch(() => {})
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear all session data
      user.value = null
      session.value = null
      error.value = null
      
      // Remove from localStorage
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_session')
      
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

  const setSession = (sessionData: SessionData) => {
    session.value = sessionData
    user.value = sessionData.operadorActual
    
    // Save to localStorage
    localStorage.setItem('auth_user', JSON.stringify(sessionData.operadorActual))
    localStorage.setItem('auth_session', JSON.stringify(sessionData))
  }

  // Admin session setter (minimal session structure without biblioteca contexto)
  const setAdminSession = (adminUser: User) => {
    user.value = { ...adminUser, role: 'ADMIN' }
    session.value = {
      biblioteca: undefined as any, // admin has no library context
      operadorActual: user.value,
      sessionId: `admin_${Date.now()}`,
      config: { maxPrestamos: 0, diasPrestamo: 0 }
    } as any
    localStorage.setItem('auth_user', JSON.stringify(user.value))
    localStorage.setItem('auth_session', JSON.stringify(session.value))
  }

  const clearSession = () => {
    user.value = null
    session.value = null
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_session')
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
      clearSession()
      return false
    }
  }

  // Inicializar al crear el store
  initializeAuth()

  return {
    user,
    session,
    biblioteca,
    config,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    hasLibrary,
    signIn,
    signOut,
    clearError,
    updateUser,
    setSession,
    setAdminSession,
    clearSession,
    verifyToken,
    initializeAuth
  }
})
