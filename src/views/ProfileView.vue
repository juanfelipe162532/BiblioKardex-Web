<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold text--primary">Perfil de Usuario</h1>
      <p class="text-body-1 text--secondary mt-1">Gestiona tu información personal y configuración</p>
    </div>

    <v-row>
      <!-- Profile Info -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="text-center pa-6">
          <v-avatar size="120" color="primary" class="mb-4">
            <span class="text-h3 white--text font-weight-bold">{{ userInitials }}</span>
          </v-avatar>
          
          <h2 class="text-h5 font-weight-bold text--primary mb-1">{{ authStore.user?.nombre }}</h2>
          <p class="text-body-1 text--secondary mb-2">{{ authStore.user?.email }}</p>
          
          <v-chip color="success" text-color="white" class="mb-4">
            <v-icon left small>mdi-check-circle</v-icon>
            Cuenta Verificada
          </v-chip>
          
          <div class="profile-stats">
            <v-row class="text-center">
              <v-col cols="4">
                <p class="text-h5 font-weight-bold text--primary mb-0">156</p>
                <p class="text-caption text--secondary">Libros Agregados</p>
              </v-col>
              <v-col cols="4">
                <p class="text-h5 font-weight-bold text--primary mb-0">1,248</p>
                <p class="text-caption text--secondary">Préstamos</p>
              </v-col>
              <v-col cols="4">
                <p class="text-h5 font-weight-bold text--primary mb-0">342</p>
                <p class="text-caption text--secondary">Usuarios</p>
              </v-col>
            </v-row>
          </div>
          
          <v-btn color="primary" outlined block class="mt-4 text-none">
            <v-icon left>mdi-camera</v-icon>
            Cambiar Foto
          </v-btn>
        </v-card>
      </v-col>

      <!-- Profile Settings -->
      <v-col cols="12" md="8">
        <v-tabs v-model="activeTab" background-color="transparent" color="primary">
          <v-tab>Información Personal</v-tab>
          <v-tab>Biblioteca</v-tab>
          <v-tab>Configuración</v-tab>
          <v-tab>Seguridad</v-tab>
        </v-tabs>

        <v-tabs-items v-model="activeTab">
          <!-- Personal Information -->
          <v-tab-item>
            <v-card elevation="2" class="mt-4">
              <v-card-title>Información Personal</v-card-title>
              <v-card-text>
                <v-form ref="personalForm" v-model="personalValid">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="personalInfo.nombre"
                        label="Nombre completo"
                        outlined
                        :rules="nameRules"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="personalInfo.email"
                        label="Correo electrónico"
                        outlined
                        :rules="emailRules"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="personalInfo.telefono"
                        label="Teléfono"
                        outlined
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="personalInfo.cargo"
                        label="Cargo"
                        outlined
                      />
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn color="primary" :disabled="!personalValid" @click="savePersonalInfo">
                  Guardar Cambios
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-tab-item>

          <!-- Library Info -->
          <v-tab-item>
            <v-card elevation="2" class="mt-4">
              <v-card-title>Información de Biblioteca</v-card-title>
              <v-card-text>
                <v-form ref="libraryForm" v-model="libraryValid">
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-model="libraryInfo.nombre"
                        label="Nombre de la biblioteca"
                        outlined
                        :rules="nameRules"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="libraryInfo.direccion"
                        label="Dirección"
                        outlined
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="libraryInfo.telefono"
                        label="Teléfono"
                        outlined
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="libraryInfo.tipo"
                        :items="libraryTypes"
                        label="Tipo de biblioteca"
                        outlined
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="libraryInfo.horario"
                        label="Horario de atención"
                        outlined
                        placeholder="Ej: Lun-Vie 8:00-18:00"
                      />
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn color="primary" :disabled="!libraryValid" @click="saveLibraryInfo">
                  Guardar Cambios
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-tab-item>

          <!-- Configuration -->
          <v-tab-item>
            <v-card elevation="2" class="mt-4">
              <v-card-title>Configuración General</v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Notificaciones por correo</v-list-item-title>
                      <v-list-item-subtitle>Recibir alertas de préstamos vencidos</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-switch v-model="config.emailNotifications" color="primary" />
                    </v-list-item-action>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Tema oscuro</v-list-item-title>
                      <v-list-item-subtitle>Cambiar apariencia de la aplicación</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-switch v-model="config.darkTheme" color="primary" />
                    </v-list-item-action>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Recordatorios automáticos</v-list-item-title>
                      <v-list-item-subtitle>Enviar recordatorios de devolución</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-switch v-model="config.autoReminders" color="primary" />
                    </v-list-item-action>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Periodo de préstamo por defecto</v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-select
                        v-model="config.defaultLoanPeriod"
                        :items="loanPeriods"
                        dense
                        outlined
                        style="max-width: 120px"
                      />
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn color="primary" @click="saveConfig">
                  Guardar Configuración
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-tab-item>

          <!-- Security -->
          <v-tab-item>
            <v-card elevation="2" class="mt-4">
              <v-card-title>Seguridad</v-card-title>
              <v-card-text>
                <v-form ref="securityForm" v-model="securityValid">
                  <h3 class="text-h6 mb-4">Cambiar Contraseña</h3>
                  <v-text-field
                    v-model="security.currentPassword"
                    label="Contraseña actual"
                    type="password"
                    outlined
                    :rules="passwordRules"
                  />
                  <v-text-field
                    v-model="security.newPassword"
                    label="Nueva contraseña"
                    type="password"
                    outlined
                    :rules="newPasswordRules"
                  />
                  <v-text-field
                    v-model="security.confirmPassword"
                    label="Confirmar nueva contraseña"
                    type="password"
                    outlined
                    :rules="confirmPasswordRules"
                  />
                  
                  <v-divider class="my-6" />
                  
                  <h3 class="text-h6 mb-4">Autenticación de Dos Factores</h3>
                  <div class="d-flex align-center">
                    <div class="flex-grow-1">
                      <p class="text-body-1 mb-1">Estado: 
                        <v-chip :color="security.twoFactorEnabled ? 'success' : 'warning'" small text-color="white">
                          {{ security.twoFactorEnabled ? 'Activado' : 'Desactivado' }}
                        </v-chip>
                      </p>
                      <p class="text-body-2 text--secondary">
                        Agrega una capa extra de seguridad a tu cuenta
                      </p>
                    </div>
                    <v-btn 
                      :color="security.twoFactorEnabled ? 'error' : 'success'" 
                      outlined
                      @click="toggleTwoFactor"
                    >
                      {{ security.twoFactorEnabled ? 'Desactivar' : 'Activar' }}
                    </v-btn>
                  </div>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn color="primary" :disabled="!securityValid" @click="changePassword">
                  Cambiar Contraseña
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const activeTab = ref(0)

