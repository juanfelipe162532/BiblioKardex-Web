<template>
  <div class="reports-container">
    <!-- Modern Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">Informes y Reportes</h1>
          <p class="page-subtitle">Analiza el rendimiento y tendencias de tu biblioteca</p>
        </div>
      </div>
    </div>

    <!-- Export Reports Section -->
    <div class="content-section">
      <div class="section-header">
        <h2 class="section-title">Generar Informes</h2>
        <p class="section-subtitle">Descarga reportes detallados en Excel o PDF</p>
      </div>

      <div class="reports-info-banner">
        <v-icon size="18" color="#1E3A8A">mdi-information</v-icon>
        <span>Selecciona el formato de archivo y luego haz clic en Descargar</span>
      </div>

      <div class="reports-grid">
        <!-- Inventory Report -->
        <div class="report-card">
          <div class="report-icon-wrapper inventory">
            <v-icon size="32" color="white">mdi-clipboard-list</v-icon>
          </div>
          <div class="report-content">
            <h3 class="report-title">Reporte de Inventario</h3>
            <p class="report-description">Listado completo de libros, categorías y disponibilidad</p>
            <div class="report-actions">
              <v-btn-toggle v-model="inventoryFormat" density="compact" mandatory class="format-toggle">
                <v-btn value="excel" size="small">
                  <v-icon start size="16">mdi-file-excel</v-icon>
                  Excel
                </v-btn>
                <v-btn value="pdf" size="small">
                  <v-icon start size="16">mdi-file-pdf-box</v-icon>
                  PDF
                </v-btn>
              </v-btn-toggle>
              <v-btn color="primary" variant="elevated" @click="exportFormat = inventoryFormat; generateInventoryReport()" block class="mt-3">
                <v-icon start>mdi-download</v-icon>
                Descargar
              </v-btn>
            </div>
          </div>
        </div>

        <!-- Loans Report -->
        <div class="report-card">
          <div class="report-icon-wrapper loans">
            <v-icon size="32" color="white">mdi-book-clock</v-icon>
          </div>
          <div class="report-content">
            <h3 class="report-title">Reporte de Préstamos</h3>
            <p class="report-description">Historial de todos los préstamos realizados</p>
            <div class="report-actions">
              <v-btn-toggle v-model="loansFormat" density="compact" mandatory class="format-toggle">
                <v-btn value="excel" size="small">
                  <v-icon start size="16">mdi-file-excel</v-icon>
                  Excel
                </v-btn>
                <v-btn value="pdf" size="small">
                  <v-icon start size="16">mdi-file-pdf-box</v-icon>
                  PDF
                </v-btn>
              </v-btn-toggle>
              <v-btn color="primary" variant="elevated" @click="exportFormat = loansFormat; generateLoansReport()" block class="mt-3">
                <v-icon start>mdi-download</v-icon>
                Descargar
              </v-btn>
            </div>
          </div>
        </div>

        <!-- Returns Report -->
        <div class="report-card">
          <div class="report-icon-wrapper returns">
            <v-icon size="32" color="white">mdi-keyboard-return</v-icon>
          </div>
          <div class="report-content">
            <h3 class="report-title">Reporte de Devoluciones</h3>
            <p class="report-description">Registro completo de devoluciones de libros</p>
            <div class="report-actions">
              <v-btn-toggle v-model="returnsFormat" density="compact" mandatory class="format-toggle">
                <v-btn value="excel" size="small">
                  <v-icon start size="16">mdi-file-excel</v-icon>
                  Excel
                </v-btn>
                <v-btn value="pdf" size="small">
                  <v-icon start size="16">mdi-file-pdf-box</v-icon>
                  PDF
                </v-btn>
              </v-btn-toggle>
              <v-btn color="primary" variant="elevated" @click="exportFormat = returnsFormat; generateReturnsReport()" block class="mt-3">
                <v-icon start>mdi-download</v-icon>
                Descargar
              </v-btn>
            </div>
          </div>
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
        <div v-for="(metric, index) in metrics" :key="index" class="metric-card">
          <div class="metric-icon" :style="`background: ${metric.color}20`">
            <v-icon :color="metric.color" size="24">{{ metric.icon }}</v-icon>
          </div>
          <div class="metric-content">
            <h3 class="metric-value">{{ metric.value }}</h3>
            <p class="metric-label">{{ metric.label }}</p>
            <div class="metric-trend">
              <v-icon :color="metric.trend === 'up' ? 'success' : 'error'" size="16">
                {{ metric.trend === 'up' ? 'mdi-trending-up' : 'mdi-trending-down' }}
              </v-icon>
              <span class="trend-text" :class="metric.trend === 'up' ? 'trend-up' : 'trend-down'">
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
              <v-btn-toggle v-model="chartPeriod" variant="outlined" density="compact" mandatory>
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
            <div v-for="(loan, index) in recentLoans" :key="index" class="data-item">
              <div class="item-avatar">
                <div class="status-indicator" :class="loan.status === 'active' ? 'status-active' : 'status-returned'">
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
                <v-chip :color="loan.status === 'active' ? 'orange' : 'green'" variant="tonal" size="small">
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
            <div v-for="(book, index) in topBooks" :key="index" class="data-item">
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

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useAuthStore } from '@/stores'
import { apiService, type Loan, type Book } from '@/services'
import logoUrl from '@/assets/logo.png'

