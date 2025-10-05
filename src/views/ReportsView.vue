<template>
  <div class="reports-container">
    <!-- Modern Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">Informes y Reportes</h1>
          <p class="page-subtitle">Analiza el rendimiento y tendencias de tu biblioteca</p>
        </div>
        <div class="header-actions">
          <v-btn
            color="primary"
            variant="elevated"
            size="large"
            disabled
            title="Funcionalidad en desarrollo"
          >
            <v-icon start>mdi-download</v-icon>
            Exportar Reportes
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Key Metrics Section -->
    <div class="content-section">
      <div class="section-header">
        <h2 class="section-title">Métricas Principales</h2>
        <p class="section-subtitle">Indicadores clave de rendimiento</p>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <v-progress-circular indeterminate color="primary" size="40"></v-progress-circular>
        <p class="loading-text">Cargando métricas...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <v-alert type="error" variant="tonal" class="error-alert">
          <div class="error-content">
            <v-icon start>mdi-alert-circle</v-icon>
            <div>
              <strong>Error al cargar reportes</strong>
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
      
      <!-- Metrics Grid -->
      <div v-else class="metrics-grid">
        <div
          v-for="(metric, index) in metrics"
          :key="index"
          class="metric-card"
        >
          <div class="metric-icon" :style="`background: ${metric.color}20`">
            <v-icon :color="metric.color" size="24">{{ metric.icon }}</v-icon>
          </div>
          <div class="metric-content">
            <h3 class="metric-value">{{ metric.value }}</h3>
            <p class="metric-label">{{ metric.label }}</p>
            <div class="metric-trend">
              <v-icon 
                :color="metric.trend === 'up' ? 'success' : 'error'" 
                size="16"
              >
                {{ metric.trend === 'up' ? 'mdi-trending-up' : 'mdi-trending-down' }}
              </v-icon>
              <span 
                class="trend-text"
                :class="metric.trend === 'up' ? 'trend-up' : 'trend-down'"
              >
                {{ metric.change }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="content-section">
      <div class="section-header">
        <h2 class="section-title">Análisis Visual</h2>
        <p class="section-subtitle">Tendencias y distribuciones</p>
      </div>
      
      <div class="charts-row">
        <!-- Loans Trend Chart -->
        <div class="chart-card large-chart">
          <div class="chart-header">
            <h3 class="chart-title">Tendencia de Préstamos</h3>
            <div class="chart-controls">
              <v-btn-toggle
                v-model="chartPeriod"
                variant="outlined"
                density="compact"
                mandatory
              >
                <v-btn size="small">6M</v-btn>
                <v-btn size="small">1A</v-btn>
                <v-btn size="small">Todo</v-btn>
              </v-btn-toggle>
            </div>
          </div>
          <div class="chart-container">
            <canvas ref="loansChart" id="loansChart"></canvas>
          </div>
        </div>

        <!-- Categories Distribution -->
        <div class="chart-card small-chart">
          <div class="chart-header">
            <h3 class="chart-title">Distribución por Categorías</h3>
          </div>
          <div class="chart-container">
            <canvas ref="categoriesChart" id="categoriesChart"></canvas>
          </div>
        </div>
      </div>

      <div class="charts-row">
        <!-- Users Activity Chart -->
        <div class="chart-card medium-chart">
          <div class="chart-header">
            <h3 class="chart-title">Actividad de Usuarios</h3>
          </div>
          <div class="chart-container">
            <canvas ref="usersChart" id="usersChart"></canvas>
          </div>
        </div>

        <!-- Monthly Statistics -->
        <div class="chart-card medium-chart">
          <div class="chart-header">
            <h3 class="chart-title">Estadísticas Mensuales</h3>
          </div>
          <div class="chart-container">
            <canvas ref="monthlyChart" id="monthlyChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Tables Section -->
    <div class="content-section">
      <div class="section-header">
        <h2 class="section-title">Datos Detallados</h2>
        <p class="section-subtitle">Información específica y rankings</p>
      </div>
      
      <div class="tables-row">
        <!-- Recent Loans -->
        <div class="data-card">
          <div class="data-header">
            <h3 class="data-title">Préstamos Recientes</h3>
            <v-btn variant="text" color="primary" size="small">
              Ver todos
              <v-icon end size="16">mdi-arrow-right</v-icon>
            </v-btn>
          </div>
          <div class="data-content">
            <div
              v-for="(loan, index) in recentLoans"
              :key="index"
              class="data-item"
            >
              <div class="item-avatar">
                <div 
                  class="status-indicator"
                  :class="loan.status === 'active' ? 'status-active' : 'status-returned'"
                >
                  <v-icon size="14" color="white">
                    {{ loan.status === 'active' ? 'mdi-clock' : 'mdi-check' }}
                  </v-icon>
                </div>
              </div>
              <div class="item-content">
                <h4 class="item-title">{{ loan.book }}</h4>
                <p class="item-subtitle">{{ loan.user }} • {{ loan.date }}</p>
              </div>
              <div class="item-status">
                <v-chip
                  :color="loan.status === 'active' ? 'orange' : 'green'"
                  variant="tonal"
                  size="small"
                >
                  {{ loan.status === 'active' ? 'Activo' : 'Devuelto' }}
                </v-chip>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Books -->
        <div class="data-card">
          <div class="data-header">
            <h3 class="data-title">Libros Más Prestados</h3>
            <v-btn variant="text" color="primary" size="small">
              Ver todos
              <v-icon end size="16">mdi-arrow-right</v-icon>
            </v-btn>
          </div>
          <div class="data-content">
            <div
              v-for="(book, index) in topBooks"
              :key="index"
              class="data-item"
            >
              <div class="item-rank">
                <span class="rank-number">{{ index + 1 }}</span>
              </div>
              <div class="item-content">
                <h4 class="item-title">{{ book.title }}</h4>
                <p class="item-subtitle">{{ book.author }}</p>
              </div>
              <div class="item-stats">
                <span class="stat-value">{{ book.loans }}</span>
                <span class="stat-label">préstamos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Dialog -->
    <v-dialog v-model="showExportDialog" max-width="600" persistent>
      <v-card class="dialog-card">
        <v-card-title class="dialog-header">
          <div class="dialog-icon">
            <v-icon color="primary">mdi-download</v-icon>
          </div>
          <div class="dialog-text">
            <h2 class="dialog-title">Exportar Reportes</h2>
            <p class="dialog-subtitle">Genera reportes personalizados</p>
          </div>
        </v-card-title>

        <v-card-text class="dialog-content">
          <div class="form-row">
            <v-select
              v-model="exportType"
              :items="exportTypes"
              label="Tipo de reporte"
              variant="outlined"
              required
            />
          </div>
          <div class="form-row">
            <v-select
              v-model="exportFormat"
              :items="exportFormats"
              label="Formato de archivo"
              variant="outlined"
              required
            />
          </div>
          <div class="form-row-group">
            <div class="form-row">
              <v-text-field
                v-model="dateFrom"
                label="Fecha desde"
                type="date"
                variant="outlined"
              />
            </div>
            <div class="form-row">
              <v-text-field
                v-model="dateTo"
                label="Fecha hasta"
                type="date"
                variant="outlined"
              />
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-btn
            variant="text"
            color="grey-darken-1"
            @click="showExportDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="exportReport"
          >
            <v-icon start>mdi-download</v-icon>
            Exportar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'

Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement)

