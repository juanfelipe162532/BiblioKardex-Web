// Export main API service
export { apiService } from './api'

// Export specialized services
export { booksService } from './books.service'
export { loansService } from './loans.service'
export { readersService } from './readers.service'
export { librariesService } from './libraries.service'
export { analysisService } from './analysis.service'

// Export types
export type {
  LoginRequest,
  LoginResponse,
  ApiError,
  Statistics,
  Book,
  Loan,
  Reader,
  CreateBookRequest,
  CreateLoanRequest,
  CreateReaderRequest,
  CreateLibraryRequest,
  ApiResponse,
  PaginatedResponse
} from './api'

export type { Library } from './libraries.service'
export type { AnalysisResult, AnalysisStatus } from './analysis.service'