import { apiService, type CreateLibraryRequest, type PaginatedResponse, type ApiResponse } from './api'

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

export class LibrariesService {
  async getLibraries(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Library>> {
    return apiService.getLibraries(page, limit)
  }

  async getLibraryById(bibliotecaId: string): Promise<ApiResponse<Library>> {
    return apiService.getLibraryInfo(bibliotecaId)
  }

  async createLibrary(libraryData: CreateLibraryRequest): Promise<ApiResponse<Library>> {
    return apiService.createLibrary(libraryData)
  }

  async updateLibrary(bibliotecaId: string, libraryData: Partial<CreateLibraryRequest>): Promise<ApiResponse<Library>> {
    return apiService.updateLibraryInfo(bibliotecaId, libraryData)
  }

  async deleteLibrary(bibliotecaId: string): Promise<ApiResponse> {
    return apiService.deleteLibrary(bibliotecaId)
  }

  async getLibraryStatistics(bibliotecaId: string) {
    return apiService.getStatistics(bibliotecaId)
  }
}

export const librariesService = new LibrariesService()