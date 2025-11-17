<template>
  <v-layout class="app-layout">
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="false"
      :permanent="!mobile"
      :temporary="mobile"
      app
      :class="['drawer-custom', { blocked: isLocked }]"
    >
      <template #prepend>
        <div class="pa-4">
          <div class="d-flex align-center">
            <div class="logo-container">
              <img 
                src="@/assets/logo.png" 
                alt="BiblioKardex Logo" 
                class="app-logo"
                :class="{ 'logo-small': rail }"
              />
            </div>
            <div v-if="!rail" class="ml-3">
              <h3 class="text-h6 font-weight-bold" style="color: white;">BiblioKardex</h3>
              <v-chip x-small color="white" outlined style="color: white; border-color: white;">BETA</v-chip>
            </div>
          </div>
        </div>
        <v-divider style="border-color: rgba(255, 255, 255, 0.2);"></v-divider>
      </template>

      <v-list nav dense>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          exact
          class="nav-item"
        >
        </v-list-item>
      </v-list>

      <template #append>
        <div class="pa-2">
          <v-list-item
            prepend-icon="mdi-logout"
            title="Cerrar Sesión"
            @click="handleLogout"
            class="nav-item logout-item"
          >
          </v-list-item>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar
      elevation="1"
      app
      class="app-bar-custom"
    >

      <!-- Subscription status -->
      <div class="ml-3 d-flex align-center" v-if="subscription">
        <v-chip v-if="isTrialing" size="small" class="mr-2 subscription-chip gradient-blue" pill>
          <v-icon start size="16">mdi-information</v-icon>
          Prueba gratuita: {{ trialDaysLeft }} días restantes • Mejora en la app móvil
        </v-chip>
        <v-chip v-else-if="isLocked" size="small" class="mr-2 subscription-chip gradient-blue" pill>
          <v-icon start size="16">mdi-lock-alert</v-icon>
          Suscripción bloqueada • Mejora en la app móvil
        </v-chip>
      </div>

      <v-spacer></v-spacer>

      <!-- User Profile -->
      <v-menu offset-y v-if="!isLocked">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            class="mr-2"
          >
            <v-badge v-if="isAdmin && notifCount>0" color="warning" :content="notifCount" offset-x="10" offset-y="10">
              <v-icon>mdi-bell-outline</v-icon>
            </v-badge>
            <template v-else>
              <v-icon>mdi-bell-outline</v-icon>
            </template>
          </v-btn>
        </template>
        <v-list style="min-width:320px">
          <v-list-item v-if="!isAdmin || notifItems.length===0">
            <v-list-item-title>No hay notificaciones</v-list-item-title>
          </v-list-item>
          <v-list-item
            v-for="n in notifItems"
            :key="n.id"
            @click="ackNotification(n)"
          >
            <v-list-item-title class="text-truncate">{{ n.title }}</v-list-item-title>
            <v-list-item-subtitle class="text-truncate">{{ n.message }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            class="mr-4"
          >
            <v-avatar size="36" color="primary">
              <span class="white--text font-weight-bold">
                {{ userInitials }}
              </span>
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title>{{ authStore.user?.nombre }}</v-list-item-title>
            <v-list-item-subtitle>{{ authStore.user?.email }}</v-list-item-subtitle>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item v-if="!isAdmin" @click="$router.push('/profile')">
            <v-list-item-title>Configuración</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleLogout">
            <v-list-item-title>Cerrar Sesión</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Main Content -->
    <v-main :class="['main-content', { blocked: isLocked }]">
      <router-view />
    </v-main>

    <!-- Bottom Navigation for Mobile -->
    <v-bottom-navigation
      v-model="bottomNav"
      :class="['d-md-none bottom-nav-custom', { blocked: isLocked }]"
      app
      grow
    >
      <v-btn
        v-for="item in bottomNavItems"
        :key="item.value"
        :value="item.value"
        @click="$router.push(item.to)"
      >
        <span>{{ item.title }}</span>
        <v-icon>{{ item.icon }}</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDisplay } from 'vuetify'
