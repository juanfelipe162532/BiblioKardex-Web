<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold text--primary">Informes y Reportes</h1>
      <p class="text-body-1 text--secondary mt-1">Analiza el rendimiento de tu biblioteca</p>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col v-for="(stat, index) in stats" :key="index" cols="12" sm="6" md="3">
        <v-card class="stat-card pa-4 text-center" elevation="2">
          <v-icon :color="stat.color" size="40" class="mb-3">{{ stat.icon }}</v-icon>
          <h2 class="text-h4 font-weight-bold text--primary mb-1">{{ stat.value }}</h2>
          <p class="text-body-2 text--secondary mb-2">{{ stat.label }}</p>
          <v-chip 
            :color="stat.trend === 'up' ? 'success' : 'error'" 
            small 
            text-color="white"
          >
            <v-icon left small>{{ stat.trend === 'up' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}</v-icon>
            {{ stat.change }}
          </v-chip>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts Section -->
    <v-row class="mb-6">
      <!-- Loans Chart -->
      <v-col cols="12" md="8">
        <v-card elevation="2">
          <v-card-title>
            <span class="text-h6">Préstamos por Mes</span>
            <v-spacer />
            <v-btn-toggle v-model="chartPeriod" mandatory dense>
              <v-btn small>6M</v-btn>
              <v-btn small>1A</v-btn>
              <v-btn small>Todo</v-btn>
            </v-btn-toggle>
          </v-card-title>
          <v-card-text>
            <div class="chart-container">
              <div class="chart-placeholder">
                <v-icon size="48" color="grey lighten-1">mdi-chart-line</v-icon>
                <p class="text-body-1 text--secondary mt-2">Gráfico de préstamos por mes</p>
                <p class="text-caption text--secondary">Simulación de datos</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Categories Pie Chart -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="h-100">
          <v-card-title>
            <span class="text-h6">Categorías Populares</span>
          </v-card-title>
          <v-card-text>
            <div class="categories-list">
              <div 
                v-for="(category, index) in categories" 
                :key="index"
                class="category-item d-flex align-center mb-3"
              >
                <div 
                  class="category-color mr-3"
                  :style="{ backgroundColor: category.color }"
                />
                <div class="flex-grow-1">
                  <p class="text-body-2 font-weight-medium mb-0">{{ category.name }}</p>
                  <p class="text-caption text--secondary">{{ category.count }} libros</p>
                </div>
                <div class="text-right">
                  <p class="text-h6 font-weight-bold text--primary">{{ category.percentage }}%</p>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Activity and Top Books -->
    <v-row class="mb-6">
      <!-- Recent Loans -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="h-100">
          <v-card-title>
            <span class="text-h6">Préstamos Recientes</span>
            <v-spacer />
            <v-btn text small color="primary">Ver todos</v-btn>
          </v-card-title>
          <v-card-text class="pa-0">
            <v-list>
              <v-list-item
                v-for="(loan, index) in recentLoans"
                :key="index"
                class="loan-item"
              >
                <template #prepend>
                  <v-avatar :color="loan.status === 'active' ? 'warning' : 'success'" size="36">
                    <v-icon color="white" small>
                      {{ loan.status === 'active' ? 'mdi-clock' : 'mdi-check' }}
                    </v-icon>
                  </v-avatar>
                </template>

                <v-list-item-content>
                  <v-list-item-title class="font-weight-medium">{{ loan.book }}</v-list-item-title>
                  <v-list-item-subtitle>{{ loan.user }} • {{ loan.date }}</v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                  <v-chip 
                    :color="loan.status === 'active' ? 'warning' : 'success'" 
                    small 
                    text-color="white"
                  >
                    {{ loan.status === 'active' ? 'Activo' : 'Devuelto' }}
                  </v-chip>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Top Books -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="h-100">
          <v-card-title>
            <span class="text-h6">Libros Más Prestados</span>
            <v-spacer />
            <v-btn text small color="primary">Ver todos</v-btn>
          </v-card-title>
          <v-card-text class="pa-0">
            <v-list>
              <v-list-item
                v-for="(book, index) in topBooks"
                :key="index"
                class="book-item"
              >
                <template #prepend>
                  <div class="ranking-number">
                    <span class="text-h6 font-weight-bold text--primary">{{ index + 1 }}</span>
                  </div>
                </template>

                <v-list-item-content>
                  <v-list-item-title class="font-weight-medium">{{ book.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ book.author }}</v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                  <div class="text-right">
                    <p class="text-h6 font-weight-bold text--primary mb-0">{{ book.loans }}</p>
                    <p class="text-caption text--secondary">préstamos</p>
                  </div>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Export Section -->
    <v-card elevation="2">
      <v-card-title>
        <span class="text-h6">Exportar Reportes</span>
      </v-card-title>
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="3">
            <v-select
              v-model="exportType"
              :items="exportTypes"
              label="Tipo de reporte"
              outlined
              dense
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="exportFormat"
              :items="exportFormats"
              label="Formato"
              outlined
              dense
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="dateFrom"
                  label="Desde"
                  type="date"
                  outlined
                  dense
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="dateTo"
                  label="Hasta"
                  type="date"
                  outlined
                  dense
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" md="2">
            <v-btn 
              color="primary" 
              block 
              large 
              class="text-none"
              @click="exportReport"
            >
              <v-icon left>mdi-download</v-icon>
              Exportar
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const chartPeriod = ref(0)
const exportType = ref('Préstamos')
const exportFormat = ref('PDF')
const dateFrom = ref('')
const dateTo = ref('')

const stats = [
  {
    label: 'Total Préstamos',
    value: '1,248',
    icon: 'mdi-book-multiple',
    color: '#1E3A8A',
    trend: 'up',
    change: '+12%'
  },
  {
    label: 'Préstamos Activos',
    value: '187',
    icon: 'mdi-clock',
    color: '#F59E0B',
    trend: 'up',
    change: '+5%'
  },
  {
    label: 'Devoluciones',
    value: '1,061',
    icon: 'mdi-keyboard-return',
    color: '#059669',
    trend: 'up',
    change: '+8%'
  },
  {
    label: 'Usuarios Activos',
    value: '342',
    icon: 'mdi-account-group',
    color: '#7C3AED',
    trend: 'down',
    change: '-2%'
  }
]

const categories = [
  { name: 'Literatura', count: 156, percentage: 35, color: '#1E3A8A' },
  { name: 'Ciencias', count: 98, percentage: 22, color: '#059669' },
  { name: 'Historia', count: 87, percentage: 19, color: '#F59E0B' },
  { name: 'Arte', count: 54, percentage: 12, color: '#7C3AED' },
  { name: 'Otros', count: 52, percentage: 12, color: '#64748B' }
]

const recentLoans = [
  {
    book: 'Cien años de soledad',
    user: 'María García',
    date: 'Hace 2 horas',
    status: 'active'
  },
  {
    book: 'El Quijote',
    user: 'Carlos López',
    date: 'Hace 3 horas',
    status: 'returned'
  },
  {
    book: '1984',
    user: 'Ana Martínez',
    date: 'Hace 1 día',
    status: 'active'
  },
  {
    book: 'Rayuela',
    user: 'Pedro Sánchez',
    date: 'Hace 2 días',
    status: 'returned'
  }
]

const topBooks = [
  {
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    loans: 24
  },
  {
    title: 'El Quijote',
    author: 'Miguel de Cervantes',
    loans: 18
  },
  {
    title: '1984',
    author: 'George Orwell',
    loans: 16
  },
  {
    title: 'Rayuela',
    author: 'Julio Cortázar',
    loans: 14
  }
]

const exportTypes = ['Préstamos', 'Usuarios', 'Inventario', 'Estadísticas']
const exportFormats = ['PDF', 'Excel', 'CSV']

const exportReport = () => {
  // TODO: Implement export functionality
  console.log('Exporting report:', {
    type: exportType.value,
    format: exportFormat.value,
    dateFrom: dateFrom.value,
    dateTo: dateTo.value
  })
}
</script>

<style scoped>
.stat-card {
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #64748B;
}

.category-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.category-item,
.loan-item,
.book-item {
  padding: 12px 16px;
}

.ranking-number {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F8FAFC;
  border-radius: 50%;
  margin-right: 16px;
}
</style>