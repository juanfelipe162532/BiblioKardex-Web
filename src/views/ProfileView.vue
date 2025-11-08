<template>
  <div class="profile-container">
    <!-- Modern Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">Configuración</h1>
          <p class="page-subtitle">Gestiona tu información personal y configuración</p>
        </div>
      </div>
    </div>

    <!-- Settings Tabs Section -->
    <div class="content-section">
      <div class="settings-container">


        <div class="tabs-container">
          <div class="tabs-nav">
            <div
              v-for="(tab, index) in tabs"
              :key="index"
              class="tab-item"
              :class="{ active: activeTab === index }"
              @click="activeTab = index"
            >
              <v-icon :color="activeTab === index ? 'primary' : 'grey-darken-1'" size="20">
                {{ tab.icon }}
              </v-icon>
              <span class="tab-label">{{ tab.label }}</span>
            </div>
          </div>

          <div class="tab-content">
            <!-- Personal Information Tab -->
            <div v-if="activeTab === 0" class="tab-panel">
              <div class="panel-header">
                <h3 class="panel-title">Información Personal</h3>
                <p class="panel-subtitle">Actualiza tus datos personales</p>
              </div>
              
              <v-form ref="personalForm" v-model="personalValid" class="form-content">
                <div class="form-grid">
                  <div class="form-field">
                    <v-text-field
                      v-model="personalInfo.nombre"
                      label="Nombre completo"
                      variant="outlined"
                      :rules="nameRules"
                    />
                  </div>
                  <div class="form-field">
                    <v-text-field
                      v-model="personalInfo.email"
                      label="Correo electrónico"
                      variant="outlined"
                      :rules="emailRules"
                    />
                  </div>
                  <div class="form-field">
                    <v-text-field
                      v-model="personalInfo.telefono"
                      label="Teléfono"
                      variant="outlined"
                    />
                  </div>
                  <div class="form-field">
                    <v-text-field
                      v-model="personalInfo.cargo"
                      label="Cargo"
                      variant="outlined"
                    />
                  </div>
                </div>
                
                <div class="form-actions">
                  <v-btn
                    color="primary"
                    variant="elevated"
                    :disabled="!personalValid"
                    @click="savePersonalInfo"
                  >
                    <v-icon start>mdi-check</v-icon>
                    Guardar Cambios
                  </v-btn>
                </div>
              </v-form>
            </div>

            <!-- Library Information Tab -->
            <div v-if="activeTab === 1" class="tab-panel">
              <div class="panel-header">
                <h3 class="panel-title">Información de Biblioteca</h3>
                <p class="panel-subtitle">Configura los datos de tu biblioteca</p>
              </div>
              
              <v-form ref="libraryForm" v-model="libraryValid" class="form-content">
                <div class="form-grid">
                  <div class="form-field full-width">
                    <v-text-field
                      v-model="libraryInfo.nombre"
                      label="Nombre de la biblioteca"
                      variant="outlined"
                      :rules="nameRules"
                    />
                  </div>
                  <div class="form-field">
                    <v-text-field
                      v-model="libraryInfo.direccion"
                      label="Dirección"
                      variant="outlined"
                    />
                  </div>
                  <div class="form-field">
                    <v-text-field
                      v-model="libraryInfo.telefono"
                      label="Teléfono"
                      variant="outlined"
                    />
                  </div>
                  <div class="form-field">
                    <v-select
                      v-model="libraryInfo.tipo"
                      :items="libraryTypes"
                      label="Tipo de biblioteca"
                      variant="outlined"
                    />
                  </div>
                  <div class="form-field">
                    <v-text-field
                      v-model="libraryInfo.horario"
                      label="Horario de atención"
                      variant="outlined"
                      placeholder="Ej: Lun-Vie 8:00-18:00"
                    />
                  </div>
                </div>
                
                <div class="form-actions">
                  <v-btn
                    color="primary"
                    variant="elevated"
                    :disabled="!libraryValid"
                    @click="saveLibraryInfo"
                  >
                    <v-icon start>mdi-check</v-icon>
                    Guardar Cambios
                  </v-btn>
                </div>
              </v-form>
            </div>

            <!-- Configuration Tab -->
            <div v-if="activeTab === 2" class="tab-panel">
              <div class="panel-header">
                <h3 class="panel-title">Configuración General</h3>
                <p class="panel-subtitle">Personaliza el comportamiento de la aplicación</p>
              </div>
              
              <div class="settings-list">
                <div class="setting-item">
                  <div class="setting-info">
                    <h4 class="setting-title">Notificaciones por correo</h4>
                    <p class="setting-description">Recibir alertas de préstamos vencidos y recordatorios</p>
                  </div>
                  <div class="setting-control">
                    <v-switch
                      v-model="config.emailNotifications"
                      color="primary"
                      hide-details
                    />
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h4 class="setting-title">Tema oscuro</h4>
                    <p class="setting-description">Cambiar la apariencia visual de la aplicación</p>
                  </div>
                  <div class="setting-control">
                    <v-switch
                      v-model="config.darkTheme"
                      color="primary"
                      hide-details
                    />
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h4 class="setting-title">Recordatorios automáticos</h4>
                    <p class="setting-description">Enviar recordatorios automáticos de devolución</p>
                  </div>
                  <div class="setting-control">
                    <v-switch
                      v-model="config.autoReminders"
                      color="primary"
                      hide-details
                    />
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h4 class="setting-title">Periodo de préstamo por defecto</h4>
                    <p class="setting-description">Duración estándar para nuevos préstamos</p>
                  </div>
                  <div class="setting-control">
                    <v-select
                      v-model="config.defaultLoanPeriod"
                      :items="loanPeriods"
                      variant="outlined"
                      density="compact"
                      style="max-width: 140px"
                      hide-details
                    />
                  </div>
                </div>
              </div>
              
              <div class="form-actions">
                <v-btn
                  color="primary"
                  variant="elevated"
                  @click="saveConfig"
                >
                  <v-icon start>mdi-check</v-icon>
                  Guardar Configuración
                </v-btn>
              </div>
            </div>

            <!-- Security Tab -->
            <div v-if="activeTab === 3" class="tab-panel">
              <div class="panel-header">
                <h3 class="panel-title">Seguridad</h3>
                <p class="panel-subtitle">Protege tu cuenta con configuraciones de seguridad</p>
              </div>
              
              <!-- Change Password Section -->
              <div class="security-section">
                <h4 class="security-title">Cambiar Contraseña</h4>
                <v-form ref="securityForm" v-model="securityValid" class="form-content">
                  <div class="form-grid password-grid">
                    <div class="form-field full-width">
                      <v-text-field
                        v-model="security.currentPassword"
                        label="Contraseña actual"
                        type="password"
                        variant="outlined"
                        :rules="passwordRules"
                      />
                    </div>
                    <div class="form-field">
                      <v-text-field
                        v-model="security.newPassword"
                        label="Nueva contraseña"
                        type="password"
                        variant="outlined"
                        :rules="newPasswordRules"
                      />
                    </div>
                    <div class="form-field">
                      <v-text-field
                        v-model="security.confirmPassword"
                        label="Confirmar nueva contraseña"
                        type="password"
                        variant="outlined"
                        :rules="confirmPasswordRules"
                      />
                    </div>
                  </div>
                  
                  <div class="form-actions">
                    <v-btn
                      color="primary"
                      variant="elevated"
                      :disabled="!securityValid"
                      @click="changePassword"
                    >
                      <v-icon start>mdi-lock</v-icon>
                      Cambiar Contraseña
                    </v-btn>
                  </div>
                </v-form>
              </div>

              <!-- Two Factor Authentication -->
              <div class="security-section">
                <h4 class="security-title">Autenticación de Dos Factores</h4>
                <div class="two-factor-card">
                  <div class="two-factor-info">
                    <div class="two-factor-status">
                      <span class="status-label">Estado:</span>
                      <v-chip
                        :color="security.twoFactorEnabled ? 'success' : 'warning'"
                        variant="tonal"
                        size="small"
                      >
                        {{ security.twoFactorEnabled ? 'Activado' : 'Desactivado' }}
                      </v-chip>
                    </div>
                    <p class="two-factor-description">
                      Agrega una capa extra de seguridad a tu cuenta utilizando un código de verificación
                    </p>
                  </div>
                  <div class="two-factor-action">
                    <v-btn
                      :color="security.twoFactorEnabled ? 'error' : 'success'"
                      :variant="security.twoFactorEnabled ? 'outlined' : 'elevated'"
                      @click="toggleTwoFactor"
                    >
                      <v-icon start>
                        {{ security.twoFactorEnabled ? 'mdi-shield-off' : 'mdi-shield-check' }}
                      </v-icon>
                      {{ security.twoFactorEnabled ? 'Desactivar' : 'Activar' }}
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const activeTab = ref(0)