Chart.register(...registerables)

const chartPeriod = ref(0) // 0: 6M, 1: 1A, 2: Todo
// Export format state for each report type
const exportFormat = ref<'excel' | 'pdf'>('excel')
const inventoryFormat = ref<'excel' | 'pdf'>('pdf')
const loansFormat = ref<'excel' | 'pdf'>('pdf')
const returnsFormat = ref<'excel' | 'pdf'>('pdf')

const loansChart = ref<HTMLCanvasElement>()
const categoriesChart = ref<HTMLCanvasElement>()
const usersChart = ref<HTMLCanvasElement>()
const monthlyChart = ref<HTMLCanvasElement>()
let loansChartInstance: Chart | null = null
let categoriesChartInstance: Chart | null = null
let usersChartInstance: Chart | null = null
let monthlyChartInstance: Chart | null = null

// UI state
const loading = ref(true)
const error = ref<string | null>(null)

const authStore = useAuthStore()

// Data caches
const allLoans = ref<Loan[]>([])
const allBooks = ref<Book[]>([])

// Aggregated datasets
const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const loansTrendLabels = ref<string[]>([])
const loansTrendValues = ref<number[]>([])
const categoriesLabels = ref<string[]>([])
const categoriesValues = ref<number[]>([])
const usersActivityLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const usersActivityValues = ref<number[]>([0, 0, 0, 0, 0, 0, 0])
const monthlyStatsLabels = ['Nuevos', 'Devueltos', 'Vencidos', 'Renovados']
const monthlyStatsValues = ref<number[]>([0, 0, 0, 0])

const numberFmt = new Intl.NumberFormat('es-CO')
const metrics = ref<Array<{ label: string; value: string; icon: string; color: string; trend: 'up' | 'down'; change: string }>>([
  { label: 'Total Préstamos', value: '-', icon: 'mdi-book-multiple', color: '#6366F1', trend: 'up', change: '' },
  { label: 'Préstamos Activos', value: '-', icon: 'mdi-clock-outline', color: '#F59E0B', trend: 'up', change: '' },
  { label: 'Devoluciones (30 días)', value: '-', icon: 'mdi-keyboard-return', color: '#10B981', trend: 'up', change: '' },
  { label: 'Atrasados', value: '-', icon: 'mdi-alert-circle-outline', color: '#EF4444', trend: 'up', change: '' }
])

const recentLoans = ref<Array<{ book: string; user: string; date: string; status: 'active' | 'returned' }>>([])
const topBooks = ref<Array<{ title: string; author: string; loans: number }>>([])

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

