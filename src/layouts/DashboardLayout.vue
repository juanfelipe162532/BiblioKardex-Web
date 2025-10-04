<template>
  <v-layout class="app-layout">
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="!mobile && rail"
      :permanent="!mobile"
      :temporary="mobile"
      @click="!mobile && (rail = false)"
      app
      class="drawer-custom"
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
      <v-app-bar-nav-icon
        @click.stop="mobile ? (drawer = !drawer) : (rail = !rail)"
        class="ml-2"
      ></v-app-bar-nav-icon>

      <v-spacer></v-spacer>

      <!-- User Profile -->
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            class="mr-2"
          >
            <v-badge
              color="warning"
              dot
              offset-x="10"
              offset-y="10"
            >
              <v-icon>mdi-bell-outline</v-icon>
            </v-badge>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title>No hay notificaciones</v-list-item-title>
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
          <v-list-item @click="$router.push('/profile')">
            <v-list-item-title>Perfil</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleLogout">
            <v-list-item-title>Cerrar Sesión</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="main-content">
      <router-view />
    </v-main>

    <!-- Bottom Navigation for Mobile -->
    <v-bottom-navigation
      v-model="bottomNav"
      class="d-md-none bottom-nav-custom"
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

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { mobile } = useDisplay()

const drawer = ref(true)
const rail = ref(false)
const bottomNav = ref('dashboard')

const menuItems = [
  { title: 'Inicio', icon: 'mdi-home', to: '/dashboard' },
  { title: 'Usuarios', icon: 'mdi-account-group', to: '/users' },
  { title: 'Informes', icon: 'mdi-chart-line', to: '/reports' },
  { title: 'Perfil', icon: 'mdi-account', to: '/profile' }
]

const bottomNavItems = [
  { title: 'Inicio', icon: 'mdi-home', to: '/dashboard', value: 'dashboard' },
  { title: 'Usuarios', icon: 'mdi-account-group', to: '/users', value: 'users' },
  { title: 'Informes', icon: 'mdi-chart-line', to: '/reports', value: 'reports' },
  { title: 'Perfil', icon: 'mdi-account', to: '/profile', value: 'profile' }
]

const userInitials = computed(() => {
  const name = authStore.user?.nombre || 'U'
  const parts = name.trim().split(/\s+/).filter(p => p.length > 0)
  if (parts.length === 0) return 'U'
  const first = parts[0][0]
  const second = parts.length > 1 ? parts[1][0] : ''
  return (first + second).toUpperCase()
})

// Update bottom navigation based on route
watch(() => route.path, (newPath) => {
  const item = bottomNavItems.find(item => item.to === newPath)
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
    rail.value = false
  } else {
    drawer.value = true
  }
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
</style>
