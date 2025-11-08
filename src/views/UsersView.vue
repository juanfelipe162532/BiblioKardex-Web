<template>
  <div class="users-container">
    <!-- Modern Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">Gestión de Usuarios</h1>
          <p class="page-subtitle">Administra los usuarios frecuentes de tu biblioteca</p>
        </div>
        <!-- Botón de nuevo usuario ocultado -->
      </div>
    </div>

    <!-- Search and Filters Section -->
    <div class="content-section">
      <div class="filters-card">
        <div class="filters-header">
          <h3 class="filters-title">Buscar y Filtrar</h3>
          <p class="filters-subtitle">Encuentra usuarios rápidamente</p>
        </div>
        <div class="filters-content">
          <div class="search-field">
            <v-text-field
              v-model="search"
              placeholder="Buscar por nombre o email..."
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
            >
              <template #prepend-inner>
                <v-icon color="grey-darken-1">mdi-magnify</v-icon>
              </template>
            </v-text-field>
          </div>
          <div class="filter-selects">
            <v-select
              v-model="filterType"
              :items="filterOptions"
              label="Tipo de usuario"
              variant="outlined"
              density="comfortable"
              hide-details
            />
            <v-select
              v-model="sortBy"
              :items="sortOptions"
              label="Ordenar por"
              variant="outlined"
              density="comfortable"
              hide-details
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Users Grid Section -->
    <div class="content-section">
      <div class="section-header">
        <h2 class="section-title">Usuarios Registrados</h2>
        <div class="users-count">
          <v-chip variant="tonal" color="primary" size="small">
            {{ filteredUsers.length }} usuario{{ filteredUsers.length !== 1 ? 's' : '' }}
          </v-chip>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <v-progress-circular indeterminate color="primary" size="40"></v-progress-circular>
        <p class="loading-text">Cargando usuarios...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <v-alert type="error" variant="tonal" class="error-alert">
          <div class="error-content">
            <v-icon start>mdi-alert-circle</v-icon>
            <div>
              <strong>Error al cargar usuarios</strong>
              <p>{{ error }}</p>
            </div>
          </div>
          <template #append>
            <v-btn variant="text" size="small" @click="loadData">
              <v-icon start>mdi-refresh</v-icon>
              Reintentar
            </v-btn>
          </template>
        </v-alert>
      </div>

      <!-- Users Grid -->
      <div v-else-if="filteredUsers.length > 0" class="users-grid">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="user-card"
        >
          <div class="user-avatar-section">
            <div class="user-avatar" :style="`background: ${user.color}`">
              <span class="avatar-text">{{ getUserInitials(user.name) }}</span>
            </div>
            <div class="user-status">
              <v-chip
                :color="getTypeColor(user.type)"
                variant="tonal"
                size="small"
                class="type-chip"
              >
                {{ user.type }}
              </v-chip>
            </div>
          </div>

          <div class="user-info">
            <h3 class="user-name">{{ user.name }}</h3>
            <p class="user-cedula">Cédula: {{ getReaderCedula(user.id) }}</p>
            <p class="user-phone">{{ user.phone }}</p>
            <p v-if="user.email !== 'Sin email'" class="user-email">{{ user.email }}</p>
          </div>

          <div class="user-meta">
            <p class="last-loan">Último préstamo: {{ user.lastLoan }}</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!isLoading" class="empty-state">
        <div class="empty-icon">
          <v-icon size="64" color="grey-lighten-1">mdi-account-group-outline</v-icon>
        </div>
        <h3 class="empty-title">No se encontraron usuarios</h3>
        <p class="empty-subtitle">
          {{ search ? 'Intenta con otros términos de búsqueda' : 'Cuando registres lectores aparecerán aquí' }}
        </p>
        <!-- Acción para agregar usuario oculta -->
      </div>
    </div>

    <!-- Add User Dialog -->
    <v-dialog v-model="showAddDialog" max-width="600" persistent>
      <v-card class="dialog-card">
        <v-card-title class="dialog-header">
          <div class="dialog-icon">
            <v-icon color="primary">mdi-account-plus</v-icon>
          </div>
          <div class="dialog-text">
            <h2 class="dialog-title">Agregar Usuario</h2>
            <p class="dialog-subtitle">Registra un nuevo usuario recurrente</p>
          </div>
        </v-card-title>

        <v-card-text class="dialog-content">
          <v-form ref="form" v-model="valid">
            <div class="form-row">
              <v-text-field
                v-model="newUser.name"
                label="Nombre completo"
                :rules="nameRules"
                variant="outlined"
                required
              />
            </div>
            <div class="form-row">
              <v-text-field
                v-model="newUser.cedula"
                label="Cédula"
                :rules="cedulaRules"
                variant="outlined"
                required
              />
            </div>
            <div class="form-row">
              <v-text-field
                v-model="newUser.phone"
                label="Teléfono"
                :rules="phoneRules"
                variant="outlined"
                required
              />
            </div>
            <div class="form-row">
              <v-text-field
                v-model="newUser.email"
                label="Correo electrónico (opcional)"
                :rules="emailOptionalRules"
                variant="outlined"
              />
            </div>
            <div class="form-row">
              <v-text-field
                v-model="newUser.direccion"
                label="Dirección"
                :rules="direccionRules"
                variant="outlined"
                required
              />
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-btn
            variant="text"
            color="grey-darken-1"
            @click="showAddDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :disabled="!valid"
            @click="addUser"
          >
            <v-icon start>mdi-check</v-icon>
            Agregar Usuario
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useReadersStore, useAuthStore } from '@/stores'
import type { Reader } from '@/services/api'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  type: string
  color: string
  loansCount: number
  activeLoans: number
  lastLoan: string
}

