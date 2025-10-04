import { apiService, type CreateLoanRequest, type Loan, type PaginatedResponse, type ApiResponse } from './api'

export class LoansService {
  async getLoans(
    bibliotecaId: string, 
    page: number = 1, 
    limit: number = 10, 
    status?: string
  ): Promise<PaginatedResponse<Loan>> {
    return apiService.getLoans(bibliotecaId, page, limit, status)
  }

  async getLoanById(loanId: string): Promise<ApiResponse<Loan>> {
    return apiService.getLoanById(loanId)
  }

  async createLoan(loanData: CreateLoanRequest): Promise<ApiResponse<Loan>> {
    return apiService.createLoan(loanData)
  }

  async createLoanFromScan(imageFile: File, bibliotecaId: string): Promise<ApiResponse<Loan>> {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('bibliotecaId', bibliotecaId)
    return apiService.createLoanFromScan(formData)
  }

  async updateLoan(loanId: string, loanData: Partial<CreateLoanRequest>): Promise<ApiResponse<Loan>> {
    return apiService.updateLoan(loanId, loanData)
  }

  async deleteLoan(loanId: string): Promise<ApiResponse> {
    return apiService.deleteLoan(loanId)
  }

  async returnLoan(loanId: string): Promise<ApiResponse<Loan>> {
    return this.updateLoan(loanId, { fechaDevolucionEsperada: new Date().toISOString() })
  }

  async getActiveLoans(bibliotecaId: string): Promise<PaginatedResponse<Loan>> {
    return this.getLoans(bibliotecaId, 1, 100, 'ACTIVO')
  }

  async getOverdueLoans(bibliotecaId: string): Promise<PaginatedResponse<Loan>> {
    return this.getLoans(bibliotecaId, 1, 100, 'VENCIDO')
  }
}

export const loansService = new LoansService()