const personalValid = ref(false)
const libraryValid = ref(false)
const securityValid = ref(false)

const tabs = [
  { label: 'Personal', icon: 'mdi-account' },
  { label: 'Biblioteca', icon: 'mdi-library' },
  { label: 'Configuración', icon: 'mdi-cog' },
  { label: 'Seguridad', icon: 'mdi-shield-check' }
]

const personalInfo = ref({
  nombre: authStore.user?.nombre || '',
  email: authStore.user?.email || '',
  telefono: '+57 300 123 4567',
  cargo: 'Bibliotecario Principal'
})

const libraryInfo = ref({
  nombre: 'Biblioteca Central Universidad',
  direccion: 'Calle 45 #23-67, Bogotá, Colombia',
  telefono: '+57 1 234 5678',
  tipo: 'Universitaria',
  horario: 'Lun-Vie 8:00-18:00, Sáb 9:00-14:00'
})

const config = ref({
  emailNotifications: true,
  darkTheme: false,
  autoReminders: true,
  defaultLoanPeriod: '15 días'
})

const security = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  twoFactorEnabled: false
})

const userInitials = computed(() => {
  const name = authStore.user?.nombre || 'U'
  const parts = name.trim().split(/\s+/).filter(p => p.length > 0)
  if (parts.length === 0) return 'U'
  const first = parts[0][0]
  const second = parts.length > 1 ? parts[1][0] : ''
  return (first + second).toUpperCase()
})