const showAddDialog = ref(false)
const search = ref('')
const filterType = ref('Todos')
const sortBy = ref('Nombre')
const valid = ref(false)

const newUser = ref({
  name: '',
  email: '',
  phone: '',
  cedula: '',
  direccion: ''
})

const readersStore = useReadersStore()
const authStore = useAuthStore()

const isLoading = computed(() => readersStore.loading)
const error = computed(() => readersStore.error)

const filterOptions = ['Todos']
const sortOptions = ['Nombre', 'Fecha de creación', 'Préstamos']
const userTypes = ['Lector']

const nameRules = [
  (v: string) => !!v || 'El nombre es requerido',
  (v: string) => v.length >= 3 || 'El nombre debe tener al menos 3 caracteres'
]

const cedulaRules = [
  (v: string) => !!v || 'La cédula es requerida',
  (v: string) => v.length >= 3 || 'La cédula debe tener al menos 3 caracteres'
]

const phoneRules = [
  (v: string) => !!v || 'El teléfono es requerido',
  (v: string) => v.length >= 3 || 'El teléfono debe tener al menos 3 caracteres'
]

const direccionRules = [
  (v: string) => !!v || 'La dirección es requerida',
  (v: string) => v.length >= 3 || 'La dirección debe tener al menos 3 caracteres'
]

const emailOptionalRules = [
  (v: string) => !v || /.+@.+\..+/.test(v) || 'Correo inválido'
]

const users = computed(() => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
  ]
  
  return readersStore.readers.map((reader: any, index: number): User => ({
    id: reader.id,
    name: reader.nombreCompleto || reader.nombre || 'Sin nombre',
    email: reader.email || 'Sin email',
    phone: reader.celular || reader.telefono,
    type: reader.tipo || 'Lector',
    color: gradients[index % gradients.length],
    loansCount: reader.totalPrestamos || 0,
    activeLoans: reader.prestamosActivos || 0,
    lastLoan: formatRelativeTime(reader.fechaCreacion)
  }))
})

const filteredUsers = computed(() => {
  let filtered = users.value

  if (search.value) {
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(search.value.toLowerCase()) ||
      user.email.toLowerCase().includes(search.value.toLowerCase())
    )
  }

  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'Fecha de creación':
        return new Date(b.lastLoan).getTime() - new Date(a.lastLoan).getTime()
      case 'Préstamos':
        return b.loansCount - a.loansCount
      default:
        return a.name.localeCompare(b.name)
    }
  })

  return filtered
})

const getUserInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(p => p.length > 0)
  if (parts.length === 0) return 'U'
  const first = parts[0][0]
  const second = parts.length > 1 ? parts[1][0] : ''
  return (first + second).toUpperCase()
}

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'ESTUDIANTE': 'blue',
    'PROFESOR': 'purple',
    'EXTERNO': 'green',
    'Lector': 'blue'
  }
  return colors[type] || 'blue'
}

const getReaderCedula = (userId: string): string => {
  const reader: any = readersStore.readers.find((r: any) => r.id === userId)
  return reader?.cedula || reader?.identificacion || 'N/A'
}

const formatRelativeTime = (dateString?: string): string => {
  if (!dateString) return 'Fecha desconocida'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Fecha inválida'
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 7) return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  if (days >= 1) return days === 1 ? 'Ayer' : `Hace ${days} días`
  if (hours >= 1) return `Hace ${hours} horas`
  return `Hace ${minutes} minutos`
}

const addUser = async () => {
  if (!authStore.user?.bibliotecaId) {
    readersStore.error = 'No se puede determinar la biblioteca'
    return
  }

  const readerData: import('@/services/api').CreateReaderRequest = {
    nombre: newUser.value.name,
    email: newUser.value.email,
    telefono: newUser.value.phone || undefined,
    identificacion: newUser.value.cedula,
    tipo: 'EXTERNO',
    bibliotecaId: authStore.user.bibliotecaId
  }

  const created = await readersStore.createReader(readerData)
  if (created) {
    newUser.value = {
      name: '',
      email: '',
      phone: '',
      cedula: '',
      direccion: ''
    }
    showAddDialog.value = false
    // Reload data
    loadData()
  }
}

