import { apiService, type ApiResponse, type CreateBookRequest } from './api'

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

export class AnalysisService {
  async analyzeImage(imageFile: File, bibliotecaId: string): Promise<ApiResponse<AnalysisResult>> {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('bibliotecaId', bibliotecaId)
    formData.append('tipo', 'LIBRO') // Tipo por defecto
    
    return apiService.analyzeImage(formData)
  }

  async getAnalysisStatus(): Promise<ApiResponse<AnalysisStatus>> {
    return apiService.getAnalysisStatus()
  }

  async getHealthCheck(): Promise<ApiResponse> {
    return apiService.getHealthCheck()
  }

  async analyzeDocument(imageFile: File, bibliotecaId: string, tipo: 'LIBRO' | 'DOCUMENTO' = 'DOCUMENTO'): Promise<ApiResponse<AnalysisResult>> {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('bibliotecaId', bibliotecaId)
    formData.append('tipo', tipo)
    
    return apiService.analyzeImage(formData)
  }

  async convertAnalysisToBook(analysis: AnalysisResult): Promise<CreateBookRequest> {
    return {
      titulo: analysis.contenido.titulo || 'Título desconocido',
      autor: analysis.contenido.autor || 'Autor desconocido',
      isbn: analysis.contenido.isbn,
      categoria: analysis.contenido.categoria || 'Sin categoría',
      descripcion: analysis.contenido.descripcion,
      ubicacion: '',
      bibliotecaId: analysis.bibliotecaId
    }
  }
}

export const analysisService = new AnalysisService()