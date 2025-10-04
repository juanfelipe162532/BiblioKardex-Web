import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiService, type Statistics } from '@/services/api'

export const useDashboardStore = defineStore('dashboard', () => {
  const statistics = ref<Statistics | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadStatistics = async (bibliotecaId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.getStatistics(bibliotecaId)
      if (response.success) {
        statistics.value = response.data ?? null
      } else {
        error.value = response.message || 'Error al cargar estadísticas'
      }
    } catch (err) {
      console.error('Statistics loading error:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const resetStatistics = () => {
    statistics.value = null
    error.value = null
    loading.value = false
  }

  return {
    statistics,
    loading,
    error,
    loadStatistics,
    clearError,
    resetStatistics
  }
})