const libraryTypes = [
  'Universitaria',
  'Pública',
  'Escolar',
  'Especializada',
  'Nacional',
  'Comunitaria'
]

const loanPeriods = [
  '7 días',
  '15 días',
  '30 días',
  '60 días',
  '90 días'
]

const nameRules = [
  (v: string) => !!v || 'Este campo es requerido',
  (v: string) => v.length >= 2 || 'Debe tener al menos 2 caracteres'
]

const emailRules = [
  (v: string) => !!v || 'El correo es requerido',
  (v: string) => /.+@.+\..+/.test(v) || 'Correo inválido'
]

const passwordRules = [
  (v: string) => !!v || 'La contraseña es requerida'
]

const newPasswordRules = [
  (v: string) => !!v || 'La nueva contraseña es requerida',
  (v: string) => v.length >= 6 || 'Debe tener al menos 6 caracteres'
]

const confirmPasswordRules = [
  (v: string) => !!v || 'Confirma tu contraseña',
  (v: string) => v === security.value.newPassword || 'Las contraseñas no coinciden'
]

const savePersonalInfo = () => {
  console.log('Saving personal info:', personalInfo.value)
}

const saveLibraryInfo = () => {
  console.log('Saving library info:', libraryInfo.value)
}

const saveConfig = () => {
  console.log('Saving config:', config.value)
}

