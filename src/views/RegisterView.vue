<template>
  <v-main>
      <v-container fluid class="fill-height pa-0">
        <v-row no-gutters class="fill-height">
          <!-- Left side - Gradient background with logo -->
          <v-col cols="12" md="6" class="gradient-bg d-flex align-center justify-center">
            <div class="text-center white--text">
              <v-fade-transition>
                <div v-show="!loading">
                  <div class="logo-container mb-6">
                    <v-avatar size="80" class="logo-avatar">
                      <v-icon size="40" color="white">mdi-book-open-page-variant</v-icon>
                    </v-avatar>
                  </div>
                  <h1 class="display-1 font-weight-bold mb-2">BiblioKardex</h1>
                  <v-chip color="rgba(255,255,255,0.2)" text-color="white" class="mb-4">
                    <v-icon left small>mdi-beta</v-icon>
                    BETA
                  </v-chip>
                  <p class="subtitle-1 mb-0">Únete a nosotros</p>
                  <p class="body-2 opacity-80">Crea tu biblioteca inteligente</p>
                </div>
              </v-fade-transition>
            </div>
          </v-col>

          <!-- Right side - Register form -->
          <v-col cols="12" md="6" class="d-flex align-center justify-center pa-8">
            <v-card 
              elevation="0" 
              max-width="400" 
              width="100%"
              class="transparent"
            >
              <v-slide-y-transition>
                <div v-show="!loading">
                  <v-card-title class="text-center pb-2">
                    <div class="w-100">
                      <h2 class="text-h5 font-weight-bold text--primary">Crear Cuenta</h2>
                      <p class="text-body-2 text--secondary mt-1">
                        Regístrate para comenzar
                      </p>
                    </div>
                  </v-card-title>

                  <v-card-text>
                    <v-form ref="form" v-model="valid" @submit.prevent="handleRegister">
                      <!-- Name Field -->
                      <div class="mb-4">
                        <label class="text-body-2 font-weight-medium text--primary mb-2 d-block">
                          Nombre completo
                        </label>
                        <v-text-field
                          v-model="formData.name"
                          :rules="nameRules"
                          placeholder="Tu nombre completo"
                          prepend-inner-icon="mdi-account-outline"
                          outlined
                          dense
                          hide-details="auto"
                          class="custom-field"
                        />
                      </div>

                      <!-- Email Field -->
                      <div class="mb-4">
                        <label class="text-body-2 font-weight-medium text--primary mb-2 d-block">
                          Correo electrónico
                        </label>
                        <v-text-field
                          v-model="formData.email"
                          :rules="emailRules"
                          placeholder="ejemplo@correo.com"
                          prepend-inner-icon="mdi-email-outline"
                          outlined
                          dense
                          hide-details="auto"
                          class="custom-field"
                        />
                      </div>

                      <!-- Password Field -->
                      <div class="mb-4">
                        <label class="text-body-2 font-weight-medium text--primary mb-2 d-block">
                          Contraseña
                        </label>
                        <v-text-field
                          v-model="formData.password"
                          :rules="passwordRules"
                          :type="showPassword ? 'text' : 'password'"
                          placeholder="Tu contraseña"
                          prepend-inner-icon="mdi-lock-outline"
                          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                          @click:append="showPassword = !showPassword"
                          outlined
                          dense
                          hide-details="auto"
                          class="custom-field"
                        />
                      </div>

                      <!-- Confirm Password Field -->
                      <div class="mb-4">
                        <label class="text-body-2 font-weight-medium text--primary mb-2 d-block">
                          Confirmar contraseña
                        </label>
                        <v-text-field
                          v-model="formData.confirmPassword"
                          :rules="confirmPasswordRules"
                          :type="showConfirmPassword ? 'text' : 'password'"
                          placeholder="Confirma tu contraseña"
                          prepend-inner-icon="mdi-lock-outline"
                          :append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                          @click:append="showConfirmPassword = !showConfirmPassword"
                          outlined
                          dense
                          hide-details="auto"
                          class="custom-field"
                        />
                      </div>

                      <!-- Terms and Conditions -->
                      <div class="mb-6">
                        <v-checkbox
                          v-model="formData.acceptTerms"
                          :rules="termsRules"
                          color="primary"
                          hide-details="auto"
                        >
                          <template #label>
                            <span class="text-body-2">
                              Acepto los 
                              <a href="#" class="text-decoration-none text--primary">términos y condiciones</a>
                            </span>
                          </template>
                        </v-checkbox>
                      </div>

                      <!-- Error Alert -->
                      <v-alert
                        v-if="error"
                        type="error"
                        dense
                        outlined
                        class="mb-4"
                        dismissible
                        @input="error = null"
                      >
                        {{ error }}
                      </v-alert>

                      <!-- Register Button -->
                      <v-btn
                        :loading="loading"
                        :disabled="!valid || loading"
                        color="primary"
                        large
                        block
                        class="gradient-btn text-none font-weight-medium"
                        elevation="4"
                        @click="handleRegister"
                      >
                        Crear Cuenta
                      </v-btn>

                      <!-- Login Link -->
                      <div class="text-center mt-4">
                        <v-btn
                          text
                          color="primary"
                          class="text-none"
                          @click="$router.push('/')"
                        >
                          ¿Ya tienes cuenta? Inicia sesión
                        </v-btn>
                      </div>
                    </v-form>
                  </v-card-text>
                </div>
              </v-slide-y-transition>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const valid = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const formData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const nameRules = [
  (v: string) => !!v || 'El nombre es requerido',
  (v: string) => v.length >= 2 || 'El nombre debe tener al menos 2 caracteres'
]

const emailRules = [
  (v: string) => !!v || 'El correo es requerido',
  (v: string) => /.+@.+\..+/.test(v) || 'Correo inválido'
]

const passwordRules = [
  (v: string) => !!v || 'La contraseña es requerida',
  (v: string) => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
]

const confirmPasswordRules = [
  (v: string) => !!v || 'Confirma tu contraseña',
  (v: string) => v === formData.value.password || 'Las contraseñas no coinciden'
]

const termsRules = [
  (v: boolean) => !!v || 'Debes aceptar los términos y condiciones'
]

const handleRegister = async () => {
  const form = document.querySelector('form') as HTMLFormElement
  if (form?.checkValidity() && valid.value) {
    loading.value = true
    error.value = null

    try {
      // Simulate registration API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate success and redirect to login
      router.push('/')
    } catch (err) {
      error.value = 'Error al crear la cuenta. Intenta de nuevo.'
    } finally {
      loading.value = false
    }
  }
}
</script>

<style scoped>
.gradient-bg {
  background: linear-gradient(135deg, #1E3A8A 0%, #7C3AED 100%);
  min-height: 100vh;
}

.logo-container {
  position: relative;
}

.logo-avatar {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.gradient-btn {
  background: linear-gradient(135deg, #1E3A8A 0%, #7C3AED 100%) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3) !important;
}

.gradient-btn:hover {
  box-shadow: 0 6px 20px rgba(30, 58, 138, 0.4) !important;
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

.custom-field :deep(.v-input__control .v-input__slot) {
  background: #F8FAFC !important;
  border-color: #E2E8F0 !important;
}

.custom-field :deep(.v-input__control .v-input__slot:hover) {
  border-color: #1E3A8A !important;
}

.custom-field :deep(.v-input--is-focused .v-input__control .v-input__slot) {
  border-color: #1E3A8A !important;
  border-width: 2px !important;
}

.opacity-80 {
  opacity: 0.8;
}

@media (max-width: 960px) {
  .gradient-bg {
    min-height: 40vh;
  }
}
</style>
