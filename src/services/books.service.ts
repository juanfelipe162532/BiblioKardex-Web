import { apiService, type CreateBookRequest, type Book, type PaginatedResponse, type ApiResponse } from './api'

export class BooksService {
  async getBooks(
    bibliotecaId: string, 
    page: number = 1, 
    limit: number = 10, 
    search?: string
  ): Promise<PaginatedResponse<Book>> {
    return apiService.getBooks(bibliotecaId, page, limit, search)
  }

  async getBookById(bookId: string): Promise<ApiResponse<Book>> {
    return apiService.getBookById(bookId)
  }

  async createBook(bookData: CreateBookRequest): Promise<ApiResponse<Book>> {
    return apiService.createBook(bookData)
  }

  async updateBook(bookId: string, bookData: Partial<CreateBookRequest>): Promise<ApiResponse<Book>> {
    return apiService.updateBook(bookId, bookData)
  }

  async deleteBook(bookId: string): Promise<ApiResponse> {
    return apiService.deleteBook(bookId)
  }

  async searchBooks(query: string, bibliotecaId: string): Promise<PaginatedResponse<Book>> {
    return this.getBooks(bibliotecaId, 1, 20, query)
  }

  async getAvailableBooks(bibliotecaId: string): Promise<PaginatedResponse<Book>> {
    // Filtrar libros disponibles en el frontend o agregar parámetro al backend
    return this.getBooks(bibliotecaId, 1, 100)
  }
}

export const booksService = new BooksService()