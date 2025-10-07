import { apiService, type CreateReaderRequest, type Reader, type PaginatedResponse, type ApiResponse } from './api'

export class ReadersService {
  async getReaders(
    bibliotecaId: string, 
    page: number = 1, 
    limit: number = 10, 
    search?: string
  ): Promise<PaginatedResponse<Reader>> {
    return apiService.getReaders(bibliotecaId, page, limit, search)
  }

  async getReaderById(readerId: string): Promise<ApiResponse<Reader>> {
    return apiService.getReaderById(readerId)
  }

  async createReader(readerData: CreateReaderRequest): Promise<ApiResponse<Reader>> {
    return apiService.createReader(readerData)
  }

  async updateReader(readerId: string, readerData: Partial<CreateReaderRequest>): Promise<ApiResponse<Reader>> {
    return apiService.updateReader(readerId, readerData)
  }

  async deleteReader(readerId: string): Promise<ApiResponse> {
    return apiService.deleteReader(readerId)
  }

  async searchReaders(query: string, bibliotecaId?: string): Promise<ApiResponse<Reader[]>> {
    return apiService.searchReaders(query, bibliotecaId)
  }

  async getReadersByType(tipo: string, bibliotecaId: string): Promise<PaginatedResponse<Reader>> {
    // Implementar filtro por tipo en el frontend hasta que esté disponible en el backend
    const allReaders = await this.getReaders(bibliotecaId, 1, 1000)
    if (allReaders.success && allReaders.data) {
      const filteredReaders = allReaders.data.filter(reader => reader.tipo === tipo)
      return {
        ...allReaders,
        data: filteredReaders,
        pagination: {
          ...allReaders.pagination,
          total: filteredReaders.length,
          totalPages: Math.ceil(filteredReaders.length / allReaders.pagination.limit)
        }
      }
    }
    return allReaders
  }
}

export const readersService = new ReadersService()