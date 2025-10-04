const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://devbibliokardex.us-east-1.elasticbeanstalk.com'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  user?: {
    id: string
    nombre: string
    email: string
    bibliotecaId?: string
    role?: string
  }
  token?: string
}

export interface ApiError {
  success: false
  message: string
  error?: string
}

class ApiService {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = BASE_URL
    // Recuperar token del localStorage si existe
    this.token = localStorage.getItem('auth_token')
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('auth_token', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('auth_token')
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    // Build headers as a plain object for safe mutation
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (options.headers) {
      const h = new Headers(options.headers as HeadersInit)
      h.forEach((value, key) => { headers[key] = value })
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    // Enviar email del usuario como encabezado para endpoints sin JWT
    try {
      const storedUser = localStorage.getItem('auth_user')
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        if (parsed?.email && !('x-user-email' in headers)) {
          headers['x-user-email'] = parsed.email
        }
      }
    } catch { /* ignore */ }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: `HTTP ${response.status}: ${response.statusText}` 
        }))
        throw new Error(errorData.message || 'Error en la petición')
      }

      return await response.json()
    } catch (error) {
      console.error('API Request Error:', error)
      throw error
    }
  }

  // Utilidad: SHA-256 a hex usando Web Crypto API
  private async sha256Hex(input: string): Promise<string> {
    const enc = new TextEncoder().encode(input)
    const buf = await crypto.subtle.digest('SHA-256', enc)
    const hashArray = Array.from(new Uint8Array(buf))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Autenticación
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const passwordHash = await this.sha256Hex(credentials.password)

    const raw = await this.request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: credentials.email, passwordHash }),
    })

    // Normalizar respuesta del backend
    const response: LoginResponse = {
      success: raw?.status === 'success' || !!raw?.success,
      message: raw?.message || '',
      user: raw?.data?.user || raw?.user,
      token: raw?.token
    }

    if (response.success && response.token) {
      this.setToken(response.token)
    }

    return response
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.warn('Logout request failed:', error)
    } finally {
      this.clearToken()
    }
  }

  // Tipos de respuesta genérica
  
  // Estadísticas del dashboard (respuesta normalizada)
  async getStatistics(bibliotecaId: string): Promise<{ success: boolean; data?: Statistics; message?: string }> {
    const raw = await this.request<any>(`/api/estadisticas/${bibliotecaId}`)
    // Backend puede devolver {status:'success', data:{...}} o directamente el objeto
    const success = raw?.status === 'success' || raw?.success || (raw && typeof raw === 'object' && 'totalBooks' in raw)
    const data: Statistics | undefined = success ? (raw?.data ?? raw) as Statistics : undefined
    const message = raw?.message || (success ? undefined : 'Error al cargar estadísticas')
    return { success: !!success, data, message }
  }

  // Libros
  async getBooks(bibliotecaId: string, page: number = 1, limit: number = 10) {
    return this.request(`/api/libros?bibliotecaId=${bibliotecaId}&page=${page}&limit=${limit}`)
  }

  // Préstamos
  async getLoans(bibliotecaId: string, page: number = 1, limit: number = 10) {
    return this.request(`/api/prestamos?bibliotecaId=${bibliotecaId}&page=${page}&limit=${limit}`)
  }

  // Usuarios/Lectores
  async getReaders(bibliotecaId: string, page: number = 1, limit: number = 10) {
    return this.request(`/api/lectores?bibliotecaId=${bibliotecaId}&page=${page}&limit=${limit}`)
  }

  // Reportes
  async getReports(bibliotecaId: string, type: string, dateFrom?: string, dateTo?: string) {
    const params = new URLSearchParams({
      bibliotecaId,
      type,
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo })
    })
    return this.request(`/api/reportes?${params}`)
  }

  // Perfil de usuario
  async getUserProfile() {
    const raw = await this.request<any>('/api/auth/profile')
    return {
      success: raw?.status === 'success' || !!raw?.success,
      message: raw?.message || '',
      user: raw?.data?.user || raw?.user
    }
  }

  async updateUserProfile(data: any) {
    return this.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Biblioteca
  async getLibraryInfo(bibliotecaId: string) {
    return this.request(`/api/bibliotecas/${bibliotecaId}`)
  }

  async updateLibraryInfo(bibliotecaId: string, data: any) {
    return this.request(`/api/bibliotecas/${bibliotecaId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
}

// Instancia singleton
export const apiService = new ApiService()

// Tipos para responses
export interface Statistics {
  totalBooks: number
  availableBooks: number
  activeLoans: number
  totalReaders: number
  recentBooks: any[]
  recentLoans: any[]
}

export interface Book {
  id: string
  titulo: string
  autor: string
  isbn?: string
  categoria?: string
  disponible: boolean
  fechaCreacion: string
  bibliotecaId: string
}

export interface Loan {
  id: string
  libroId: string
  lectorId: string
  fechaPrestamo: string
  fechaDevolucion?: string
  estado: 'activo' | 'devuelto' | 'vencido'
  libro?: Book
  lector?: Reader
}

export interface Reader {
  id: string
  nombre: string
  email: string
  telefono?: string
  tipo: string
  bibliotecaId: string
  fechaCreacion: string
}
