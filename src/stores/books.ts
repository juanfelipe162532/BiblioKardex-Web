import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { booksService } from '@/services/books.service'
import { type Book, type CreateBookRequest, type PaginatedResponse } from '@/services/api'

export const useBooksStore = defineStore('books', () => {
  const books = ref<Book[]>([])
  const currentBook = ref<Book | null>(null)
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
    categoria: '',
    disponible: null as boolean | null
  })

  const availableBooks = computed(() => 
    books.value.filter(book => book.disponible)
  )

  const booksByCategory = computed(() => {
    const categories: Record<string, Book[]> = {}
    books.value.forEach(book => {
      const category = book.categoria || 'Sin categoría'
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(book)
    })
    return categories
  })

  const totalBooks = computed(() => books.value.length)
  const totalAvailable = computed(() => availableBooks.value.length)

  const fetchBooks = async (
    bibliotecaId: string, 
    page: number = 1, 
    limit: number = 10,
    search?: string
  ) => {
    loading.value = true
    error.value = null

    try {
      const response: PaginatedResponse<Book> = await booksService.getBooks(
        bibliotecaId, 
        page, 
        limit, 
        search || searchQuery.value
      )

      if (response.success && response.data) {
        books.value = response.data
        if (response.pagination) {
          pagination.value = response.pagination
        }
      } else {
        error.value = response.message || 'Error al cargar libros'
      }
    } catch (err) {
      console.error('Error fetching books:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
    } finally {
      loading.value = false
    }
  }

  const fetchBookById = async (bookId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await booksService.getBookById(bookId)
      if (response.success && response.data) {
        currentBook.value = response.data
      } else {
        error.value = response.message || 'Error al cargar libro'
      }
    } catch (err) {
      console.error('Error fetching book:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
    } finally {
      loading.value = false
    }
  }

  const createBook = async (bookData: CreateBookRequest) => {
    loading.value = true
    error.value = null

    try {
      const response = await booksService.createBook(bookData)
      if (response.success && response.data) {
        books.value.unshift(response.data)
        return response.data
      } else {
        error.value = response.message || 'Error al crear libro'
        return null
      }
    } catch (err) {
      console.error('Error creating book:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateBook = async (bookId: string, bookData: Partial<CreateBookRequest>) => {
    loading.value = true
    error.value = null

    try {
      const response = await booksService.updateBook(bookId, bookData)
      if (response.success && response.data) {
        const index = books.value.findIndex(book => book.id === bookId)
        if (index !== -1) {
          books.value[index] = response.data
        }
        if (currentBook.value?.id === bookId) {
          currentBook.value = response.data
        }
        return response.data
      } else {
        error.value = response.message || 'Error al actualizar libro'
        return null
      }
    } catch (err) {
      console.error('Error updating book:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteBook = async (bookId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await booksService.deleteBook(bookId)
      if (response.success) {
        books.value = books.value.filter(book => book.id !== bookId)
        if (currentBook.value?.id === bookId) {
          currentBook.value = null
        }
        return true
      } else {
        error.value = response.message || 'Error al eliminar libro'
        return false
      }
    } catch (err) {
      console.error('Error deleting book:', err)
      error.value = err instanceof Error ? err.message : 'Error de conexión'
      return false
    } finally {
      loading.value = false
    }
  }

  const searchBooks = async (query: string, bibliotecaId: string) => {
    searchQuery.value = query
    await fetchBooks(bibliotecaId, 1, pagination.value.limit, query)
  }

  const clearSearch = () => {
    searchQuery.value = ''
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentBook = () => {
    currentBook.value = null
  }

  return {
    // State
    books,
    currentBook,
    loading,
    error,
    pagination,
    searchQuery,
    filters,
    
    // Getters
    availableBooks,
    booksByCategory,
    totalBooks,
    totalAvailable,
    
    // Actions
    fetchBooks,
    fetchBookById,
    createBook,
    updateBook,
    deleteBook,
    searchBooks,
    clearSearch,
    clearError,
    clearCurrentBook
  }
})