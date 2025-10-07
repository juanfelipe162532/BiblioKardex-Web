import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loansService } from '@/services/loans.service'
import { type Loan, type CreateLoanRequest, type PaginatedResponse } from '@/services/api'

export const useLoansStore = defineStore('loans', () => {
  const loans = ref<Loan[]>([])
  const currentLoan = ref<Loan | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const filters = ref({
    estado: '',
    fechaInicio: '',
    fechaFin: ''
  })

  const activeLoans = computed(() => 
    loans.value.filter(loan => loan.estado === 'activo')
  )

  const overdueLoans = computed(() => 
    loans.value.filter(loan => loan.estado === 'vencido')
  )

  const returnedLoans = computed(() => 
    loans.value.filter(loan => loan.estado === 'devuelto')
  )

  const totalActiveLoans = computed(() => activeLoans.value.length)
  const totalOverdueLoans = computed(() => overdueLoans.value.length)

  const loansByReader = computed(() => {
    const byReader: Record<string, Loan[]> = {}
    loans.value.forEach(loan => {
      const readerId = loan.lectorId
      if (!byReader[readerId]) {
        byReader[readerId] = []
      }
      byReader[readerId].push(loan)
    })
    return byReader
  })

  const fetchLoans = async (
    bibliotecaId: string, 
    page: number = 1, 
    limit: number = 10,
    status?: string
  ) => {
    loading.value = true
    error.value = null

    try {
      const response: PaginatedResponse<Loan> = await loansService.getLoans(
        bibliotecaId, 
        page, 
        limit, 
        status || filters.value.estado
      )

      if (response.success && response.data) {
        loans.value = response.data
        if (response.pagination) {
          pagination.value = response.pagination
        }
      } else {
        error.value = response.message || 'Error al cargar préstamos'
      }
    } catch (err) {
      console.error('Error fetching loans:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
    } finally {
      loading.value = false
    }
  }

  const fetchLoanById = async (loanId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await loansService.getLoanById(loanId)
      if (response.success && response.data) {
        currentLoan.value = response.data
      } else {
        error.value = response.message || 'Error al cargar préstamo'
      }
    } catch (err) {
      console.error('Error fetching loan:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
    } finally {
      loading.value = false
    }
  }

  const createLoan = async (loanData: CreateLoanRequest) => {
    loading.value = true
    error.value = null

    try {
      const response = await loansService.createLoan(loanData)
      if (response.success && response.data) {
        loans.value.unshift(response.data)
        return response.data
      } else {
        error.value = response.message || 'Error al crear préstamo'
        return null
      }
    } catch (err) {
      console.error('Error creating loan:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
      return null
    } finally {
      loading.value = false
    }
  }

  const createLoanFromScan = async (imageFile: File, bibliotecaId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await loansService.createLoanFromScan(imageFile, bibliotecaId)
      if (response.success && response.data) {
        loans.value.unshift(response.data)
        return response.data
      } else {
        error.value = response.message || 'Error al crear préstamo desde imagen'
        return null
      }
    } catch (err) {
      console.error('Error creating loan from scan:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateLoan = async (loanId: string, loanData: Partial<CreateLoanRequest>) => {
    loading.value = true
    error.value = null

    try {
      const response = await loansService.updateLoan(loanId, loanData)
      if (response.success && response.data) {
        const index = loans.value.findIndex(loan => loan.id === loanId)
        if (index !== -1) {
          loans.value[index] = response.data
        }
        if (currentLoan.value?.id === loanId) {
          currentLoan.value = response.data
        }
        return response.data
      } else {
        error.value = response.message || 'Error al actualizar préstamo'
        return null
      }
    } catch (err) {
      console.error('Error updating loan:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
      return null
    } finally {
      loading.value = false
    }
  }

  const returnLoan = async (loanId: string) => {
    return await updateLoan(loanId, { 
      fechaDevolucionEsperada: new Date().toISOString() 
    })
  }

  const deleteLoan = async (loanId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await loansService.deleteLoan(loanId)
      if (response.success) {
        loans.value = loans.value.filter(loan => loan.id !== loanId)
        if (currentLoan.value?.id === loanId) {
          currentLoan.value = null
        }
        return true
      } else {
        error.value = response.message || 'Error al eliminar préstamo'
        return false
      }
    } catch (err) {
      console.error('Error deleting loan:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchActiveLoans = async (bibliotecaId: string) => {
    await fetchLoans(bibliotecaId, 1, 100, 'ACTIVO')
  }

  const fetchOverdueLoans = async (bibliotecaId: string) => {
    await fetchLoans(bibliotecaId, 1, 100, 'VENCIDO')
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentLoan = () => {
    currentLoan.value = null
  }

  const setFilter = (filterKey: keyof typeof filters.value, value: string) => {
    filters.value[filterKey] = value
  }

  const clearFilters = () => {
    filters.value = {
      estado: '',
      fechaInicio: '',
      fechaFin: ''
    }
  }

  return {
    // State
    loans,
    currentLoan,
    loading,
    error,
    pagination,
    filters,
    
    // Getters
    activeLoans,
    overdueLoans,
    returnedLoans,
    totalActiveLoans,
    totalOverdueLoans,
    loansByReader,
    
    // Actions
    fetchLoans,
    fetchLoanById,
    createLoan,
    createLoanFromScan,
    updateLoan,
    returnLoan,
    deleteLoan,
    fetchActiveLoans,
    fetchOverdueLoans,
    clearError,
    clearCurrentLoan,
    setFilter,
    clearFilters
  }
})