const showExportDialog = ref(false)
const chartPeriod = ref(0)
const exportType = ref('Préstamos')
const exportFormat = ref('PDF')
const dateFrom = ref('')
const dateTo = ref('')

const loansChart = ref<HTMLCanvasElement>()
const categoriesChart = ref<HTMLCanvasElement>()
const usersChart = ref<HTMLCanvasElement>()
const monthlyChart = ref<HTMLCanvasElement>()

const metrics = [
  {
    label: 'Total Préstamos',
    value: '1,248',
    icon: 'mdi-book-multiple',
    color: '#6366F1',
    trend: 'up',
    change: '+12% vs mes anterior'
  },
  {
    label: 'Préstamos Activos',
    value: '187',
    icon: 'mdi-clock-outline',
    color: '#F59E0B',
    trend: 'up',
    change: '+5% vs mes anterior'
  },
  {
    label: 'Devoluciones',
    value: '1,061',
    icon: 'mdi-keyboard-return',
    color: '#10B981',
    trend: 'up',
    change: '+8% vs mes anterior'
  },
  {
    label: 'Usuarios Activos',
    value: '342',
    icon: 'mdi-account-group',
    color: '#8B5CF6',
    trend: 'down',
    change: '-2% vs mes anterior'
  }
]

const recentLoans = [
  {
    book: 'Cien años de soledad',
    user: 'María García Pérez',
    date: 'Hace 2 horas',
    status: 'active'
  },
  {
    book: 'Don Quijote de La Mancha',
    user: 'Carlos López Silva',
    date: 'Hace 3 horas',
    status: 'returned'
  },
  {
    book: '1984',
    user: 'Ana Martínez Rodriguez',
    date: 'Hace 1 día',
    status: 'active'
  },
  {
    book: 'Rayuela',
    user: 'Pedro Sánchez Torres',
    date: 'Hace 2 días',
    status: 'returned'
  },
  {
    book: 'El Principito',
    user: 'Lucía Fernández',
    date: 'Hace 3 días',
    status: 'active'
  }
]