import { apiService, type SubscriptionInfo } from '@/services'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { mobile } = useDisplay()

const drawer = ref(true)
const rail = ref(false) // Mantener false siempre para evitar modo "rail"
const bottomNav = ref('dashboard')
const subscription = ref<SubscriptionInfo | null>(null)
const subscriptionLoading = ref(false)

const isAdmin = computed(() => (authStore.user?.role || '').toUpperCase() === 'ADMIN')
const notifItems = ref<Array<{ id: string; title: string; message: string }>>([])
const notifCount = ref(0)
let notifTimer: any

const menuItems = computed(() => {
  if (isAdmin.value) {
    return [
      { title: 'Inicio', icon: 'mdi-home', to: '/dashboard' },
      { title: 'Usuarios (Admin)', icon: 'mdi-shield-account', to: '/admin/users' },
      { title: 'Soporte', icon: 'mdi-lifebuoy', to: '/admin/support' },
      { title: 'App Control', icon: 'mdi-cellphone-cog', to: '/admin/app-control' }
    ]
  }
  return [
    { title: 'Inicio', icon: 'mdi-home', to: '/dashboard' },
    { title: 'Usuarios', icon: 'mdi-account-group', to: '/users' },
    { title: 'Informes', icon: 'mdi-chart-line', to: '/reports' },
    { title: 'Configuración', icon: 'mdi-account', to: '/profile' }
  ]
})

const bottomNavItems = computed(() => {
  if (isAdmin.value) {
    return [
      { title: 'Inicio', icon: 'mdi-home', to: '/dashboard', value: 'dashboard' },
      { title: 'Usuarios', icon: 'mdi-shield-account', to: '/admin/users', value: 'admin-users' },
      { title: 'Soporte', icon: 'mdi-lifebuoy', to: '/admin/support', value: 'admin-support' },
      { title: 'App Control', icon: 'mdi-cellphone-cog', to: '/admin/app-control', value: 'admin-app-control' }
    ]
  }
  return [
    { title: 'Inicio', icon: 'mdi-home', to: '/dashboard', value: 'dashboard' },
    { title: 'Usuarios', icon: 'mdi-account-group', to: '/users', value: 'users' },
    { title: 'Informes', icon: 'mdi-chart-line', to: '/reports', value: 'reports' },
    { title: 'Configuración', icon: 'mdi-account', to: '/profile', value: 'profile' }
  ]
})

const userInitials = computed(() => {
  const name = authStore.user?.nombre || 'U'
  const parts = name.trim().split(/\s+/).filter(p => p.length > 0)
  if (parts.length === 0) return 'U'
  const first = parts[0][0]
  const second = parts.length > 1 ? parts[1][0] : ''
  return (first + second).toUpperCase()
})

const isLocked = computed(() => (subscription.value?.status || '').toUpperCase() === 'LOCKED')
const isTrialing = computed(() => (subscription.value?.status || '').toUpperCase() === 'TRIALING')
const trialDaysLeft = computed(() => {
  const end = subscription.value?.trialEnd ? new Date(subscription.value.trialEnd) : null
  if (!end) return 0
  const ms = end.getTime() - Date.now()
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24))
  return Math.max(0, days)
})

async function loadSubscription() {
  const bibliotecaId = authStore.user?.bibliotecaId
  if (!bibliotecaId) return
  subscriptionLoading.value = true
  try {
    const resp = await apiService.getSubscription(bibliotecaId)
    if (resp.success && resp.data) {
      subscription.value = resp.data
    }
  } catch (e) {
    console.warn('No se pudo cargar suscripción:', e)
  } finally {
    subscriptionLoading.value = false
  }
}