const viewUser = (user: User) => {
  console.log('View user:', user)
}

const editUser = (user: User) => {
  console.log('Edit user:', user)
}

const deleteUser = async (user: User) => {
  if (confirm(`¿Está seguro de que desea eliminar a ${user.name}?`)) {
    await readersStore.deleteReader(user.id)
  }
}

const loadData = async () => {
  if (authStore.user?.bibliotecaId) {
    await readersStore.fetchReaders(authStore.user.bibliotecaId, 1, 100)
  }
}

onMounted(() => {
  loadData()
})

// Watch for search changes (debounced)
let searchDebounce: number | undefined
watch(search, (newSearch: string) => {
  const bibliotecaId = authStore.user?.bibliotecaId
  if (!bibliotecaId) return
  if (searchDebounce) window.clearTimeout(searchDebounce)
  searchDebounce = window.setTimeout(() => {
    if (newSearch) {
      readersStore.searchReaders(newSearch, bibliotecaId)
    } else {
      readersStore.fetchReaders(bibliotecaId, 1, 100)
    }
  }, 500)
})

// Watch for filter changes
watch(filterType, () => {
  if (authStore.user?.bibliotecaId) {
    if (filterType.value !== 'Todos') {
      readersStore.fetchReadersByType(filterType.value, authStore.user.bibliotecaId)
    } else {
      readersStore.fetchReaders(authStore.user.bibliotecaId, 1, 100)
    }
  }
})
</script>

<style scoped>
/* Container */
.users-container {
  min-height: 100vh;
  background: #F8FAFC;
}

/* Header */
.header-section {
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  padding: 32px 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
  font-weight: 800;
  font-size: clamp(24px, 2.4vw, 32px);
  color: #ffffff;
}

.page-subtitle {
  margin: 4px 0 0 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
}

.add-btn {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-transform: none;
  font-weight: 600;
}

/* Content */
.content-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* Filters */
.filters-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
  border: 1px solid #E2E8F0;
}

.filters-header {
  margin-bottom: 20px;
}

.filters-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1E293B;
}

.filters-subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #64748B;
}

.filters-content {
  display: grid;
  gap: 16px;
}

.search-field {
  grid-column: 1 / -1;
}

.filter-selects {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1E293B;
}

/* Users Grid */
.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.user-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #E2E8F0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
  border-color: #CBD5E1;
}

.user-avatar-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar-text {
  color: #ffffff;
  font-weight: 700;
  font-size: 18px;
}

.type-chip {
  font-weight: 600;
  font-size: 11px;
}

.user-info {
  margin-bottom: 20px;
}

.user-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1E293B;
}

.user-cedula {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #64748B;
  font-weight: 500;
}

.user-phone {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #64748B;
}

.user-email {
  margin: 0;
  font-size: 12px;
  color: #94A3B8;
}

.user-stats {
  display: flex;
  align-items: center;
  background: #F8FAFC;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 800;
  color: #1E293B;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #64748B;
  margin-top: 2px;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #E2E8F0;
  margin: 0 16px;
}

.user-meta {
  margin-bottom: 20px;
}

.last-loan {
  margin: 0;
  font-size: 13px;
  color: #64748B;
}

.user-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px 24px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #E2E8F0;
}

.loading-text {
  margin: 0;
  color: #64748B;
  font-size: 14px;
}

/* Error State */
.error-state {
  margin-bottom: 24px;
}

.error-alert {
  border-radius: 16px;
}

.error-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.error-content p {
  margin: 4px 0 0 0;
  font-size: 14px;
  opacity: 0.8;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 24px;
  background: #ffffff;
  border-radius: 20px;
  border: 2px dashed #E2E8F0;
}

.empty-icon {
  margin-bottom: 16px;
}

.empty-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1E293B;
}

.empty-subtitle {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #64748B;
}

/* Dialog */
.dialog-card {
  border-radius: 20px;
  overflow: hidden;
}

.dialog-header {
  padding: 24px;
  background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%);
  display: flex;
  align-items: center;
  gap: 16px;
}

.dialog-icon {
  width: 48px;
  height: 48px;
  background: #ffffff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dialog-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1E293B;
}

.dialog-subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #64748B;
}

.dialog-content {
  padding: 24px;
}

.form-row {
  margin-bottom: 16px;
}

.dialog-actions {
  padding: 16px 24px 24px 24px;
  gap: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .filter-selects {
    grid-template-columns: 1fr;
  }

  .users-grid {
    grid-template-columns: 1fr;
  }

  .user-actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .content-section {
    padding: 16px;
  }

  .filters-card {
    padding: 16px;
    border-radius: 16px;
  }

  .user-card {
    padding: 20px;
    border-radius: 16px;
  }
}
</style>