const topBooks = [
  {
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    loans: 24
  },
  {
    title: 'Don Quijote de La Mancha',
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
  },
  {
    title: 'El Principito',
    author: 'Antoine de Saint-Exupéry',
    loans: 12
  }
]

const exportTypes = ['Préstamos', 'Usuarios', 'Inventario', 'Estadísticas Generales']
const exportFormats = ['PDF', 'Excel', 'CSV']

const createCharts = async () => {
  await nextTick()
  
  // Loans Trend Chart
  if (loansChart.value) {
    new Chart(loansChart.value, {
      type: 'line',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [{
          label: 'Préstamos',
          data: [65, 78, 82, 91, 105, 118, 142, 135, 128, 156, 178, 195],
          borderColor: '#6366F1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#6366F1',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1F2937',
            titleColor: '#F9FAFB',
            bodyColor: '#F9FAFB',
            borderColor: '#374151',
            borderWidth: 1,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#F1F5F9' },
            ticks: { color: '#64748B', font: { size: 12 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#64748B', font: { size: 12 } }
          }
        }
      }
    })
  }

  // Categories Pie Chart
  if (categoriesChart.value) {
    new Chart(categoriesChart.value, {
      type: 'doughnut',
      data: {
        labels: ['Literatura', 'Ciencias', 'Historia', 'Arte', 'Biografías'],
        datasets: [{
          data: [35, 22, 19, 12, 12],
          backgroundColor: [
            '#6366F1',
            '#10B981',
            '#F59E0B',
            '#8B5CF6',
            '#64748B'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: { size: 11 },
              color: '#64748B'
            }
          },
          tooltip: {
            backgroundColor: '#1F2937',
            titleColor: '#F9FAFB',
            bodyColor: '#F9FAFB',
            borderColor: '#374151',
            borderWidth: 1,
            cornerRadius: 8
          }
        }
      }
    })
  }

  // Users Activity Chart
  if (usersChart.value) {
    new Chart(usersChart.value, {
      type: 'bar',
      data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [{
          label: 'Actividad',
          data: [42, 38, 45, 52, 48, 22, 15],
          backgroundColor: '#10B981',
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1F2937',
            titleColor: '#F9FAFB',
            bodyColor: '#F9FAFB',
            borderColor: '#374151',
            borderWidth: 1,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#F1F5F9' },
            ticks: { color: '#64748B', font: { size: 12 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#64748B', font: { size: 12 } }
          }
        }
      }
    })
  }

  // Monthly Statistics Chart
  if (monthlyChart.value) {
    new Chart(monthlyChart.value, {
      type: 'bar',
      data: {
        labels: ['Nuevos', 'Devueltos', 'Vencidos', 'Renovados'],
        datasets: [{
          label: 'Este mes',
          data: [45, 112, 8, 23],
          backgroundColor: [
            '#6366F1',
            '#10B981',
            '#EF4444',
            '#F59E0B'
          ],
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1F2937',
            titleColor: '#F9FAFB',
            bodyColor: '#F9FAFB',
            borderColor: '#374151',
            borderWidth: 1,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#F1F5F9' },
            ticks: { color: '#64748B', font: { size: 12 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#64748B', font: { size: 12 } }
          }
        }
      }
    })
  }
}

const exportReport = () => {
  // TODO: Implement when backend supports reports export
  console.log('Export functionality not available yet')
  showExportDialog.value = false
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* Container */
.reports-container {
  min-height: 100vh;
  background: #F8FAFC;
}

/* Header */
.header-section {
  background: linear-gradient(135deg, #1E3A8A 0%, #7C3AED 100%);
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

/* Content */
.content-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1E293B;
}

.section-subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #64748B;
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
  margin-bottom: 32px;
}

.loading-text {
  margin: 0;
  color: #64748B;
  font-size: 14px;
}

/* Error State */
.error-state {
  margin-bottom: 32px;
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

/* Metrics */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.metric-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  border-color: #CBD5E1;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-value {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 800;
  color: #1E293B;
}

.metric-label {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #64748B;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-text {
  font-size: 12px;
  font-weight: 600;
}

.trend-up { color: #059669; }
.trend-down { color: #DC2626; }

/* Charts */
.charts-row {
  display: grid;
  gap: 24px;
  margin-bottom: 24px;
}

.charts-row:first-child {
  grid-template-columns: 2fr 1fr;
}

.charts-row:last-child {
  grid-template-columns: 1fr 1fr;
}

.chart-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #E2E8F0;
  transition: all 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  border-color: #CBD5E1;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.chart-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1E293B;
}

.chart-container {
  position: relative;
  height: 280px;
  width: 100%;
}

.small-chart .chart-container {
  height: 280px;
}

.medium-chart .chart-container {
  height: 240px;
}

/* Data Tables */
.tables-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.data-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.data-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  border-color: #CBD5E1;
}

.data-header {
  padding: 20px;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.data-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1E293B;
}

.data-content {
  padding: 0;
}

.data-item {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #F1F5F9;
  transition: background-color 0.2s ease;
}

.data-item:last-child {
  border-bottom: none;
}

.data-item:hover {
  background: #F8FAFC;
}

.item-avatar .status-indicator {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-active {
  background: #F59E0B;
}

.status-returned {
  background: #10B981;
}

.item-rank {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #F8FAFC;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-number {
  font-size: 14px;
  font-weight: 700;
  color: #1E293B;
}

.item-content {
  flex: 1;
}

.item-title {
  margin: 0 0 2px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1E293B;
}

.item-subtitle {
  margin: 0;
  font-size: 12px;
  color: #64748B;
}

.item-stats {
  text-align: right;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #1E293B;
}

.stat-label {
  font-size: 11px;
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

.form-row-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.dialog-actions {
  padding: 16px 24px 24px 24px;
  gap: 12px;
}

/* Responsive */
@media (max-width: 1024px) {
  .charts-row:first-child {
    grid-template-columns: 1fr;
  }
  
  .charts-row:last-child {
    grid-template-columns: 1fr;
  }
  
  .tables-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row-group {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .content-section {
    padding: 16px;
  }
  
  .metric-card {
    padding: 16px;
  }
  
  .chart-card {
    padding: 16px;
  }
  
  .data-header {
    padding: 16px;
  }
  
  .data-item {
    padding: 12px 16px;
  }
}
</style>