// Update bottom navigation based on route
watch(() => route.path, (newPath) => {
  const items = bottomNavItems.value || []
  const item = items.find((it: any) => it.to === newPath)
  if (item) {
    bottomNav.value = item.value
  }
}, { immediate: true })

const handleLogout = () => {
  authStore.signOut()
  router.push('/')
}

// Ajustar drawer según breakpoint
watch(mobile, (isMobile) => {
  if (isMobile) {
    drawer.value = false
  } else {
    drawer.value = true
  }
  rail.value = false
}, { immediate: true })

// Cargar suscripción al montar y cuando cambie biblioteca
watch(() => authStore.user?.bibliotecaId, (newId) => {
  if (newId) loadSubscription()
}, { immediate: true })

// Admin notifications polling
async function fetchAdminNotifications() {
  try {
    const res = await apiService.adminGetNotifications()
    const items = (res?.data?.items || []).map((n: any) => ({ id: n.id || n._id, title: n.title, message: n.message, read: !!n.read }))
    // Detect new items by unseen ids
    const newOnes = items.filter((i: any) => !notifItems.value.find((x: any) => x.id === i.id))
    if (newOnes.length > 0) {
      playBeep()
    }
    notifItems.value = items.slice(0, 10)
    notifCount.value = items.filter((i: any) => !i.read).length
  } catch (e) {
    // ignore
  }
}

function startNotifPolling() {
  if (!isAdmin.value) return
  if (notifTimer) clearInterval(notifTimer)
  fetchAdminNotifications()
  notifTimer = setInterval(fetchAdminNotifications, 5000)
}

function stopNotifPolling() {
  if (notifTimer) { clearInterval(notifTimer); notifTimer = null }
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = 880
    o.connect(g)
    g.connect(ctx.destination)
    g.gain.value = 0.05
    o.start()
    setTimeout(() => { o.stop(); ctx.close() }, 200)
  } catch {}
}

async function ackNotification(n: any) {
  try {
    await apiService.markNotificationRead(n.id)
    notifItems.value = notifItems.value.filter(x => x.id !== n.id)
    notifCount.value = Math.max(0, notifCount.value - 1)
  } catch {}
}

watch(isAdmin, (val) => {
  stopNotifPolling()
  if (val) startNotifPolling()
}, { immediate: true })
</script>

<style scoped>
.drawer-custom {
  background: linear-gradient(180deg, #1E40AF 0%, #3B82F6 100%) !important;
  border-right: 1px solid rgba(59, 130, 246, 0.3);
  position: fixed !important;
  top: 0 !important;
  height: 100vh !important;
  z-index: 1000 !important;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
  transition: all 0.3s ease;
}

.app-logo.logo-small {
  width: 32px;
  height: 32px;
}

.nav-item {
  margin: 2px 8px;
  border-radius: 12px;
}

.nav-item {
  color: rgba(255, 255, 255, 0.8) !important;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

.nav-item.v-list-item--active {
  background: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.logout-item {
  color: rgba(255, 255, 255, 0.8) !important;
}

.logout-item:hover {
  background: rgba(220, 38, 38, 0.3) !important;
  color: #FEE2E2 !important;
}

.app-bar-custom {
  background: white !important;
  border-bottom: 1px solid #E2E8F0;
}

.main-content {
  background: #F8FAFC;
}

.blocked {
  pointer-events: none;
  opacity: 0.6;
  filter: grayscale(0.2);
}

.bottom-nav-custom {
  border-top: 1px solid #E2E8F0;
}

.bottom-nav-custom .v-btn {
  color: #64748B;
}

.bottom-nav-custom .v-btn--active {
  color: #1E40AF;
  background: rgba(30, 64, 175, 0.1);
}

/* Subscription chip */
.subscription-chip {
  color: #ffffff !important;
  font-weight: 600;
  letter-spacing: 0.2px;
  box-shadow: 0 6px 18px rgba(59, 130, 246, 0.35) !important;
}

.gradient-blue {
  background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%) !important;
}
</style>