const personalValid = ref(false)
const libraryValid = ref(false)
const securityValid = ref(false)

const personalInfo = ref({
  nombre: authStore.user?.nombre || '',
  email: authStore.user?.email || '',
  telefono: '',
  cargo: 'Bibliotecario'
})

const libraryInfo = ref({
  nombre: 'Biblioteca Central',
  direccion: '',
  telefono: '',
  tipo: 'Universitaria',
  horario: 'Lun-Vie 8:00-18:00'
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
  'Nacional'
]

const loanPeriods = [
  '7 días',
  '15 días',
  '30 días',
  '60 días'
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
  // TODO: Implement save personal info
  console.log('Saving personal info:', personalInfo.value)
}

const saveLibraryInfo = () => {
  // TODO: Implement save library info
  console.log('Saving library info:', libraryInfo.value)
}

const saveConfig = () => {
  // TODO: Implement save configuration
  console.log('Saving config:', config.value)
}

const changePassword = () => {
  // TODO: Implement change password
  console.log('Changing password')
}

const toggleTwoFactor = () => {
  security.value.twoFactorEnabled = !security.value.twoFactorEnabled
  // TODO: Implement 2FA toggle
}
</script>

<style scoped>
.profile-stats {
  background: #F8FAFC;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
}

.v-tab {
  font-weight: 500;
}

.v-list-item {
  padding: 16px 0;
}

@media (max-width: 960px) {
  .pa-6 {
    padding: 16px !important;
  }
}
</style>