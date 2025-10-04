<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text--primary">Usuarios Recurrentes</h1>
        <p class="text-body-1 text--secondary mt-1">Gestiona los usuarios frecuentes de tu biblioteca</p>
      </div>
      <v-btn
        color="primary"
        class="text-none"
        @click="showAddDialog = true"
      >
        <v-icon left>mdi-plus</v-icon>
        Agregar Usuario
      </v-btn>
    </div>

    <!-- Search and Filters -->
    <v-card class="mb-6" elevation="1">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              placeholder="Buscar usuarios..."
              prepend-inner-icon="mdi-magnify"
              outlined
              dense
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filterType"
              :items="filterOptions"
              label="Filtrar por tipo"
              outlined
              dense
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="sortBy"
              :items="sortOptions"
              label="Ordenar por"
              outlined
              dense
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Users List -->
    <v-row>
      <v-col
        v-for="user in filteredUsers"
        :key="user.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="user-card h-100" elevation="2" hover>
          <v-card-text class="text-center pa-4">
            <v-avatar size="64" :color="user.color" class="mb-3">
              <span class="text-h5 white--text font-weight-bold">
                {{ getUserInitials(user.name) }}
              </span>
            </v-avatar>
            
            <h3 class="text-h6 font-weight-bold text--primary mb-1">{{ user.name }}</h3>
            <p class="text-body-2 text--secondary mb-2">{{ user.email }}</p>
            
            <v-chip
              :color="getTypeColor(user.type)"
              small
              text-color="white"
              class="mb-3"
            >
              {{ user.type }}
            </v-chip>
            
            <div class="user-stats mb-3">
              <div class="d-flex justify-space-between text-center">
                <div class="flex-grow-1">
                  <p class="text-h6 font-weight-bold text--primary mb-0">{{ user.loansCount }}</p>
                  <p class="text-caption text--secondary">Préstamos</p>
                </div>
                <v-divider vertical class="mx-2" />
                <div class="flex-grow-1">
                  <p class="text-h6 font-weight-bold text--primary mb-0">{{ user.activeLoans }}</p>
                  <p class="text-caption text--secondary">Activos</p>
                </div>
              </div>
            </div>
            
            <p class="text-caption text--secondary">
              Último préstamo: {{ user.lastLoan }}
            </p>
          </v-card-text>

          <v-card-actions>
            <v-btn text small color="primary" @click="viewUser(user)">
              <v-icon left small>mdi-eye</v-icon>
              Ver
            </v-btn>
            <v-btn text small color="orange" @click="editUser(user)">
              <v-icon left small>mdi-pencil</v-icon>
              Editar
            </v-btn>
            <v-spacer />
            <v-btn text small color="red" @click="deleteUser(user)">
              <v-icon small>mdi-delete</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-card v-if="filteredUsers.length === 0" class="pa-8 text-center" elevation="1">
      <v-icon size="64" color="grey lighten-1" class="mb-4">mdi-account-group-outline</v-icon>
      <h2 class="text-h5 text--secondary mb-2">No se encontraron usuarios</h2>
      <p class="text-body-1 text--secondary">
        {{ search ? 'Intenta con otros términos de búsqueda' : 'Agrega tu primer usuario recurrente' }}
      </p>
      <v-btn v-if="!search" color="primary" class="mt-4" @click="showAddDialog = true">
        <v-icon left>mdi-plus</v-icon>
        Agregar Usuario
      </v-btn>
    </v-card>

    <!-- Add User Dialog -->
    <v-dialog v-model="showAddDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">Agregar Usuario Recurrente</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="newUser.name"
              label="Nombre completo"
              :rules="nameRules"
              outlined
              required
            />
            <v-text-field
              v-model="newUser.email"
              label="Correo electrónico"
              :rules="emailRules"
              outlined
              required
            />
            <v-text-field
              v-model="newUser.phone"
              label="Teléfono"
              outlined
            />
            <v-select
              v-model="newUser.type"
              :items="userTypes"
              label="Tipo de usuario"
              outlined
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showAddDialog = false">Cancelar</v-btn>
          <v-btn color="primary" :disabled="!valid" @click="addUser">Agregar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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
  type: 'Estudiante'
})

const users = ref<User[]>([
  {
    id: '1',
    name: 'María García',
    email: 'maria.garcia@email.com',
    type: 'Estudiante',
    color: 'blue',
    loansCount: 12,
    activeLoans: 2,
    lastLoan: 'Hace 2 días'
  },
  {
    id: '2',
    name: 'Carlos López',
    email: 'carlos.lopez@email.com',
    type: 'Profesor',
    color: 'green',
    loansCount: 24,
    activeLoans: 1,
    lastLoan: 'Hace 1 semana'
  },
  {
    id: '3',
    name: 'Ana Martínez',
    email: 'ana.martinez@email.com',
    type: 'Investigador',
    color: 'purple',
    loansCount: 8,
    activeLoans: 0,
    lastLoan: 'Hace 3 días'
  }
])

const filterOptions = ['Todos', 'Estudiante', 'Profesor', 'Investigador', 'Visitante']
const sortOptions = ['Nombre', 'Préstamos', 'Último préstamo']
const userTypes = ['Estudiante', 'Profesor', 'Investigador', 'Visitante']

const nameRules = [
  (v: string) => !!v || 'El nombre es requerido',
  (v: string) => v.length >= 2 || 'El nombre debe tener al menos 2 caracteres'
]

const emailRules = [
  (v: string) => !!v || 'El correo es requerido',
  (v: string) => /.+@.+\..+/.test(v) || 'Correo inválido'
]

const filteredUsers = computed(() => {
  let filtered = users.value

  // Filter by search
  if (search.value) {
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(search.value.toLowerCase()) ||
      user.email.toLowerCase().includes(search.value.toLowerCase())
    )
  }

  // Filter by type
  if (filterType.value !== 'Todos') {
    filtered = filtered.filter(user => user.type === filterType.value)
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'Préstamos':
        return b.loansCount - a.loansCount
      case 'Último préstamo':
        return new Date(b.lastLoan).getTime() - new Date(a.lastLoan).getTime()
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
    'Estudiante': 'blue',
    'Profesor': 'green',
    'Investigador': 'purple',
    'Visitante': 'orange'
  }
  return colors[type] || 'grey'
}

const addUser = () => {
  const colors = ['blue', 'green', 'purple', 'orange', 'red', 'indigo']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  
  users.value.push({
    id: Date.now().toString(),
    name: newUser.value.name,
    email: newUser.value.email,
    phone: newUser.value.phone,
    type: newUser.value.type,
    color: randomColor,
    loansCount: 0,
    activeLoans: 0,
    lastLoan: 'Nunca'
  })

  // Reset form
  newUser.value = {
    name: '',
    email: '',
    phone: '',
    type: 'Estudiante'
  }
  showAddDialog.value = false
}

const viewUser = (user: User) => {
  // TODO: Implement view user details
  console.log('View user:', user)
}

const editUser = (user: User) => {
  // TODO: Implement edit user
  console.log('Edit user:', user)
}

const deleteUser = (user: User) => {
  const index = users.value.findIndex(u => u.id === user.id)
  if (index > -1) {
    users.value.splice(index, 1)
  }
}
</script>

<style scoped>
.user-card {
  transition: transform 0.2s ease;
}

.user-card:hover {
  transform: translateY(-2px);
}

.user-stats {
  background: #F8FAFC;
  border-radius: 8px;
  padding: 12px;
}
</style>