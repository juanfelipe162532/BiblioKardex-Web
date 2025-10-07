import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { readersService } from '@/services/readers.service'
import { type Reader, type CreateReaderRequest, type PaginatedResponse } from '@/services/api'

export const useReadersStore = defineStore('readers', () => {
  const readers = ref<Reader[]>([])
  const currentReader = ref<Reader | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const searchQuery = ref('')
  const filters = ref({
    tipo: '',
    activo: null as boolean | null
  })

  const readersByType = computed(() => {
    const byType: Record<string, Reader[]> = {}
    readers.value.forEach(reader => {
      const type = reader.tipo || 'OTROS'
      if (!byType[type]) {
        byType[type] = []
      }
      byType[type].push(reader)
    })
    return byType
  })

  const totalReaders = computed(() => readers.value.length)
  const studentReaders = computed(() => readers.value.filter(r => r.tipo === 'ESTUDIANTE'))
  const teacherReaders = computed(() => readers.value.filter(r => r.tipo === 'PROFESOR'))
  const externalReaders = computed(() => readers.value.filter(r => r.tipo === 'EXTERNO'))

  const fetchReaders = async (
    bibliotecaId: string, 
    page: number = 1, 
    limit: number = 10,
    search?: string
  ) => {
    loading.value = true
    error.value = null

    try {
      const response: PaginatedResponse<Reader> = await readersService.getReaders(
        bibliotecaId, 
        page, 
        limit, 
        search || searchQuery.value
      )

      if (response.success && response.data) {
        readers.value = response.data
        if (response.pagination) {
          pagination.value = response.pagination
        }
      } else {
        error.value = response.message || 'Error al cargar lectores'
      }
    } catch (err) {
      console.error('Error fetching readers:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
    } finally {
      loading.value = false
    }
  }

  const fetchReaderById = async (readerId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await readersService.getReaderById(readerId)
      if (response.success && response.data) {
        currentReader.value = response.data
      } else {
        error.value = response.message || 'Error al cargar lector'
      }
    } catch (err) {
      console.error('Error fetching reader:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
    } finally {
      loading.value = false
    }
  }

  const createReader = async (readerData: CreateReaderRequest) => {
    loading.value = true
    error.value = null

    try {
      const response = await readersService.createReader(readerData)
      if (response.success && response.data) {
        readers.value.unshift(response.data)
        return response.data
      } else {
        error.value = response.message || 'Error al crear lector'
        return null
      }
    } catch (err) {
      console.error('Error creating reader:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateReader = async (readerId: string, readerData: Partial<CreateReaderRequest>) => {
    loading.value = true
    error.value = null

    try {
      const response = await readersService.updateReader(readerId, readerData)
      if (response.success && response.data) {
        const index = readers.value.findIndex(reader => reader.id === readerId)
        if (index !== -1) {
          readers.value[index] = response.data
        }
        if (currentReader.value?.id === readerId) {
          currentReader.value = response.data
        }
        return response.data
      } else {
        error.value = response.message || 'Error al actualizar lector'
        return null
      }
    } catch (err) {
      console.error('Error updating reader:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteReader = async (readerId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await readersService.deleteReader(readerId)
      if (response.success) {
        readers.value = readers.value.filter(reader => reader.id !== readerId)
        if (currentReader.value?.id === readerId) {
          currentReader.value = null
        }
        return true
      } else {
        error.value = response.message || 'Error al eliminar lector'
        return false
      }
    } catch (err) {
      console.error('Error deleting reader:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
      return false
    } finally {
      loading.value = false
    }
  }

  const searchReaders = async (query: string, bibliotecaId?: string) => {
    loading.value = true
    error.value = null
    searchQuery.value = query

    try {
      const response = await readersService.searchReaders(query, bibliotecaId)
      if (response.success && response.data) {
        readers.value = Array.isArray(response.data) ? response.data : []
      } else {
        error.value = response.message || 'Error al buscar lectores'
      }
    } catch (err) {
      console.error('Error searching readers:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
    } finally {
      loading.value = false
    }
  }

  const fetchReadersByType = async (tipo: string, bibliotecaId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await readersService.getReadersByType(tipo, bibliotecaId)
      if (response.success && response.data) {
        readers.value = response.data
        if (response.pagination) {
          pagination.value = response.pagination
        }
      } else {
        error.value = response.message || 'Error al cargar lectores por tipo'
      }
    } catch (err) {
      console.error('Error fetching readers by type:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
    } finally {
      loading.value = false
    }
  }

  const clearSearch = () => {
    searchQuery.value = ''
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentReader = () => {
    currentReader.value = null
  }

  const setFilter = <K extends keyof typeof filters.value>(filterKey: K, value: typeof filters.value[K]) => {
    filters.value[filterKey] = value
  }

  const clearFilters = () => {
    filters.value = {
      tipo: '',
      activo: null
    }
  }

  return {
    // State
    readers,
    currentReader,
    loading,
    error,
    pagination,
    searchQuery,
    filters,
    
    // Getters
    readersByType,
    totalReaders,
    studentReaders,
    teacherReaders,
    externalReaders,
    
    // Actions
    fetchReaders,
    fetchReaderById,
    createReader,
    updateReader,
    deleteReader,
    searchReaders,
    fetchReadersByType,
    clearSearch,
    clearError,
    clearCurrentReader,
    setFilter,
    clearFilters
  }
})