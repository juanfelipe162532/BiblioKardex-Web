import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { librariesService, type Library } from '@/services/libraries.service'
import { type CreateLibraryRequest, type PaginatedResponse, type Statistics } from '@/services/api'

export const useLibrariesStore = defineStore('libraries', () => {
  const libraries = ref<Library[]>([])
  const currentLibrary = ref<Library | null>(null)
  const libraryStatistics = ref<Statistics | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const activeLibraries = computed(() => 
    libraries.value.filter(lib => lib.activa)
  )

  const totalLibraries = computed(() => libraries.value.length)
  const totalActiveLibraries = computed(() => activeLibraries.value.length)

  const fetchLibraries = async (page: number = 1, limit: number = 10) => {
    loading.value = true
    error.value = null

    try {
      const response: PaginatedResponse<Library> = await librariesService.getLibraries(page, limit)

      if (response.success && response.data) {
        libraries.value = response.data
        if (response.pagination) {
          pagination.value = response.pagination
        }
      } else {
        error.value = response.message || 'Error al cargar bibliotecas'
      }
    } catch (err) {
      console.error('Error fetching libraries:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
    } finally {
      loading.value = false
    }
  }

  const fetchLibraryById = async (bibliotecaId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await librariesService.getLibraryById(bibliotecaId)
      if (response.success && response.data) {
        currentLibrary.value = response.data
      } else {
        error.value = response.message || 'Error al cargar biblioteca'
      }
    } catch (err) {
      console.error('Error fetching library:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
    } finally {
      loading.value = false
    }
  }

  const createLibrary = async (libraryData: CreateLibraryRequest) => {
    loading.value = true
    error.value = null

    try {
      const response = await librariesService.createLibrary(libraryData)
      if (response.success && response.data) {
        libraries.value.unshift(response.data)
        return response.data
      } else {
        error.value = response.message || 'Error al crear biblioteca'
        return null
      }
    } catch (err) {
      console.error('Error creating library:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateLibrary = async (bibliotecaId: string, libraryData: Partial<CreateLibraryRequest>) => {
    loading.value = true
    error.value = null

    try {
      const response = await librariesService.updateLibrary(bibliotecaId, libraryData)
      if (response.success && response.data) {
        const index = libraries.value.findIndex(lib => lib.id === bibliotecaId)
        if (index !== -1) {
          libraries.value[index] = response.data
        }
        if (currentLibrary.value?.id === bibliotecaId) {
          currentLibrary.value = response.data
        }
        return response.data
      } else {
        error.value = response.message || 'Error al actualizar biblioteca'
        return null
      }
    } catch (err) {
      console.error('Error updating library:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteLibrary = async (bibliotecaId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await librariesService.deleteLibrary(bibliotecaId)
      if (response.success) {
        libraries.value = libraries.value.filter(lib => lib.id !== bibliotecaId)
        if (currentLibrary.value?.id === bibliotecaId) {
          currentLibrary.value = null
        }
        return true
      } else {
        error.value = response.message || 'Error al eliminar biblioteca'
        return false
      }
    } catch (err) {
      console.error('Error deleting library:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchLibraryStatistics = async (bibliotecaId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await librariesService.getLibraryStatistics(bibliotecaId)
      if (response.success && response.data) {
        libraryStatistics.value = response.data
      } else {
        error.value = response.message || 'Error al cargar estadísticas'
      }
    } catch (err) {
      console.error('Error fetching library statistics:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentLibrary = () => {
    currentLibrary.value = null
  }

  const clearStatistics = () => {
    libraryStatistics.value = null
  }

  const setCurrentLibrary = (library: Library) => {
    currentLibrary.value = library
  }

  return {
    // State
    libraries,
    currentLibrary,
    libraryStatistics,
    loading,
    error,
    pagination,
    
    // Getters
    activeLibraries,
    totalLibraries,
    totalActiveLibraries,
    
    // Actions
    fetchLibraries,
    fetchLibraryById,
    createLibrary,
    updateLibrary,
    deleteLibrary,
    fetchLibraryStatistics,
    clearError,
    clearCurrentLibrary,
    clearStatistics,
    setCurrentLibrary
  }
})