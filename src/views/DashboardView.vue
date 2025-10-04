<template>
  <div class="dashboard-container">
    <!-- Modern Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div class="welcome-section">
          <div class="greeting">
            <h1 class="display-title">Hola, {{ userName }}</h1>
            <p class="subtitle">Aquí tienes un resumen de tu biblioteca</p>
          </div>
          <div class="header-actions">
            <v-btn icon variant="text" size="large" class="notification-btn">
              <v-badge color="error" dot>
                <v-icon>mdi-bell-outline</v-icon>
              </v-badge>
            </v-btn>
            <v-avatar size="44" class="user-avatar">
              <span class="avatar-text">{{ userInitials }}</span>
            </v-avatar>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Section -->
    <div class="content-section">
      <div class="section-header">
        <h2 class="section-title">Acciones Rápidas</h2>
        <p class="section-subtitle">Gestiona tu biblioteca de manera eficiente</p>
      </div>
      
      <div class="quick-actions-grid">
        <div 
          v-for="(action, index) in quickActions" 
          :key="index"
          class="action-card"
          @click="handleStepClick(action.action)"
        >
          <div class="action-icon">
            <v-icon :color="action.color" size="24">{{ action.icon }}</v-icon>
          </div>
          <div class="action-content">
            <h3 class="action-title">{{ action.title }}</h3>
            <p class="action-description">{{ action.subtitle }}</p>
          </div>
          <v-icon class="action-arrow" size="16">mdi-chevron-right</v-icon>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'

const router = useRouter()
const authStore = useAuthStore()
const dashboard = useDashboardStore()

const userName = computed(() => {
  const name = authStore.user?.nombre || 'Usuario'
  return name.split(' ')[0]
})

const userInitials = computed(() => {
  const name = authStore.user?.nombre || 'U'
  const parts = name.trim().split(/\s+/).filter(p => p.length > 0)
  if (parts.length === 0) return 'U'
  const first = parts[0][0]
  const second = parts.length > 1 ? parts[1][0] : ''
  return (first + second).toUpperCase()
})

const quickActions = [
  { title: 'Escanear Libro', subtitle: 'Agregar nuevos libros al sistema', icon: 'mdi-camera-outline', color: '#6366F1', action: 'scan' },
  { title: 'Crear Préstamo', subtitle: 'Registrar un nuevo préstamo', icon: 'mdi-account-plus-outline', color: '#F59E0B', action: 'loan' },
  { title: 'Procesar Devolución', subtitle: 'Marcar libro como disponible', icon: 'mdi-keyboard-return', color: '#10B981', action: 'return' },
  { title: 'Ver Inventario', subtitle: 'Revisar estado del inventario', icon: 'mdi-clipboard-list-outline', color: '#8B5CF6', action: 'inventory' }
]

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

const handleStepClick = (action: string) => {
  switch (action) {
    case 'scan':
      // TODO: Página de escaneo en web
      break
    case 'loan':
      // TODO: Página de préstamo en web
      break
    case 'return':
    case 'inventory':
      router.push('/reports')
      break
  }
}

onMounted(() => {
  const id = authStore.user?.bibliotecaId
  if (id) {
    dashboard.loadStatistics(id)
  }
})

// Recargar si cambia la biblioteca del usuario
watch(() => authStore.user?.bibliotecaId, (newId) => {
  if (newId) dashboard.loadStatistics(newId)
})
</script>

<style scoped>
/* Container */
.dashboard-container {}

/* Header */
.header-section {
  background: linear-gradient(135deg, #1E3A8A 0%, #7C3AED 100%);
  border-bottom-left-radius: 32px;
  border-bottom-right-radius: 32px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.welcome-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-btn:hover {
  background: rgba(255, 255, 255, 0.15) !important;
}

.user-avatar {
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  background: #ffffff;
}

.avatar-text { color: #1E3A8A; font-weight: 700; }

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

/* Quick Actions */
.quick-actions-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  border-color: rgba(30, 58, 138, 0.35);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.06);
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #F1F5F9;
  display: grid;
  place-items: center;
}

.action-content { flex: 1; }

.action-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #1E293B;
}

.action-description {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #64748B;
}

.action-arrow { color: #94A3B8; transition: transform 0.2s ease; }
.action-card:hover .action-arrow { transform: translateX(2px); }

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

/* Responsive */
@media (max-width: 1200px) {
  .quick-actions-grid { grid-template-columns: repeat(3, 1fr); }
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 900px) {
  .quick-actions-grid { grid-template-columns: repeat(2, 1fr); }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .header-content { padding: 20px; }
  .content-section { padding: 20px; }
  .quick-actions-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
