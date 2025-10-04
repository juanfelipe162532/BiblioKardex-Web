<template>
  <div class="login-page">
    <v-container fluid class="login-container">
      <v-row no-gutters class="login-row">

        <!-- Left Side - Login Form -->
        <v-col cols="12" md="6" class="login-section">
          <div class="login-content">

            <!-- Mobile Logo (visible only on mobile) -->
            <div class="mobile-logo text-center mb-4 d-md-none">
              <v-avatar size="50" class="logo-avatar mb-2" color="transparent">
                <v-img src="/src/assets/logo.png" alt="BiblioKardex Logo" width="35" height="35" />
              </v-avatar>
              <h2 class="mobile-brand-title mb-1">BiblioKardex</h2>
            </div>

            <!-- Login Form Card -->
            <v-card class="login-card" elevation="0">
              <v-card-title class="text-left pt-8 pb-3">
                <div class="w-100">
                  <h1 class="form-title mb-2">Iniciar Sesión</h1>
                  <p class="form-subtitle">Bienvenido de vuelta, accede a tu biblioteca</p>
                </div>
              </v-card-title>

              <v-card-text class="px-8 pb-8">
                <v-form v-model="valid" @submit.prevent="handleLogin">

                  <!-- Email Field -->
                  <div class="mb-5">
                    <label class="field-label">Correo electrónico</label>
                    <v-text-field v-model="email" :rules="emailRules" placeholder="ejemplo@correo.com"
                      prepend-inner-icon="mdi-email-outline" variant="outlined" density="comfortable"
                      hide-details="auto" color="primary" class="mb-1" />
                  </div>

                  <!-- Password Field -->
                  <div class="mb-5">
                    <label class="field-label">Contraseña</label>
                    <v-text-field v-model="password" :rules="passwordRules" :type="showPassword ? 'text' : 'password'"
                      placeholder="Tu contraseña" prepend-inner-icon="mdi-lock-outline"
                      :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                      @click:append-inner="showPassword = !showPassword" variant="outlined" density="comfortable"
                      hide-details="auto" color="primary" class="mb-1" />
                  </div>

                  <!-- Forgot Password -->
                  <div class="text-right mb-5">
                    <v-btn variant="text" size="small" color="primary" class="text-none">
                      ¿Olvidaste tu contraseña?
                    </v-btn>
                  </div>

                  <!-- Error Alert -->
                  <v-alert v-if="authStore.error" type="error" variant="tonal" density="compact" class="mb-5" closable
                    @click:close="authStore.clearError">
                    {{ authStore.error }}
                  </v-alert>

                  <!-- Login Button -->
                  <v-btn :loading="authStore.loading" :disabled="!valid || authStore.loading" color="primary"
                    size="large" block class="login-btn mb-5" variant="elevated" @click="handleLogin">
                    Iniciar Sesión
                  </v-btn>

                  <!-- Register Link -->
                  <div class="text-center">
                    <span class="text-body-2 text-medium-emphasis">¿No tienes cuenta? </span>
                    <v-btn variant="text" size="small" color="primary" class="text-none pa-0"
                      @click="$router.push('/register')">
                      Regístrate aquí
                    </v-btn>
                  </div>

                </v-form>
              </v-card-text>
            </v-card>

          </div>
        </v-col>

        <!-- Right Side - Branding & Visual Elements -->
        <v-col cols="12" md="6" class="branding-section d-none d-md-flex">
          <div class="branding-content">

            <!-- Main Logo and Brand -->
            <div class="brand-section text-center mb-6">
              <v-avatar size="80" class="logo-avatar mb-4" color="transparent">
                <v-img src="/src/assets/logo.png" alt="BiblioKardex Logo" width="60" height="60" />
              </v-avatar>

              <h1 class="brand-title mb-2">BiblioKardex Web</h1>

              <v-chip size="small" class="beta-chip mb-4" color="#06B6D4" text-color="white">
                <v-icon start size="x-small">mdi-beta</v-icon>
                BETA
              </v-chip>

              <h2 class="welcome-text mb-1">Tu Biblioteca Inteligente</h2>
              <p class="tagline mb-6">Gestiona y organiza el mundo de los libros</p>
            </div>

            <!-- Features with Icons -->
            <div class="features-section">
              <div class="feature-item mb-4">
                <v-icon size="30" color="#06B6D4" class="feature-icon mb-2">mdi-bookshelf</v-icon>
                <h3 class="feature-title">Gestión Completa</h3>
                <p class="feature-description">Administra tu colección de libros</p>
              </div>

              <div class="feature-item mb-4">
                <v-icon size="30" color="#7C3AED" class="feature-icon mb-2">mdi-chart-line</v-icon>
                <h3 class="feature-title">Estadísticas</h3>
                <p class="feature-description">Visualiza el uso de tu biblioteca</p>
              </div>

              <div class="feature-item">
                <v-icon size="30" color="#F59E0B" class="feature-icon mb-2">mdi-account-group</v-icon>
                <h3 class="feature-title">Colaboración</h3>
                <p class="feature-description">Trabaja en equipo fácilmente</p>
              </div>
            </div>

            <!-- Floating Book Icons -->
            <div class="floating-icons">
              <v-icon class="floating-icon icon-1" color="rgba(255,255,255,0.6)"
                size="24">mdi-book-open-page-variant</v-icon>
              <v-icon class="floating-icon icon-2" color="rgba(255,255,255,0.4)" size="20">mdi-book</v-icon>
              <v-icon class="floating-icon icon-3" color="rgba(255,255,255,0.5)" size="18">mdi-library</v-icon>
              <v-icon class="floating-icon icon-4" color="rgba(255,255,255,0.3)" size="16">mdi-bookmark</v-icon>
              <v-icon class="floating-icon icon-5" color="rgba(255,255,255,0.4)" size="22">mdi-book-multiple</v-icon>
            </div>
          </div>
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
  overflow: hidden;
  position: relative;
}