const changePassword = () => {
  console.log('Changing password')
  security.value.currentPassword = ''
  security.value.newPassword = ''
  security.value.confirmPassword = ''
}

const toggleTwoFactor = () => {
  security.value.twoFactorEnabled = !security.value.twoFactorEnabled
}
</script>

<style scoped>
/* Container */
.profile-container {
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

/* Profile Overview */
.profile-overview {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.user-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px;
  border: 1px solid #E2E8F0;
  text-align: center;
  transition: all 0.3s ease;
  max-width: 400px;
  width: 100%;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  border-color: #CBD5E1;
}

.user-avatar-section {
  margin-bottom: 24px;
}

.user-avatar {
  width: 96px;
  height: 96px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.avatar-text {
  color: #ffffff;
  font-weight: 700;
  font-size: 32px;
}

.user-name {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1E293B;
}

.user-email {
  margin: 0;
  font-size: 14px;
  color: #64748B;
}

/* Settings */
.settings-container {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
}

.tabs-header {
  padding: 24px;
  border-bottom: 1px solid #E2E8F0;
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

.tabs-container {
  display: grid;
  grid-template-columns: 240px 1fr;
}

.tabs-nav {
  background: #F8FAFC;
  border-right: 1px solid #E2E8F0;
  padding: 0;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-right: 3px solid transparent;
}

.tab-item:hover {
  background: #F1F5F9;
}

.tab-item.active {
  background: #ffffff;
  border-right-color: #6366F1;
}

.tab-label {
  font-size: 14px;
  font-weight: 600;
  color: #64748B;
}

.tab-item.active .tab-label {
  color: #1E293B;
}

.tab-content {
  padding: 0;
}

.tab-panel {
  padding: 32px;
}

.panel-header {
  margin-bottom: 32px;
}

.panel-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1E293B;
}

.panel-subtitle {
  margin: 0;
  font-size: 14px;
  color: #64748B;
}

/* Forms */
.form-content {
  margin-bottom: 32px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.password-grid {
  grid-template-columns: 1fr;
  gap: 16px;
}

.password-grid .form-field:not(.full-width) {
  grid-column: auto;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Settings List */
.settings-list {
  margin-bottom: 32px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-bottom: 1px solid #F1F5F9;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
}

.setting-description {
  margin: 0;
  font-size: 14px;
  color: #64748B;
}

.setting-control {
  margin-left: 20px;
}

/* Security Sections */
.security-section {
  margin-bottom: 40px;
}

.security-section:last-child {
  margin-bottom: 0;
}

.security-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 700;
  color: #1E293B;
}

.two-factor-card {
  background: #F8FAFC;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.two-factor-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.status-label {
  font-size: 14px;
  font-weight: 600;
  color: #1E293B;
}

.two-factor-description {
  margin: 0;
  font-size: 14px;
  color: #64748B;
}

.two-factor-action {
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .profile-overview {
    grid-template-columns: 1fr;
  }
  
  .tabs-container {
    grid-template-columns: 1fr;
  }
  
  .tabs-nav {
    border-right: none;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    overflow-x: auto;
  }
  
  .tab-item {
    border-right: none;
    border-bottom: 3px solid transparent;
    white-space: nowrap;
  }
  
  .tab-item.active {
    border-right: none;
    border-bottom-color: #6366F1;
  }
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .two-factor-card {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  
  .tabs-nav {
    padding: 0 24px;
  }
  
  .tab-item {
    padding: 16px 0;
    margin-right: 32px;
  }
}

@media (max-width: 480px) {
  .content-section {
    padding: 16px;
  }
  
  .user-card {
    padding: 24px;
  }
  
  .tab-panel {
    padding: 24px;
  }
  
  .form-actions {
    justify-content: stretch;
  }
  
  .form-actions .v-btn {
    flex: 1;
  }
}
</style>