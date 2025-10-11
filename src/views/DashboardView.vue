<template>
  <div class="dashboard-container">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-header">
          <div class="welcome-logo">
            <img 
              src="@/assets/logo.png" 
              alt="BiblioKardex Logo" 
              class="dashboard-logo"
            />
          </div>
          <div class="greeting">
            <h1 class="display-title">{{ libraryName }}</h1>
            <p class="subtitle">Resumen general</p>
          </div>
        </div>
      </div>
    </div>


    <!-- Statistics Section -->
    <div class="content-section">
      <div class="section-header">
        <h2 class="section-title">Resumen General</h2>
        <p class="section-subtitle">Estado actual de tu biblioteca</p>
      </div>
      
      <div v-if="!statisticsLoading" class="stats-grid">
        <div v-for="(stat, index) in statsCards" :key="index" class="stat-card">
          <div class="stat-header">
            <div class="stat-icon" :style="`background-color: ${stat.color}20`">
              <v-icon :color="stat.color" size="20">{{ stat.icon }}</v-icon>
            </div>
            <p class="stat-label">{{ stat.label }}</p>
          </div>
          <h3 class="stat-value">{{ stat.value }}</h3>
          <div class="stat-trend">
            <v-icon size="14" color="success">mdi-trending-up</v-icon>
            <span class="trend-text">+12% vs mes anterior</span>
          </div>
        </div>
      </div>
      
      <div v-else class="loading-container">
        <v-progress-circular indeterminate color="primary" size="40"></v-progress-circular>
        <p class="loading-text">Cargando estadísticas...</p>
      </div>
    </div>

    <!-- Recent Activity Section -->
    <div class="content-section">
      <div class="section-header">
        <h2 class="section-title">Actividad Reciente</h2>
        <v-btn variant="text" color="primary" size="small" class="view-all-btn">
          Ver todo
          <v-icon end size="16">mdi-arrow-right</v-icon>
        </v-btn>
      </div>

      <div v-if="recentActivity.length > 0" class="activity-container">
        <div 
          v-for="(activity, index) in recentActivity"
          :key="index"
          class="activity-item"
        >
          <div class="activity-icon" :style="`background-color: ${activity.color}20`">
            <v-icon :color="activity.color" size="16">{{ activity.icon }}</v-icon>
          </div>
          <div class="activity-content">
            <h4 class="activity-title">{{ activity.title }}</h4>
            <p class="activity-subtitle">{{ activity.subtitle }}</p>
          </div>
          <span class="activity-time">{{ activity.time }}</span>
        </div>
      </div>

      <div v-else class="empty-state">
        <v-icon color="grey-lighten-1" size="48">mdi-clipboard-text-outline</v-icon>
        <p class="empty-text">No hay actividad reciente</p>
      </div>
    </div>

    <!-- Analytics Section -->
    <div class="content-section">
      <div class="section-header">
        <h2 class="section-title">Análisis y Tendencias</h2>
        <p class="section-subtitle">Visualización de datos de tu biblioteca</p>
      </div>
      
      <div class="charts-grid">
        <div class="chart-card">
          <h3 class="chart-title">Préstamos por Mes</h3>
          <div class="chart-container">
            <canvas ref="loansChart" id="loansChart"></canvas>
          </div>
        </div>
        
        <div class="chart-card">
          <h3 class="chart-title">Categorías Populares</h3>
          <div class="chart-container">
            <canvas ref="categoriesChart" id="categoriesChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Features Section -->
    <div class="content-section">
      <div class="ai-features-card">
        <div class="ai-header">
          <div class="ai-icon-container">
            <v-icon color="primary" size="24">mdi-auto-awesome</v-icon>
          </div>
          <div class="ai-text">
            <h3 class="ai-title">Funciones de IA</h3>
            <p class="ai-subtitle">Tecnología que simplifica la gestión</p>
          </div>
        </div>
        
        <div class="ai-features-grid">
          <div v-for="(feature, index) in aiFeatures" :key="index" class="ai-feature-chip">
            <v-icon size="14" class="feature-icon">{{ feature.icon }}</v-icon>
            <span class="feature-label">{{ feature.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useDashboardStore, useAuthStore } from '@/stores'
import { apiService, type Loan, type Book } from '@/services'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const authStore = useAuthStore()
const dashboard = useDashboardStore()

const loansChart = ref<HTMLCanvasElement>()
const categoriesChart = ref<HTMLCanvasElement>()
let loansChartInstance: Chart | null = null
let categoriesChartInstance: Chart | null = null

const libraryName = computed(() => authStore.biblioteca?.nombre || 'Biblioteca')



const statisticsLoading = computed(() => dashboard.loading)

const numberFmt = new Intl.NumberFormat('es-CO')

const statsCards = computed(() => {
  const s = dashboard.statistics
  return [
    { label: 'Total de Libros', value: numberFmt.format(s?.totalBooks ?? 0), icon: 'mdi-book-outline', color: '#6366F1' },
    { label: 'Disponibles', value: numberFmt.format(s?.availableBooks ?? 0), icon: 'mdi-check-circle-outline', color: '#10B981' },
    { label: 'En Préstamo', value: numberFmt.format(s?.activeLoans ?? 0), icon: 'mdi-account-clock-outline', color: '#F59E0B' },
  ]
})

function formatRelativeTime(dateString?: string): string {
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

const recentActivity = computed(() => {
  const s = dashboard.statistics
  if (!s) return [] as Array<{ title: string; subtitle: string; icon: string; color: string; time: string }>
  const books = (s.recentBooks ?? []).map((b: any) => ({
    title: b?.titulo ?? b?.title ?? 'Sin título',
    subtitle: 'Libro agregado',
    icon: 'mdi-book-plus',
    color: '#059669',
    time: formatRelativeTime(b?.fechaCreacion ?? b?.createdAt)
  }))
  const loans = (s.recentLoans ?? []).map((l: any) => ({
    title: l?.nombreLector ?? l?.lector?.nombre ?? 'Sin nombre',
    subtitle: 'Préstamo realizado',
    icon: 'mdi-account-plus',
    color: '#F59E0B',
    time: formatRelativeTime(l?.fechaPrestamo ?? l?.createdAt)
  }))
  return [...books, ...loans].slice(0, 5)
})

const aiFeatures = [
  { label: 'Reconocimiento OCR', icon: 'mdi-text-recognition' },
  { label: 'Categorización', icon: 'mdi-tag-multiple' },
  { label: 'Recomendaciones', icon: 'mdi-lightbulb' },
  { label: 'Análisis de texto', icon: 'mdi-chart-line' }
]


// Data for charts
const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const loansMonthlyLabels = ref<string[]>([])
const loansMonthlyValues = ref<number[]>([])
const categoryLabels = ref<string[]>([])
const categoryValues = ref<number[]>([])

const loadChartsData = async () => {
  const bibliotecaId = authStore.user?.bibliotecaId
  if (!bibliotecaId) return

  // Fetch loans (up to 1000 most recent)
  try {
    const loansResp = await apiService.getLoans(bibliotecaId, 1, 1000)
    const loans = (loansResp.data || []) as Loan[]
    const now = new Date()
    // Build last 6 months window
    const months: { key: string; label: string }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      months.push({ key, label: monthLabels[d.getMonth()] })
    }
    const counts = new Map(months.map(m => [m.key, 0]))
    loans.forEach(l => {
      const d = new Date(l.fechaPrestamo || l['createdAt'] || l['fechaCreacion'])
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1)
      }
    })
    loansMonthlyLabels.value = months.map(m => m.label)
    loansMonthlyValues.value = months.map(m => counts.get(m.key) || 0)
  } catch (e) {
    console.warn('No se pudieron cargar préstamos para el gráfico:', e)
    loansMonthlyLabels.value = monthLabels.slice(0, 6)
    loansMonthlyValues.value = [0, 0, 0, 0, 0, 0]
  }

  // Fetch books to compute category distribution (top 5)
  try {
    const booksResp = await apiService.getBooks(bibliotecaId, 1, 1000)
    const books = (booksResp.data || []) as Book[]
    const map = new Map<string, number>()
    books.forEach(b => {
      const cat = (b.categoria || 'Sin categoría').trim()
      map.set(cat, (map.get(cat) || 0) + 1)
    })
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
    categoryLabels.value = sorted.map(([k]) => k)
    categoryValues.value = sorted.map(([, v]) => v)
  } catch (e) {
    console.warn('No se pudieron cargar libros para categorías:', e)
    categoryLabels.value = []
    categoryValues.value = []
  }
}

