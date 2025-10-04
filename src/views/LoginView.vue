<template>
  <div class="login-page">
    <v-container fluid class="login-container">
      <v-row justify="center" align="center" class="login-row">
        <v-col cols="12" sm="10" md="8" lg="6" xl="4">
          
          <!-- Logo and Branding -->
          <div class="brand-section text-center mb-6">
            <v-avatar size="70" class="logo-avatar mb-3" color="transparent">
              <v-img 
                src="@/assets/logo.png" 
                alt="BiblioKardex Logo"
                width="50"
                height="50"
              />
            </v-avatar>
            
            <h1 class="brand-title mb-2">BiblioKardex</h1>
            
            <v-chip 
              size="small" 
              class="beta-chip mb-3" 
              color="#06B6D4" 
              text-color="white"
            >
              <v-icon start size="x-small">mdi-beta</v-icon>
              BETA
            </v-chip>
            
            <p class="welcome-text mb-1">Bienvenido de vuelta</p>
            <p class="tagline">Tu biblioteca inteligente</p>
          </div>

          <!-- Login Form Card -->
          <v-card class="login-card mx-auto" max-width="380" elevation="16">
            <v-card-title class="text-center pt-6 pb-3">
              <div class="w-100">
                <h2 class="form-title">Iniciar Sesión</h2>
                <p class="form-subtitle">Accede a tu cuenta</p>
              </div>
            </v-card-title>

            <v-card-text class="px-6 pb-6">
              <v-form v-model="valid" @submit.prevent="handleLogin">
                
                <!-- Email Field -->
                <div class="mb-4">
                  <label class="field-label">Correo electrónico</label>
                  <v-text-field
                    v-model="email"
                    :rules="emailRules"
                    placeholder="ejemplo@correo.com"
                    prepend-inner-icon="mdi-email-outline"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    color="primary"
                    class="mb-1"
                  />
                </div>

                <!-- Password Field -->
                <div class="mb-4">
                  <label class="field-label">Contraseña</label>
                  <v-text-field
                    v-model="password"
                    :rules="passwordRules"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Tu contraseña"
                    prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="showPassword = !showPassword"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    color="primary"
                    class="mb-1"
                  />
                </div>

                <!-- Forgot Password -->
                <div class="text-right mb-4">
                  <v-btn variant="text" size="small" color="primary" class="text-none">
                    ¿Olvidaste tu contraseña?
                  </v-btn>
                </div>

                <!-- Error Alert -->
                <v-alert
                  v-if="authStore.error"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                  closable
                  @click:close="authStore.clearError"
                >
                  {{ authStore.error }}
                </v-alert>

                <!-- Login Button -->
                <v-btn
                  :loading="authStore.loading"
                  :disabled="!valid || authStore.loading"
                  color="primary"
                  size="large"
                  block
                  class="login-btn mb-4"
                  variant="elevated"
                  @click="handleLogin"
                >
                  Iniciar Sesión
                </v-btn>

                <!-- Register Link -->
                <div class="text-center">
                  <span class="text-body-2 text-medium-emphasis">¿No tienes cuenta? </span>
                  <v-btn
                    variant="text"
                    size="small"
                    color="primary"
                    class="text-none pa-0"
                    @click="$router.push('/register')"
                  >
                    Regístrate aquí
                  </v-btn>
                </div>

              </v-form>
            </v-card-text>
          </v-card>

        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const valid = ref(false)
const email = ref('')
const password = ref('')
const showPassword = ref(false)

const emailRules = [
  (v: string) => !!v || 'Ingresa tu correo',
  (v: string) => /.+@.+\..+/.test(v) || 'Correo inválido',
]

const passwordRules = [
  (v: string) => !!v || 'Ingresa tu contraseña',
]

const handleLogin = async () => {
  if (valid.value) {
    const user = await authStore.signIn(email.value, password.value)
    if (user) {
      router.push('/dashboard')
    }
  }
}
</script>

<style scoped>
/* Full Screen Layout */
.login-page {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  background: linear-gradient(-45deg, #1E3A8A, #3B82F6, #7C3AED, #8B5CF6);
  background-size: 400% 400%;
  animation: gradientShift 8s ease-in-out infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 60%),
    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 60%),
    radial-gradient(circle at 40% 40%, rgba(6,182,212,0.1) 0%, transparent 50%);
  pointer-events: none;
  animation: floatingLights 12s ease-in-out infinite;
}

@keyframes floatingLights {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  25% {
    transform: translate(-10px, -15px) scale(1.05);
    opacity: 0.8;
  }
  50% {
    transform: translate(15px, -10px) scale(0.95);
    opacity: 0.9;
  }
  75% {
    transform: translate(-5px, 10px) scale(1.02);
    opacity: 0.85;
  }
}

.login-container {
  width: 100%;
  height: 100vh;
  padding: 1rem;
  position: relative;
  z-index: 1;
  margin: 0;
  max-width: none;
}

.login-row {
  height: 100vh;
  margin: 0;
  width: 100%;
}

/* Branding */
.logo-avatar {
  border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  animation: logoFloat 6s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.brand-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.01em;
}

.beta-chip {
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.welcome-text {
  font-size: 1.1rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
}

.tagline {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* Login Card */
.login-card {
  background: rgba(255, 255, 255, 0.97) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px !important;
  animation: cardGlow 10s ease-in-out infinite;
}

@keyframes cardGlow {
  0%, 100% {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow: 0 12px 40px rgba(30, 58, 138, 0.15), 0 0 0 1px rgba(124, 58, 237, 0.4);
  }
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1E293B;
  margin: 0;
}

.form-subtitle {
  font-size: 0.9rem;
  color: #64748B;
  margin: 0;
}

/* Form Fields */
.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

/* Login Button */
.login-btn {
  background: linear-gradient(135deg, #1E3A8A 0%, #7C3AED 100%) !important;
  color: white !important;
  height: 48px !important;
  font-weight: 500 !important;
  font-size: 0.95rem !important;
  text-transform: none !important;
  border-radius: 10px !important;
  box-shadow: 0 4px 16px rgba(30, 58, 138, 0.3) !important;
  transition: all 0.3s ease;
}

.login-btn:hover {
  box-shadow: 0 8px 30px rgba(30, 58, 138, 0.4) !important;
  transform: translateY(-2px);
}

.login-btn:disabled {
  opacity: 0.6 !important;
  transform: none !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .login-container {
    padding: 1rem 0.5rem;
  }
  
  .brand-title {
    font-size: 2.5rem;
  }
  
  .logo-avatar {
    width: 80px !important;
    height: 80px !important;
  }
  
  .logo-avatar .v-icon {
    font-size: 40px !important;
  }
  
  .welcome-text {
    font-size: 1.1rem;
  }
  
  .tagline {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .brand-title {
    font-size: 2rem;
  }
  
  .login-card {
    margin: 0 0.5rem;
  }
}
</style>
