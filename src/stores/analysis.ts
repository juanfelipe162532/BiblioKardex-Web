import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { analysisService, type AnalysisResult, type AnalysisStatus } from '@/services/analysis.service'
import { type ApiResponse } from '@/services/api'

export const useAnalysisStore = defineStore('analysis', () => {
  const analysisResults = ref<AnalysisResult[]>([])
  const currentAnalysis = ref<AnalysisResult | null>(null)
  const analysisStatus = ref<AnalysisStatus | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isAnalyzing = ref(false)

  const successfulAnalyses = computed(() => 
    analysisResults.value.filter(result => result.confianza > 0.5)
  )

  const recentAnalyses = computed(() => 
    analysisResults.value
      .sort((a, b) => new Date(b.fechaAnalisis).getTime() - new Date(a.fechaAnalisis).getTime())
      .slice(0, 10)
  )

  const analysisByType = computed(() => {
    const byType: Record<string, AnalysisResult[]> = {}
    analysisResults.value.forEach(result => {
      const type = result.tipo || 'OTRO'
      if (!byType[type]) {
        byType[type] = []
      }
      byType[type].push(result)
    })
    return byType
  })

  const averageConfidence = computed(() => {
    if (analysisResults.value.length === 0) return 0
    const total = analysisResults.value.reduce((sum, result) => sum + result.confianza, 0)
    return total / analysisResults.value.length
  })

  const analyzeImage = async (imageFile: File, bibliotecaId: string): Promise<AnalysisResult | null> => {
    isAnalyzing.value = true
    loading.value = true
    error.value = null

    try {
      const response: ApiResponse<AnalysisResult> = await analysisService.analyzeImage(imageFile, bibliotecaId)
      
      if (response.success && response.data) {
        analysisResults.value.unshift(response.data)
        currentAnalysis.value = response.data
        return response.data
      } else {
        error.value = response.message || 'Error al analizar imagen'
        return null
      }
    } catch (err) {
      console.error('Error analyzing image:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
      return null
    } finally {
      isAnalyzing.value = false
      loading.value = false
    }
  }

  const analyzeDocument = async (
    imageFile: File, 
    bibliotecaId: string, 
    tipo: 'LIBRO' | 'DOCUMENTO' = 'DOCUMENTO'
  ): Promise<AnalysisResult | null> => {
    isAnalyzing.value = true
    loading.value = true
    error.value = null

    try {
      const response: ApiResponse<AnalysisResult> = await analysisService.analyzeDocument(imageFile, bibliotecaId, tipo)
      
      if (response.success && response.data) {
        analysisResults.value.unshift(response.data)
        currentAnalysis.value = response.data
        return response.data
      } else {
        error.value = response.message || 'Error al analizar documento'
        return null
      }
    } catch (err) {
      console.error('Error analyzing document:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
      return null
    } finally {
      isAnalyzing.value = false
      loading.value = false
    }
  }

  const fetchAnalysisStatus = async () => {
    loading.value = true
    error.value = null

    try {
      const response: ApiResponse<AnalysisStatus> = await analysisService.getAnalysisStatus()
      
      if (response.success && response.data) {
        analysisStatus.value = response.data
      } else {
        error.value = response.message || 'Error al cargar estado de análisis'
      }
    } catch (err) {
      console.error('Error fetching analysis status:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
    } finally {
      loading.value = false
    }
  }

  const checkHealth = async (): Promise<boolean> => {
    try {
      const response = await analysisService.getHealthCheck()
      return response.success || false
    } catch (err) {
      console.error('Health check failed:', err)
      return false
    }
  }

  const convertToBookData = async (analysis: AnalysisResult) => {
    return await analysisService.convertAnalysisToBook(analysis)
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentAnalysis = () => {
    currentAnalysis.value = null
  }

  const clearAnalysisResults = () => {
    analysisResults.value = []
  }

  const setCurrentAnalysis = (analysis: AnalysisResult) => {
    currentAnalysis.value = analysis
  }

  const removeAnalysis = (analysisId: string) => {
    analysisResults.value = analysisResults.value.filter(result => result.id !== analysisId)
    if (currentAnalysis.value?.id === analysisId) {
      currentAnalysis.value = null
    }
  }

  return {
    // State
    analysisResults,
    currentAnalysis,
    analysisStatus,
    loading,
    error,
    isAnalyzing,
    
    // Getters
    successfulAnalyses,
    recentAnalyses,
    analysisByType,
    averageConfidence,
    
    // Actions
    analyzeImage,
    analyzeDocument,
    fetchAnalysisStatus,
    checkHealth,
    convertToBookData,
    clearError,
    clearCurrentAnalysis,
    clearAnalysisResults,
    setCurrentAnalysis,
    removeAnalysis
  }
})