const computeAggregations = () => {
  // Loans trend by month
  const map = new Map<string, number>() // key: YYYY-MM
  allLoans.value.forEach(l => {
    const d = new Date(l.fechaPrestamo || (l as any).createdAt)
    if (isNaN(d.getTime())) return
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    map.set(key, (map.get(key) || 0) + 1)
  })
  const keys = Array.from(map.keys()).sort()
  const labelsAll = keys.map(k => {
    const [y, m] = k.split('-').map(Number)
    return monthLabels[(m - 1) % 12]
  })
  const valuesAll = keys.map(k => map.get(k) || 0)
  const slice = chartPeriod.value === 0 ? 6 : chartPeriod.value === 1 ? 12 : keys.length
  const start = Math.max(0, keys.length - slice)
  loansTrendLabels.value = labelsAll.slice(start)
  loansTrendValues.value = valuesAll.slice(start)

  // Categories distribution from books (Top 6)
  const catMap = new Map<string, number>()
  allBooks.value.forEach(b => {
    const c = (b.categoria || 'Sin categoría').trim()
    catMap.set(c, (catMap.get(c) || 0) + 1)
  })
  const topCats = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6)
  categoriesLabels.value = topCats.map(([k]) => k)
  categoriesValues.value = topCats.map(([, v]) => v)

  // Users activity by weekday (last 30 days)
  const now = new Date()
  const daysAgo30 = new Date(now.getTime() - 30 * 86400000)
  const weekMap = new Array(7).fill(0) as number[] // Mon..Sun mapping
  allLoans.value.forEach(l => {
    const d = new Date(l.fechaPrestamo || (l as any).createdAt)
    if (isNaN(d.getTime()) || d < daysAgo30) return
    const wd = d.getDay() === 0 ? 6 : d.getDay() - 1
    weekMap[wd] = (weekMap[wd] || 0) + 1
  })
  usersActivityValues.value = weekMap

  // Monthly stats current month
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const nuevos = allLoans.value.filter(l => {
    const d = new Date(l.fechaPrestamo || (l as any).createdAt)
    return !isNaN(d.getTime()) && d >= firstOfMonth
  }).length
  const devueltos = allLoans.value.filter(l => {
    const fd = l.fechaDevolucion ? new Date(l.fechaDevolucion) : null
    return !!fd && !isNaN(fd.getTime()) && fd >= firstOfMonth
  }).length
  const vencidos = allLoans.value.filter(l => (l.estado || '').toUpperCase() === 'ATRASADO').length
  monthlyStatsValues.value = [nuevos, devueltos, vencidos, 0]

  // Metrics
  const total = allLoans.value.length
  const activos = allLoans.value.filter(l => (l.estado || '').toUpperCase() === 'ACTIVO').length
  const devueltos30 = allLoans.value.filter(l => {
    const fd = l.fechaDevolucion ? new Date(l.fechaDevolucion) : null
    return !!fd && !isNaN(fd.getTime()) && fd >= daysAgo30
  }).length
  const atrasados = vencidos
  metrics.value = [
    { label: 'Total Préstamos', value: numberFmt.format(total), icon: 'mdi-book-multiple', color: '#6366F1', trend: 'up', change: '' },
    { label: 'Préstamos Activos', value: numberFmt.format(activos), icon: 'mdi-clock-outline', color: '#F59E0B', trend: 'up', change: '' },
    { label: 'Devoluciones (30 días)', value: numberFmt.format(devueltos30), icon: 'mdi-keyboard-return', color: '#10B981', trend: 'up', change: '' },
    { label: 'Atrasados', value: numberFmt.format(atrasados), icon: 'mdi-alert-circle-outline', color: '#EF4444', trend: 'up', change: '' }
  ]

  // Recent Loans (Top 5)
  const bookMap = new Map<string, Book>()
  allBooks.value.forEach(b => bookMap.set(b.id, b))
  recentLoans.value = [...allLoans.value]
    .sort((a, b) => new Date(b.fechaPrestamo || (b as any).createdAt).getTime() - new Date(a.fechaPrestamo || (a as any).createdAt).getTime())
    .slice(0, 5)
    .map(l => ({
      book: bookMap.get(l.libroId as any)?.titulo || 'Libro',
      user: (l as any).nombreLector || 'Lector',
      date: formatRelativeTime(l.fechaPrestamo as any),
      status: (l.estado || '').toUpperCase() === 'DEVUELTO' ? 'returned' : 'active'
    }))

  // Top Books by loans
  const counts = new Map<string, number>()
  allLoans.value.forEach(l => {
    const id = String(l.libroId || '')
    if (!id) return
    counts.set(id, (counts.get(id) || 0) + 1)
  })
  const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
  topBooks.value = top.map(([id, c]) => ({
    title: bookMap.get(id)?.titulo || 'Libro',
    author: bookMap.get(id)?.autor || 'Autor desconocido',
    loans: c
  }))
}