.login-container {
  width: 100%;
  height: 100vh;
  padding: 0;
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

/* Left Side - Login Section */
.login-section {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
}

.login-content {
  width: 100%;
  max-width: 420px;
}

/* Mobile Logo */
.mobile-logo .logo-avatar {
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mobile-brand-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
}

/* Login Card */
.login-card {
  background: #ffffff !important;
  border: none;
  box-shadow: none;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
  line-height: 1.2;
}

.form-subtitle {
  font-size: 1rem;
  color: #64748B;
  margin: 0;
  line-height: 1.5;
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
  height: 52px !important;
  font-weight: 600 !important;
  font-size: 1rem !important;
  text-transform: none !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(30, 58, 138, 0.25) !important;
  transition: all 0.3s ease;
}

.login-btn:hover {
  box-shadow: 0 8px 30px rgba(30, 58, 138, 0.35) !important;
  transform: translateY(-2px);
}

.login-btn:disabled {
  opacity: 0.6 !important;
  transform: none !important;
}

/* Right Side - Branding Section */
.branding-section {
  background: linear-gradient(-45deg, #1E3A8A, #3B82F6, #7C3AED, #8B5CF6);
  background-size: 400% 400%;
  animation: gradientShift 8s ease-in-out infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
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

.branding-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 60%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 60%),
    radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.1) 0%, transparent 50%);
  pointer-events: none;
  animation: floatingLights 12s ease-in-out infinite;
}

@keyframes floatingLights {

  0%,
  100% {
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

.branding-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 400px;
}

/* Branding Elements */
.logo-avatar {
  border: 4px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(15px);
  animation: logoFloat 6s ease-in-out infinite;
}

@keyframes logoFloat {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-12px);
  }
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
  letter-spacing: -0.01em;
}

.beta-chip {
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  font-weight: 600;
}

.welcome-text {
  font-size: 1.2rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.tagline {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.5;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Features Section */
.features-section {
  text-align: left;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.feature-icon {
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.3rem 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.feature-description {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
  line-height: 1.4;
}

/* Floating Icons */
.floating-icons {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.floating-icon {
  position: absolute;
  animation: float 6s ease-in-out infinite;
}

.icon-1 {
  top: 20%;
  left: 15%;
  animation-delay: 0s;
}

.icon-2 {
  top: 60%;
  left: 10%;
  animation-delay: 1s;
}

.icon-3 {
  top: 15%;
  right: 20%;
  animation-delay: 2s;
}

.icon-4 {
  bottom: 30%;
  right: 15%;
  animation-delay: 3s;
}

.icon-5 {
  bottom: 15%;
  left: 25%;
  animation-delay: 4s;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.6;
  }

  25% {
    transform: translateY(-20px) rotate(5deg);
    opacity: 0.8;
  }

  50% {
    transform: translateY(-10px) rotate(-3deg);
    opacity: 0.4;
  }

  75% {
    transform: translateY(-15px) rotate(2deg);
    opacity: 0.7;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .login-section {
    padding: 1.5rem;
  }

  .login-content {
    max-width: 100%;
  }

  .form-title {
    font-size: 1.75rem;
  }

  .form-subtitle {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .login-section {
    padding: 1rem;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .login-btn {
    height: 48px !important;
  }
}
</style>
