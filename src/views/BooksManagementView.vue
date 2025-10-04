<template>
  <div class="books-management">
    <!-- Header with Actions -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">Gestión de Libros</h1>
          <p class="page-subtitle">Administra el inventario de tu biblioteca</p>
        </div>
        <div class="header-actions">
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="showCreateDialog = true"
          >
            Agregar Libro
          </v-btn>
          <v-btn
            color="secondary"
            prepend-icon="mdi-camera"
            @click="showScanDialog = true"
          >
            Escanear Libro
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <v-card class="search-section" flat>
      <v-card-text>
        <div class="search-controls">
          <v-text-field
            v-model="searchQuery"
            placeholder="Buscar libros por título, autor o ISBN..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            hide-details
            clearable
            @input="performSearch"
            class="search-field"
          />
          <v-select
            v-model="selectedCategory"
            :items="categories"
            label="Categoría"
            variant="outlined"
            hide-details
            clearable
            @update:model-value="applyFilters"
          />
          <v-select
            v-model="availabilityFilter"
            :items="availabilityOptions"
            label="Disponibilidad"
            variant="outlined"
            hide-details
            clearable
            @update:model-value="applyFilters"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Books Grid -->
    <div class="books-content">
      <div v-if="booksStore.loading" class="loading-section">
        <v-progress-circular indeterminate color="primary" size="40" />
        <p>Cargando libros...</p>
      </div>

      <div v-else-if="booksStore.error" class="error-section">
        <v-alert type="error" variant="outlined">
          {{ booksStore.error }}
          <template #append>
            <v-btn size="small" @click="retryLoad">Reintentar</v-btn>
          </template>
        </v-alert>
      </div>

      <div v-else-if="booksStore.books.length === 0" class="empty-section">
        <v-icon size="64" color="grey-lighten-2">mdi-book-outline</v-icon>
        <h3>No hay libros</h3>
        <p>Comienza agregando tu primer libro al inventario</p>
        <v-btn color="primary" @click="showCreateDialog = true">
          Agregar Libro
        </v-btn>
      </div>

      <div v-else class="books-grid">
        <v-card
          v-for="book in booksStore.books"
          :key="book.id"
          class="book-card"
          hover
          @click="selectBook(book)"
        >
          <v-card-title class="book-title">{{ book.titulo }}</v-card-title>
          <v-card-subtitle class="book-author">{{ book.autor }}</v-card-subtitle>
          
          <v-card-text>
            <div class="book-details">
              <div v-if="book.categoria" class="book-category">
                <v-chip size="small" color="primary" variant="outlined">
                  {{ book.categoria }}
                </v-chip>
              </div>
              <div class="book-status">
                <v-chip
                  :color="book.disponible ? 'success' : 'warning'"
                  size="small"
                  variant="flat"
                >
                  {{ book.disponible ? 'Disponible' : 'Prestado' }}
                </v-chip>
              </div>
              <div v-if="book.isbn" class="book-isbn">
                <small class="text-medium-emphasis">ISBN: {{ book.isbn }}</small>
              </div>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-btn
              size="small"
              variant="text"
              @click.stop="editBook(book)"
            >
              Editar
            </v-btn>
            <v-btn
              size="small"
              variant="text"
              color="error"
              @click.stop="confirmDelete(book)"
            >
              Eliminar
            </v-btn>
            <v-spacer />
            <v-btn
              v-if="book.disponible"
              size="small"
              color="primary"
              variant="text"
              @click.stop="createLoanForBook(book)"
            >
              Prestar
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>

      <!-- Pagination -->
      <div v-if="booksStore.pagination.totalPages > 1" class="pagination-section">
        <v-pagination
          v-model="currentPage"
          :length="booksStore.pagination.totalPages"
          @update:model-value="loadBooks"
        />
      </div>
    </div>

    <!-- Create/Edit Book Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title>
          {{ editingBook ? 'Editar Libro' : 'Agregar Nuevo Libro' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="bookForm" v-model="formValid">
            <v-text-field
              v-model="bookForm.titulo"
              label="Título *"
              :rules="[v => !!v || 'El título es requerido']"
              variant="outlined"
              required
            />
            <v-text-field
              v-model="bookForm.autor"
              label="Autor *"
              :rules="[v => !!v || 'El autor es requerido']"
              variant="outlined"
              required
            />
            <v-text-field
              v-model="bookForm.isbn"
              label="ISBN"
              variant="outlined"
            />
            <v-select
              v-model="bookForm.categoria"
              :items="categories"
              label="Categoría"
              variant="outlined"
            />
            <v-textarea
              v-model="bookForm.descripcion"
              label="Descripción"
              variant="outlined"
              rows="3"
            />
            <v-text-field
              v-model="bookForm.ubicacion"
              label="Ubicación en biblioteca"
              variant="outlined"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeBookDialog">Cancelar</v-btn>
          <v-btn
            color="primary"
            :loading="booksStore.loading"
            :disabled="!formValid"
            @click="saveBook"
          >
            {{ editingBook ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Scan Book Dialog -->
    <v-dialog v-model="showScanDialog" max-width="500">
      <v-card>
        <v-card-title>Escanear Libro con IA</v-card-title>
        
        <v-card-text>
          <div class="scan-section">
            <v-file-input
              v-model="selectedImage"
              label="Seleccionar imagen del libro"
              accept="image/*"
              prepend-icon="mdi-camera"
              variant="outlined"
              @change="previewImage"
            />
            
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="Preview" class="preview-image" />
            </div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeScanDialog">Cancelar</v-btn>
          <v-btn
            color="primary"
            :loading="analysisStore.isAnalyzing"
            :disabled="!selectedImage"
            @click="analyzeBook"
          >
            Analizar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar "{{ bookToDelete?.titulo }}"?
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showDeleteDialog = false">Cancelar</v-btn>
          <v-btn
            color="error"
            :loading="booksStore.loading"
            @click="deleteBook"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  useBooksStore, 
  useAuthStore, 
  useAnalysisStore,
  useLoansStore 
} from '@/stores'
import type { Book, CreateBookRequest } from '@/services'

const router = useRouter()
const authStore = useAuthStore()
const booksStore = useBooksStore()
const analysisStore = useAnalysisStore()
const loansStore = useLoansStore()

// Reactive state
const searchQuery = ref('')
const selectedCategory = ref('')
const availabilityFilter = ref('')
const currentPage = ref(1)
const showCreateDialog = ref(false)
const showScanDialog = ref(false)
const showDeleteDialog = ref(false)
const formValid = ref(false)
const editingBook = ref<Book | null>(null)
const bookToDelete = ref<Book | null>(null)
const selectedImage = ref<File[]>([])
const imagePreview = ref<string>('')

// Form data
const bookForm = ref<CreateBookRequest>({
  titulo: '',
  autor: '',
  isbn: '',
  categoria: '',
  descripcion: '',
  ubicacion: '',
  bibliotecaId: ''
})

// Computed
const categories = computed(() => {
  const cats = new Set<string>()
  booksStore.books.forEach(book => {
    if (book.categoria) cats.add(book.categoria)
  })
  return Array.from(cats).sort()
})

const availabilityOptions = [
  { title: 'Disponible', value: 'disponible' },
  { title: 'Prestado', value: 'prestado' }
]

// Methods
const loadBooks = async () => {
  const bibliotecaId = authStore.user?.bibliotecaId
  if (!bibliotecaId) return
  
  await booksStore.fetchBooks(
    bibliotecaId,
    currentPage.value,
    10,
    searchQuery.value
  )
}

const performSearch = () => {
  currentPage.value = 1
  loadBooks()
}

const applyFilters = () => {
  currentPage.value = 1
  // Apply filters logic here
  loadBooks()
}

const retryLoad = () => {
  booksStore.clearError()
  loadBooks()
}

const selectBook = (book: Book) => {
  booksStore.currentBook = book
  // Navigate to book details if needed
}

const editBook = (book: Book) => {
  editingBook.value = book
  bookForm.value = {
    titulo: book.titulo,
    autor: book.autor,
    isbn: book.isbn || '',
    categoria: book.categoria || '',
    descripcion: '',
    ubicacion: '',
    bibliotecaId: book.bibliotecaId
  }
  showCreateDialog.value = true
}

const createLoanForBook = (book: Book) => {
  // Navigate to loan creation with pre-selected book
  router.push(`/loans/create?bookId=${book.id}`)
}

const confirmDelete = (book: Book) => {
  bookToDelete.value = book
  showDeleteDialog.value = true
}

const saveBook = async () => {
  if (!formValid.value) return
  
  const bibliotecaId = authStore.user?.bibliotecaId
  if (!bibliotecaId) return
  
  bookForm.value.bibliotecaId = bibliotecaId
  
  let result
  if (editingBook.value) {
    result = await booksStore.updateBook(editingBook.value.id, bookForm.value)
  } else {
    result = await booksStore.createBook(bookForm.value)
  }
  
  if (result) {
    closeBookDialog()
    // Show success message
  }
}

const deleteBook = async () => {
  if (!bookToDelete.value) return
  
  const success = await booksStore.deleteBook(bookToDelete.value.id)
  if (success) {
    showDeleteDialog.value = false
    bookToDelete.value = null
  }
}

const closeBookDialog = () => {
  showCreateDialog.value = false
  editingBook.value = null
  bookForm.value = {
    titulo: '',
    autor: '',
    isbn: '',
    categoria: '',
    descripcion: '',
    ubicacion: '',
    bibliotecaId: ''
  }
}

const closeScanDialog = () => {
  showScanDialog.value = false
  selectedImage.value = []
  imagePreview.value = ''
}

const previewImage = () => {
  if (selectedImage.value.length > 0) {
    const file = selectedImage.value[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const analyzeBook = async () => {
  if (selectedImage.value.length === 0) return
  
  const bibliotecaId = authStore.user?.bibliotecaId
  if (!bibliotecaId) return
  
  const result = await analysisStore.analyzeImage(selectedImage.value[0], bibliotecaId)
  
  if (result) {
    const bookData = await analysisStore.convertToBookData(result)
    bookForm.value = bookData
    closeScanDialog()
    showCreateDialog.value = true
  }
}

// Lifecycle
onMounted(() => {
  loadBooks()
})

watch(() => authStore.user?.bibliotecaId, (newId) => {
  if (newId) loadBooks()
})
</script>

<style scoped>
.books-management {
  min-height: 100vh;
  background-color: #f8fafc;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 24px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.page-subtitle {
  margin: 4px 0 0 0;
  color: #64748b;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-section {
  margin: 24px auto;
  max-width: 1200px;
}

.search-controls {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 16px;
  align-items: end;
}

.search-field {
  min-width: 300px;
}

.books-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 24px;
}

.loading-section,
.error-section,
.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px;
  text-align: center;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.book-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.book-title {
  font-weight: 600;
  font-size: 16px;
}

.book-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.scan-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.image-preview {
  display: flex;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .search-controls {
    grid-template-columns: 1fr;
  }

  .books-grid {
    grid-template-columns: 1fr;
  }
}
</style>