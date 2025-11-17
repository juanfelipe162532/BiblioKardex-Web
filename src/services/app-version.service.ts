const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export interface AppVersion {
  _id: string
  versionNumber: string
  versionCode: number
  platform: 'android' | 'ios' | 'all'
  releaseDate: string
  delayMinutes: number
  title?: string
  message: string
  updateUrl?: string
  isCritical: boolean
  isActive: boolean
  notificationStartsAt: string
  createdAt: string
}

export interface CreateAppVersionRequest {
  versionNumber: string
  versionCode: number
  platform?: 'android' | 'ios' | 'all'
  releaseDate: string
  delayMinutes?: number
  title?: string
  message: string
  updateUrl?: string
  isCritical?: boolean
}

export interface UpdateAppVersionRequest {
  versionNumber?: string
  versionCode?: number
  platform?: 'android' | 'ios' | 'all'
  releaseDate?: string
  delayMinutes?: number
  title?: string
  message?: string
  updateUrl?: string
  isCritical?: boolean
  isActive?: boolean
}

export interface AppVersionListResponse {
  status: string
  data: {
    versions: AppVersion[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  message?: string
}

export interface AppVersionResponse {
  status: string
  data: AppVersion
  message?: string
}

class AppVersionService {
  private baseUrl: string

  constructor() {
    this.baseUrl = BASE_URL
  }

  private getAuthHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    const token = localStorage.getItem('auth_token')
    const adminToken = localStorage.getItem('admin_session_token')

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    if (adminToken) {
      headers['X-Admin-Session'] = adminToken
    }

    return headers
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...(options.headers || {})
      }
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return data as T
    } catch (error) {
      console.error('API Request Error:', error)
      throw error
    }
  }

  // Listar todas las versiones
  async listVersions(
    page: number = 1,
    limit: number = 10,
    platform?: 'android' | 'ios' | 'all',
    isActive?: boolean
  ): Promise<AppVersionListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(platform && { platform }),
      ...(isActive !== undefined && { isActive: isActive.toString() })
    })

    return this.request<AppVersionListResponse>(
      `/api/app-version?${params}`,
      { method: 'GET' }
    )
  }

  // Obtener una versión específica
  async getVersion(id: string): Promise<AppVersionResponse> {
    return this.request<AppVersionResponse>(
      `/api/app-version/${id}`,
      { method: 'GET' }
    )
  }

  // Crear nueva versión
  async createVersion(data: CreateAppVersionRequest): Promise<AppVersionResponse> {
    return this.request<AppVersionResponse>(
      '/api/app-version',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    )
  }

  // Actualizar versión existente
  async updateVersion(id: string, data: UpdateAppVersionRequest): Promise<AppVersionResponse> {
    return this.request<AppVersionResponse>(
      `/api/app-version/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data)
      }
    )
  }

  // Eliminar versión
  async deleteVersion(id: string): Promise<{ status: string; message?: string }> {
    return this.request<{ status: string; message?: string }>(
      `/api/app-version/${id}`,
      { method: 'DELETE' }
    )
  }

  // Activar/Desactivar versión
  async toggleActive(id: string, isActive: boolean): Promise<AppVersionResponse> {
    return this.updateVersion(id, { isActive })
  }
}

export const appVersionService = new AppVersionService()