const createCharts = async () => {
  await nextTick()

  // Loans Trend Chart
  if (loansChart.value) {
    if (loansChartInstance) loansChartInstance.destroy()
    loansChartInstance = new Chart(loansChart.value, {
      type: 'line',
      data: {
        labels: loansTrendLabels.value,
        datasets: [{
          label: 'Préstamos',
          data: loansTrendValues.value,
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
    if (categoriesChartInstance) categoriesChartInstance.destroy()
    categoriesChartInstance = new Chart(categoriesChart.value, {
      type: 'doughnut',
      data: {
        labels: categoriesLabels.value.length ? categoriesLabels.value : ['Sin datos'],
        datasets: [{
          data: categoriesValues.value.length ? categoriesValues.value : [1],
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
    if (usersChartInstance) usersChartInstance.destroy()
    usersChartInstance = new Chart(usersChart.value, {
      type: 'bar',
      data: {
        labels: usersActivityLabels,
        datasets: [{
          label: 'Actividad',
          data: usersActivityValues.value,
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
    if (monthlyChartInstance) monthlyChartInstance.destroy()
    monthlyChartInstance = new Chart(monthlyChart.value, {
      type: 'bar',
      data: {
        labels: monthlyStatsLabels,
        datasets: [{
          label: 'Este mes',
          data: monthlyStatsValues.value,
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

async function toDataUrl(url: string): Promise<string> {
  const res = await fetch(url)
  const blob = await res.blob()
  return await new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })
}

function escapeHtml(text: any) {
  const s = String(text ?? '')
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildReportHtml(title: string, subtitle: string, columns: string[], rows: string[][]) {
  const now = new Date()
  const fechaStr = now.toLocaleString()
  const nombreBib = authStore.biblioteca?.nombre || 'Biblioteca'
  const logoData = (window as any).__reportLogo || ''

  const header = `<div class="header">
    <img src="${logoData}" alt="BiblioKardex" width="56" height="56" />
    <div class="header-text">
      <div class="title">${escapeHtml(title)}</div>
      <div class="meta">${subtitle ? escapeHtml(subtitle) + ' — ' : ''}Biblioteca: ${escapeHtml(nombreBib)}</div>
      <div class="meta-date">Fecha de emisión: ${escapeHtml(fechaStr)}</div>
    </div>
  </div>`

  const thead = `<thead><tr>${columns.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead>`
  const tbody = `<tbody>${rows.map(r => `<tr>${r.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody>`

  return `<!DOCTYPE html>
  <html><head><meta charset="UTF-8"/>
  <style>
    @page {
      size: A4 landscape;
      margin: 20mm 15mm 25mm 15mm;
    }
    body {
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
      margin: 0;
      padding: 0;
      color: #1E293B;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 3px solid #1E3A8A;
    }
    .header img {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header-text {
      flex: 1;
    }
    .title {
      font-size: 22px;
      font-weight: bold;
      color: #1E3A8A;
      margin-bottom: 6px;
    }
    .meta {
      font-size: 11px;
      color: #64748B;
      margin-bottom: 2px;
    }
    .meta-date {
      font-size: 10px;
      color: #94A3B8;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    th, td {
      border: 1px solid #CBD5E1;
      padding: 10px 8px;
      vertical-align: top;
      font-size: 10px;
    }
    th {
      background: linear-gradient(180deg, #E8EEFC 0%, #D6DFFA 100%);
      font-weight: 600;
      color: #1E3A8A;
      text-align: left;
    }
    tbody tr:nth-child(even) {
      background-color: #F8FAFC;
    }
    tbody tr:hover {
      background-color: #F1F5F9;
    }
    td.num {
      text-align: center;
    }
    .footerbar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 36px;
      background: linear-gradient(135deg, #1E3A8A 0%, #7C3AED 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      font-size: 11px;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    }
    .footer-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .footer-left img {
      border-radius: 4px;
    }
    .footer-right {
      font-size: 10px;
      opacity: 0.95;
    }
  </style>
  </head><body>
  ${header}
  <table>
    ${thead}
    ${tbody}
  </table>
  <div class="footerbar">
    <div class="footer-left">
      <img src="${logoData}" width="20" height="20"/>
      <span><strong>BiblioKardex</strong> • ${escapeHtml(nombreBib)}</span>
    </div>
    <div class="footer-right">${escapeHtml(fechaStr)}</div>
  </div>
  </body></html>`
}

function downloadExcelFromHtml(html: string, filenameBase: string) {
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`
  a.href = url
  a.download = `${filenameBase}_${ts}.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function printPdfFromHtml(html: string) {
  const win = window.open('', '_blank')
  if (!win) return
  win.document.open()
  win.document.write(html)
  win.document.close()
  setTimeout(() => { try { win.focus(); win.print(); } catch { } }, 500)
}

async function ensureReportLogo() {
  if ((window as any).__reportLogo) return (window as any).__reportLogo
  const data = await toDataUrl(logoUrl as unknown as string)
    ; (window as any).__reportLogo = data
  return data
}

function hasPdfMake(): boolean {
  return typeof (window as any).pdfMake !== 'undefined' && !!(window as any).pdfMake
}

async function openPdfReport(
  title: string,
  subtitle: string,
  columns: string[],
  rows: string[][],
  fileName?: string
) {
  try {
    await ensureReportLogo()
    const pdfMake = (window as any).pdfMake
    if (!hasPdfMake() || !pdfMake?.createPdf) {
      const html = buildReportHtml(title, subtitle, columns, rows)
      printPdfFromHtml(html)
      return
    }

    const now = new Date()
    const fechaStr = now.toLocaleString()
    const nombreBib = authStore.biblioteca?.nombre || 'Biblioteca'
    const logoDataUrl = (window as any).__reportLogo as string

    const tableBody = [columns, ...rows]
    const widths = columns.map(() => '*')

    const primaryColor = '#1E3A8A'
    const secondaryColor = '#7C3AED'
    const headerColor = '#e8eefc'
    const textMuted = '#64748B'

    const docDefinition: any = {
      pageOrientation: 'landscape',
      pageMargins: [40, 90, 40, 70],
      info: {
        title: title,
        author: 'BiblioKardex',
        subject: subtitle || 'Reporte',
        keywords: 'Reporte, Biblioteca, BiblioKardex'
      },
      header: function () {
        return {
          margin: [40, 24, 40, 12],
          columns: [
            { image: logoDataUrl, width: 48, height: 48, margin: [0, 4, 0, 0] },
            {
              width: '*',
              stack: [
                { text: title, fontSize: 18, bold: true, color: primaryColor, margin: [0, 4, 0, 0] },
                { text: `${subtitle ? subtitle + ' — ' : ''}Biblioteca: ${nombreBib}`, fontSize: 10, color: textMuted, margin: [0, 4, 0, 0] },
                { text: `Fecha de emisión: ${fechaStr}`, fontSize: 9, color: textMuted, margin: [0, 2, 0, 0] }
              ]
            }
          ]
        }
      },
      footer: function (currentPage: number, pageCount: number) {
        return {
          margin: [0, 12, 0, 0],
          table: {
            widths: ['*'],
            body: [[
              {
                margin: [40, 0, 40, 0],
                columns: [
                  {
                    width: 'auto',
                    stack: [
                      { image: logoDataUrl, width: 18, height: 18, margin: [0, 0, 8, 0] }
                    ]
                  },
                  {
                    width: '*',
                    text: `BiblioKardex • ${nombreBib}`,
                    color: '#FFFFFF',
                    fontSize: 10,
                    alignment: 'left',
                    margin: [0, 2, 0, 0]
                  },
                  {
                    width: 'auto',
                    text: `Página ${currentPage} de ${pageCount}`,
                    color: '#FFFFFF',
                    fontSize: 10,
                    alignment: 'right',
                    margin: [0, 2, 0, 0]
                  }
                ]
              }
            ]]
          },
          layout: {
            fillColor: function () { return primaryColor },
            hLineWidth: function () { return 0 },
            vLineWidth: function () { return 0 },
            paddingLeft: function () { return 16 },
            paddingRight: function () { return 16 },
            paddingTop: function () { return 10 },
            paddingBottom: function () { return 10 }
          }
        }
      },
      content: [
        {
          table: {
            headerRows: 1,
            widths,
            body: tableBody
          },
          layout: {
            fillColor: function (rowIndex: number) { return rowIndex === 0 ? headerColor : null },
            hLineColor: function () { return '#CBD5E1' },
            vLineColor: function () { return '#CBD5E1' },
            paddingLeft: function () { return 8 },
            paddingRight: function () { return 8 },
            paddingTop: function () { return 6 },
            paddingBottom: function () { return 6 }
          }
        }
      ],
      defaultStyle: { fontSize: 9 }
    }

    const pdf = pdfMake.createPdf(docDefinition)
    // Open in a new tab with the browser PDF viewer
    pdf.open()
  } catch (e) {
    const html = buildReportHtml(title, subtitle, columns, rows)
    printPdfFromHtml(html)
  }
}

async function generateInventoryReport() {
  try {
    if (!authStore.user?.bibliotecaId) throw new Error('Biblioteca no definida')
    // Asegurar datos de libros en memoria
    if (!allBooks.value.length) {
      const booksResp = await apiService.getBooks(authStore.user.bibliotecaId, 1, 2000)
      allBooks.value = booksResp.data || []
    }

    // Agrupar por (titulo+autor+categoria) para estimar ejemplares
    const groups = new Map<string, { titulo: string; autor: string; descripcion: string; categoria: string; total: number; disponibles: number }>()
    for (const b of allBooks.value as any[]) {
      const key = [b.titulo?.trim().toLowerCase(), b.autor?.trim().toLowerCase(), (b.categoria || '').trim().toLowerCase()].join('|')
      const g = groups.get(key) || {
        titulo: b.titulo || '',
        autor: b.autor || '',
        descripcion: b.descripcion || '',
        categoria: b.categoria || '',
        total: 0,
        disponibles: 0,
      }
      g.total += 1
      if (b.disponible) g.disponibles += 1
      if (!g.descripcion && b.descripcion) g.descripcion = b.descripcion
      groups.set(key, g)
    }

    const rows = Array.from(groups.values())
    const columns = ['Título','Autor','Descripción','Categoría','Ejemplares','Disponibles']
    const pdfRows = rows.map(r => [
      r.titulo || '—',
      r.autor || '—',
      r.descripcion || '—',
      r.categoria || 'Sin categoría',
      String(r.total || 0),
      String(r.disponibles || 0)
    ])

    if (exportFormat.value === 'excel') {
      const html = buildReportHtml('Reporte de Inventario', '', columns, pdfRows)
      downloadExcelFromHtml(html, `Inventario_${(authStore.biblioteca?.nombre || 'Biblioteca').replace(/\s+/g,'_')}`)
    } else {
      await openPdfReport('Reporte de Inventario', '', columns, pdfRows)
    }
  } catch (e) {
    console.error('No se pudo generar el reporte de Inventario:', e)
  }
}

async function generateLoansReport() {
  try {
    if (!authStore.user?.bibliotecaId) throw new Error('Biblioteca no definida')
    if (!allLoans.value.length) {
      const loansResp = await apiService.getLoans(authStore.user.bibliotecaId, 1, 2000)
      allLoans.value = loansResp.data || []
    }
    if (!allBooks.value.length) {
      const booksResp = await apiService.getBooks(authStore.user.bibliotecaId, 1, 2000)
      allBooks.value = booksResp.data || []
    }
    const bookMap = new Map<string, any>()
    allBooks.value.forEach((b: any) => bookMap.set(String(b.id), b))
    const rows = (allLoans.value as any[]).map(l => {
      const b = bookMap.get(String(l.libroId))
      const estado = (l.estado || '').toString().toUpperCase()
      return [
        l.fechaPrestamo ? new Date(l.fechaPrestamo).toLocaleString() : '',
        b?.titulo || '—',
        b?.autor || '—',
        l.nombreLector || '—',
        estado || '—',
      ] as string[]
    })
    const columns = ['Fecha préstamo','Título','Autor','Lector','Estado']
    const html = buildReportHtml('Reporte de Préstamos', '', columns, rows)
    if (exportFormat.value === 'excel') {
      downloadExcelFromHtml(html, `Prestamos_${(authStore.biblioteca?.nombre || 'Biblioteca').replace(/\s+/g,'_')}`)
    } else {
      await openPdfReport('Reporte de Préstamos', '', columns, rows)
    }
  } catch (e) {
    console.error('No se pudo generar el reporte de Préstamos:', e)
  }
}

async function generateReturnsReport() {
  try {
    if (!authStore.user?.bibliotecaId) throw new Error('Biblioteca no definida')
    const resp = await apiService.getLoans(authStore.user.bibliotecaId, 1, 2000, 'DEVUELTO')
    const loans = (resp.data || []) as any[]
    if (!allBooks.value.length) {
      const booksResp = await apiService.getBooks(authStore.user.bibliotecaId, 1, 2000)
      allBooks.value = booksResp.data || []
    }
    const bookMap = new Map<string, any>()
    allBooks.value.forEach((b: any) => bookMap.set(String(b.id), b))
    const rows = loans.map(l => {
      const b = bookMap.get(String(l.libroId))
      return [
        l.fechaPrestamo ? new Date(l.fechaPrestamo).toLocaleString() : '',
        l.fechaDevolucion ? new Date(l.fechaDevolucion).toLocaleString() : '',
        b?.titulo || '—',
        b?.autor || '—',
        l.nombreLector || '—',
      ] as string[]
    })
    const columns = ['Fecha préstamo','Fecha devolución','Título','Autor','Lector']
    const html = buildReportHtml('Reporte de Devoluciones', '', columns, rows)
    if (exportFormat.value === 'excel') {
      downloadExcelFromHtml(html, `Devoluciones_${(authStore.biblioteca?.nombre || 'Biblioteca').replace(/\s+/g,'_')}`)
    } else {
      await openPdfReport('Reporte de Devoluciones', '', columns, rows)
    }
  } catch (e) {
    console.error('No se pudo generar el reporte de Devoluciones:', e)
  }
}

onMounted(() => {
  loadData()
})

const loadData = async () => {
  try {
    loading.value = true
    error.value = null
    const bibliotecaId = authStore.user?.bibliotecaId
    if (!bibliotecaId) throw new Error('Biblioteca no definida')

    const [loansResp, booksResp] = await Promise.all([
      apiService.getLoans(bibliotecaId, 1, 2000),
      apiService.getBooks(bibliotecaId, 1, 2000)
    ])
    allLoans.value = loansResp.data || []
    allBooks.value = booksResp.data || []

    computeAggregations()
    await createCharts()
  } catch (e) {
    console.error('Error loading reports:', e)
    error.value = e instanceof Error ? e.message : 'Error al cargar reportes'
  } finally {
    loading.value = false
  }
}

watch(chartPeriod, async () => {
  computeAggregations()
  await createCharts()
})

watch(() => authStore.user?.bibliotecaId, (newId) => {
  if (newId) loadData()
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

.trend-up {
  color: #059669;
}

.trend-down {
  color: #DC2626;
}

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

/* Reports Info Banner */
.reports-info-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%);
  border: 1px solid #BFDBFE;
  border-radius: 12px;
  padding: 14px 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(30, 58, 138, 0.08);
}

.reports-info-banner span {
  font-size: 14px;
  font-weight: 500;
  color: #1E40AF;
  line-height: 1.5;
}

/* Reports Grid */
.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.report-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.report-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.report-icon-wrapper.inventory {
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
}

.report-icon-wrapper.loans {
  background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
}

.report-icon-wrapper.returns {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
}

.report-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1E293B;
}

.report-description {
  margin: 0;
  font-size: 14px;
  color: #64748B;
  line-height: 1.5;
}

.report-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
}

.format-toggle {
  width: 100%;
  background: #F8FAFC;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
}

.format-toggle :deep(.v-btn) {
  flex: 1;
  border-radius: 8px !important;
  margin: 4px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
  transition: all 0.2s ease;
  color: #64748B;
  background: transparent;
}

.format-toggle :deep(.v-btn:hover) {
  background: #E2E8F0;
  color: #1E293B;
}

.format-toggle :deep(.v-btn--active) {
  background: linear-gradient(135deg, #1E3A8A 0%, #7C3AED 100%) !important;
  color: #FFFFFF !important;
  box-shadow: 0 2px 8px rgba(30, 58, 138, 0.3);
  font-weight: 600;
}

.format-toggle :deep(.v-btn--active .v-icon) {
  color: #FFFFFF !important;
}

/* Download Button */
.report-actions :deep(.v-btn.v-btn--elevated) {
  background: linear-gradient(135deg, #1E3A8A 0%, #7C3AED 100%) !important;
  box-shadow: 0 4px 14px rgba(30, 58, 138, 0.4) !important;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.report-actions :deep(.v-btn.v-btn--elevated:hover) {
  box-shadow: 0 6px 20px rgba(30, 58, 138, 0.5) !important;
  transform: translateY(-2px);
}

.report-actions :deep(.v-btn.v-btn--elevated:active) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(30, 58, 138, 0.3) !important;
}

.report-actions :deep(.v-btn .v-icon) {
  transition: transform 0.3s ease;
}

.report-actions :deep(.v-btn:hover .v-icon) {
  transform: translateY(-1px);
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
