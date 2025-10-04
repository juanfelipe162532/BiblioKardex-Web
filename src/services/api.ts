const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

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

    // Note: x-user-email header removed due to CORS policy restrictions

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
  async getBooks(bibliotecaId: string, page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<Book>> {
    const params = new URLSearchParams({
      bibliotecaId,
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    })
    return this.request<PaginatedResponse<Book>>(`/api/books?${params}`)
  }

  async createBook(bookData: CreateBookRequest): Promise<ApiResponse<Book>> {
    return this.request<ApiResponse<Book>>('/api/books', {
      method: 'POST',
      body: JSON.stringify(bookData)
    })
  }

  async updateBook(bookId: string, bookData: Partial<CreateBookRequest>): Promise<ApiResponse<Book>> {
    return this.request<ApiResponse<Book>>(`/api/books/${bookId}`, {
      method: 'PATCH',
      body: JSON.stringify(bookData)
    })
  }

  async deleteBook(bookId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/api/books/${bookId}`, {
      method: 'DELETE'
    })
  }

  async getBookById(bookId: string): Promise<ApiResponse<Book>> {
    return this.request<ApiResponse<Book>>(`/api/books/${bookId}`)
  }

  // Préstamos
  async getLoans(bibliotecaId: string, page: number = 1, limit: number = 10, status?: string): Promise<PaginatedResponse<Loan>> {
    const params = new URLSearchParams({
      bibliotecaId,
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    })
    return this.request<PaginatedResponse<Loan>>(`/api/loans?${params}`)
  }

  async createLoan(loanData: CreateLoanRequest): Promise<ApiResponse<Loan>> {
    return this.request<ApiResponse<Loan>>('/api/loans', {
      method: 'POST',
      body: JSON.stringify(loanData)
    })
  }

  async createLoanFromScan(formData: FormData): Promise<ApiResponse<Loan>> {
    return this.request<ApiResponse<Loan>>('/api/loans/scan', {
      method: 'POST',
      body: formData,
      headers: {} // Let fetch set content-type for FormData
    })
  }

  async updateLoan(loanId: string, loanData: Partial<CreateLoanRequest>): Promise<ApiResponse<Loan>> {
    return this.request<ApiResponse<Loan>>(`/api/loans/${loanId}`, {
      method: 'PATCH',
      body: JSON.stringify(loanData)
    })
  }

  async deleteLoan(loanId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/api/loans/${loanId}`, {
      method: 'DELETE'
    })
  }

  async getLoanById(loanId: string): Promise<ApiResponse<Loan>> {
    return this.request<ApiResponse<Loan>>(`/api/loans/${loanId}`)
  }

  // Usuarios/Lectores
  async getReaders(bibliotecaId: string, page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<Reader>> {
    const params = new URLSearchParams({
      bibliotecaId,
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    })
    return this.request<PaginatedResponse<Reader>>(`/api/borrowers?${params}`)
  }

  async createReader(readerData: CreateReaderRequest): Promise<ApiResponse<Reader>> {
    return this.request<ApiResponse<Reader>>('/api/borrowers', {
      method: 'POST',
      body: JSON.stringify(readerData)
    })
  }

  async updateReader(readerId: string, readerData: Partial<CreateReaderRequest>): Promise<ApiResponse<Reader>> {
    return this.request<ApiResponse<Reader>>(`/api/borrowers/${readerId}`, {
      method: 'PATCH',
      body: JSON.stringify(readerData)
    })
  }

  async deleteReader(readerId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/api/borrowers/${readerId}`, {
      method: 'DELETE'
    })
  }

  async getReaderById(readerId: string): Promise<ApiResponse<Reader>> {
    return this.request<ApiResponse<Reader>>(`/api/borrowers/${readerId}`)
  }

  async searchReaders(query: string, bibliotecaId?: string): Promise<ApiResponse<Reader[]>> {
    const params = new URLSearchParams({
      q: query,
      ...(bibliotecaId && { bibliotecaId })
    })
    return this.request<ApiResponse<Reader[]>>(`/api/borrowers/search?${params}`)
  }

  // Reportes y Auditoría
  async getReports(bibliotecaId: string, type: string, dateFrom?: string, dateTo?: string) {
    const params = new URLSearchParams({
      bibliotecaId,
      type,
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo })
    })
    return this.request(`/api/reportes?${params}`)
  }

  async getAuditLogs(page: number = 1, limit: number = 10, bibliotecaId?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(bibliotecaId && { bibliotecaId })
    })
    return this.request(`/api/audit-logs?${params}`)
  }

  async getAuditLogById(logId: string) {
    return this.request(`/api/audit-logs/${logId}`)
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
  async getLibraryInfo(bibliotecaId: string): Promise<ApiResponse<Library>> {
    return this.request<ApiResponse<Library>>(`/api/bibliotecas/${bibliotecaId}`)
  }

  async updateLibraryInfo(bibliotecaId: string, data: any): Promise<ApiResponse<Library>> {
    return this.request<ApiResponse<Library>>(`/api/bibliotecas/${bibliotecaId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async createLibrary(libraryData: CreateLibraryRequest): Promise<ApiResponse<Library>> {
    return this.request<ApiResponse<Library>>('/api/libraries', {
      method: 'POST',
      body: JSON.stringify(libraryData)
    })
  }

  async getLibraries(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Library>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    return this.request<PaginatedResponse<Library>>(`/api/libraries?${params}`)
  }

  async deleteLibrary(bibliotecaId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/api/libraries/${bibliotecaId}`, {
      method: 'DELETE'
    })
  }

  // Análisis IA
  async analyzeImage(formData: FormData): Promise<ApiResponse<AnalysisResult>> {
    return this.request<ApiResponse<AnalysisResult>>('/api/analysis/analyze', {
      method: 'POST',
      body: formData,
      headers: {} // Let fetch set content-type for FormData
    })
  }

  async getAnalysisStatus(): Promise<ApiResponse<AnalysisStatus>> {
    return this.request<ApiResponse<AnalysisStatus>>('/api/analysis/status')
  }

  async getHealthCheck(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/api/analysis/health')
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

export interface Library {
  id: string
  nombre: string
  direccion?: string
  telefono?: string
  email?: string
  descripcion?: string
  fechaCreacion: string
  activa: boolean
}

export interface AnalysisResult {
  id: string
  tipo: 'LIBRO' | 'DOCUMENTO' | 'OTRO'
  contenido: {
    titulo?: string
    autor?: string
    isbn?: string
    categoria?: string
    descripcion?: string
    texto?: string
  }
  confianza: number
  fechaAnalisis: string
  usuarioId: string
  bibliotecaId: string
}

export interface AnalysisStatus {
  totalAnalyzed: number
  pendingAnalysis: number
  successRate: number
  lastAnalysis?: string
}

export interface CreateBookRequest {
  titulo: string
  autor: string
  isbn?: string
  categoria?: string
  descripcion?: string
  ubicacion?: string
  bibliotecaId: string
}

export interface CreateLoanRequest {
  libroId: string
  lectorId: string
  fechaDevolucionEsperada?: string
  notas?: string
  bibliotecaId: string
}

export interface CreateReaderRequest {
  nombre: string
  email: string
  telefono?: string
  tipo: 'ESTUDIANTE' | 'PROFESOR' | 'EXTERNO'
  identificacion?: string
  bibliotecaId: string
}

export interface CreateLibraryRequest {
  nombre: string
  direccion?: string
  telefono?: string
  email?: string
  descripcion?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  status?: string
}

export interface PaginatedResponse<T = any> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
}