const createCharts = async () => {
  await nextTick()
  
  // Loans Chart
  if (loansChart.value) {
    // Destroy previous instance if any
    if (loansChartInstance) {
      loansChartInstance.destroy()
    }
    loansChartInstance = new Chart(loansChart.value, {
      type: 'bar',
      data: {
        labels: loansMonthlyLabels.value,
        datasets: [{
          label: 'Préstamos',
          data: loansMonthlyValues.value,
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
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

  // Categories Chart
  if (categoriesChart.value) {
    if (categoriesChartInstance) {
      categoriesChartInstance.destroy()
    }
    categoriesChartInstance = new Chart(categoriesChart.value, {
      type: 'doughnut',
      data: {
        labels: categoryLabels.value.length ? categoryLabels.value : ['Sin datos'],
        datasets: [{
          data: categoryValues.value.length ? categoryValues.value : [1],
          backgroundColor: [
            '#6366F1',
            '#8B5CF6',
            '#06B6D4',
            '#10B981',
            '#F59E0B'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: { size: 12 },
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
}

onMounted(async () => {
  const id = authStore.user?.bibliotecaId
  if (id) {
    dashboard.loadStatistics(id)
  }
  await loadChartsData()
  await createCharts()
})

// Recargar si cambia la biblioteca del usuario
watch(() => authStore.user?.bibliotecaId, (newId) => {
  if (newId) {
    dashboard.loadStatistics(newId)
    loadChartsData().then(createCharts)
  }
})
</script>

<style scoped>
/* Container */
.dashboard-container {
  background: #F8FAFC;
  min-height: 100vh;
}

/* Welcome */
.welcome-section {
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  padding: 32px 0;
}

.welcome-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.welcome-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.welcome-logo {
  flex-shrink: 0;
}

.dashboard-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.greeting {
  flex: 1;
}

.display-title {
  margin: 0;
  font-weight: 800;
  font-size: clamp(24px, 2.6vw, 32px);
  color: #ffffff;
}

.subtitle {
  margin: 4px 0 0 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
}

/* Sections */
.content-section {
  max-width: 1200px;
  margin: 16px auto 0 auto;
  padding: 24px;
}

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
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


/* Statistics */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  background: #ffffff;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: #CBD5E1;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06), 0 2px 6px rgba(15, 23, 42, 0.04);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: grid;
  place-items: center;
}

.stat-label { font-size: 12px; color: #64748B; margin: 0; }
.stat-value { font-size: 24px; font-weight: 800; color: #1E293B; margin: 8px 0; }
.stat-trend { display: flex; align-items: center; gap: 6px; color: #059669; font-size: 12px; }

.loading-container {
  display: grid;
  place-items: center;
  gap: 10px;
  padding: 24px 0;
  color: #64748B;
}

.loading-text { margin: 0; }

/* Activity */
.activity-container { display: flex; flex-direction: column; gap: 12px; }

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 14px 16px;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.activity-item:hover { transform: translateY(-1px); border-color: #CBD5E1; }

.activity-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: grid;
  place-items: center;
}

.activity-content { flex: 1; }
.activity-title { margin: 0; font-size: 14px; font-weight: 700; color: #1E293B; }
.activity-subtitle { margin: 2px 0 0 0; font-size: 12px; color: #64748B; }
.activity-time { font-size: 11px; color: #94A3B8; white-space: nowrap; }

.empty-state {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  padding: 24px;
  background: #ffffff;
  border: 1px dashed #E2E8F0;
  border-radius: 12px;
  color: #94A3B8;
}

.empty-text { margin: 0; color: #64748B; }

/* AI features */
.ai-features-card {
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  border-radius: 20px;
  padding: 20px;
  color: #ffffff;
}

.ai-header { display: flex; align-items: center; gap: 12px; }

.ai-icon-container {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.2);
  display: grid;
  place-items: center;
}

.ai-title { margin: 0; font-size: 18px; font-weight: 800; }
.ai-subtitle { margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.85); }

.ai-features-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }

.ai-feature-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  transition: transform 0.15s ease;
}

.ai-feature-chip:hover { transform: translateY(-1px); }
.feature-icon { color: #ffffff; }

/* Charts */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 16px;
}

.chart-card {
  background: #ffffff;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.chart-card:hover {
  transform: translateY(-2px);
  border-color: #CBD5E1;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08), 0 4px 8px rgba(15, 23, 42, 0.04);
}

.chart-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 700;
  color: #1E293B;
}

.chart-container {
  position: relative;
  height: 280px;
  width: 100%;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 900px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .charts-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .welcome-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .dashboard-logo {
    width: 50px;
    height: 50px;
  }
}

@media (max-width: 600px) {
  .welcome-content { padding: 0 20px; }
  .content-section { padding: 20px; }
  .stats-grid { grid-template-columns: 1fr; }
  
  .dashboard-logo {
    width: 45px;
    height: 45px;
  }
}
</style>
