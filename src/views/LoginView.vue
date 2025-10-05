<template>
  <div class="login-page">
    <!-- Full Screen Loading Overlay -->
    <div v-if="loadingAuth" class="fullscreen-loading">
      <div class="loading-content">
        <div class="loading-animation">
          <v-progress-circular 
            indeterminate 
            color="white" 
            size="100" 
            width="6"
            class="loading-spinner"
          ></v-progress-circular>
        </div>
        
        <h1 class="loading-title">{{ loadingMessages[loadingStep] || loadingMessages[0] }}</h1>
        
        <div class="loading-progress-bar">
          <v-progress-linear 
            :model-value="((loadingStep + 1) / loadingMessages.length) * 100"
            color="white"
            height="6"
            rounded
            class="custom-progress"
          ></v-progress-linear>
          <p class="progress-text">{{ loadingStep + 1 }} de {{ loadingMessages.length }}</p>
        </div>

        <div class="loading-dots">
          <div class="dot" :class="{ active: loadingStep >= 0 }"></div>
          <div class="dot" :class="{ active: loadingStep >= 1 }"></div>
          <div class="dot" :class="{ active: loadingStep >= 2 }"></div>
          <div class="dot" :class="{ active: loadingStep >= 3 }"></div>
          <div class="dot" :class="{ active: loadingStep >= 4 }"></div>
        </div>

        <div class="user-welcome">
          <p class="welcome-message">{{ successMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Full Screen Success Overlay -->
    <div v-else-if="authSuccess" class="fullscreen-success">
      <div class="success-content">
        <div class="success-animation">
          <v-icon size="120" color="white" class="success-icon">mdi-check-circle</v-icon>
        </div>
        <h1 class="success-title">¡Autenticación Exitosa!</h1>
        <p class="success-message">{{ successMessage }}</p>
        <div class="success-progress">
          <v-progress-linear indeterminate color="white" height="4" rounded></v-progress-linear>
          <p class="redirect-text">Redirigiendo al dashboard...</p>
        </div>
      </div>
    </div>

    <v-container fluid class="login-container" v-else>
      <v-row no-gutters class="login-row">

        <!-- Left Side - Login Form -->
        <v-col cols="12" md="6" class="login-section">
          <div class="login-content">

            <!-- Mobile Logo (visible only on mobile) -->
            <div class="mobile-logo text-center mb-4 d-md-none">
              <v-avatar size="50" class="logo-avatar mb-2" color="transparent">
                <v-img :src="logoUrl" alt="BiblioKardex Logo" width="35" height="35" />
              </v-avatar>
              <h2 class="mobile-brand-title mb-1">BiblioKardex</h2>
            </div>

            <!-- Login Form Card -->
            <v-card class="login-card" elevation="0">
              <v-card-title class="text-left pt-8 pb-3">
                <div class="w-100">
                  <h1 class="form-title mb-2">Iniciar Sesión</h1>
                  <p class="form-subtitle">Escanea el código QR con tu app móvil BiblioKardex</p>
                </div>
              </v-card-title>

              <v-card-text class="px-8 pb-8">
                <!-- QR Code Section -->
                <div class="qr-section text-center mb-6">
                  <div class="qr-container-main">
                    <!-- QR Loading State -->
                    <div v-if="qrLoading" class="qr-loading">
                      <v-progress-circular indeterminate color="primary" size="80"></v-progress-circular>
                      <p class="text-h6 mt-4">Generando código QR...</p>
                    </div>

                    <!-- QR Code Display -->
                    <div v-else-if="qrCode" class="qr-code-wrapper">
                      <div class="qr-code-main">
                        <div v-html="qrCode" class="qr-svg"></div>
                        <!-- Logo overlay in center of QR -->
                        <div class="qr-logo-overlay">
                          <img src="@/assets/QR_logo.png" alt="BiblioKardex" class="qr-logo-img" />
                        </div>
                      </div>
                      <div class="qr-instructions mt-4">
                        <div class="instruction-item">
                          <v-icon color="primary" size="24" class="mr-2">mdi-cellphone</v-icon>
                          <span class="text-body-1">1. Abre BiblioKardex en tu móvil</span>
                        </div>
                        <div class="instruction-item">
                          <v-icon color="primary" size="24" class="mr-2">mdi-qrcode-scan</v-icon>
                          <span class="text-body-1">2. Ve a Perfil → "Escanear QR Web"</span>
                        </div>
                        <div class="instruction-item">
                          <v-icon color="primary" size="24" class="mr-2">mdi-camera</v-icon>
                          <span class="text-body-1">3. Apunta la cámara a este código</span>
                        </div>
                      </div>
                    </div>

                    <!-- QR Error State -->
                    <div v-else class="qr-error">
                      <v-icon size="80" color="error">mdi-qrcode-remove</v-icon>
                      <p class="text-h6 mt-3">Error generando código QR</p>
                      <v-btn variant="outlined" color="primary" @click="generateQRCode" class="mt-4">
                        <v-icon start>mdi-refresh</v-icon>
                        Reintentar
                      </v-btn>
                    </div>
                  </div>
                </div>


                <!-- Register Link -->
                <div class="text-center mt-5">
                  <span class="text-body-2 text-medium-emphasis">¿No tienes cuenta? </span>
                  <v-btn variant="text" size="small" color="primary" class="text-none pa-0"
                    @click="$router.push('/register')">
                    Regístrate aquí
                  </v-btn>
                </div>

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
                <v-img :src="logoUrl" alt="BiblioKardex Logo" width="60" height="60" />
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logoUrl from '@/assets/logo.png'
import QRCode from 'qrcode-generator'

const router = useRouter()
const authStore = useAuthStore()

// QR Code related refs
const qrCode = ref('')
const qrLoading = ref(false)
const qrToken = ref('')
const authSuccess = ref(false)
const loadingAuth = ref(false)
const loadingStep = ref(0)
const successMessage = ref('')
const loadingMessages = [
  'Conectando con tu dispositivo móvil...',
  'Verificando credenciales...',
  'Cargando datos del usuario...',
  'Sincronizando biblioteca...',
  'Preparando dashboard...'
]
let pollInterval: number | null = null
let refreshInterval: number | null = null

const generateQRCode = async () => {
  qrLoading.value = true
  try {
    // Request QR token from backend
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/qr/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Error generating QR token')
    }
    
    const data = await response.json()
    qrToken.value = data.data.token
    
    // Create QR data with token and app identifier
    const qrData = JSON.stringify({
      type: 'qr_login',
      token: qrToken.value,
      app: 'bibliokardex',
      timestamp: Date.now()
    })
    
    // Generate QR code with custom styling
    const qr = QRCode(0, 'H') // High error correction for better scanning
    qr.addData(qrData)
    qr.make()
    
    // Convert to SVG with custom styling
    qrCode.value = qr.createSvgTag({
      cellSize: 4,
      margin: 8,
      scalable: true
    })
    
    // Start polling for login status
    startPolling()
    
    // Start auto-refresh interval (30 seconds)
    startAutoRefresh()
    
  } catch (error) {
    console.error('Error generating QR code:', error)
    qrCode.value = ''
  } finally {
    qrLoading.value = false
  }
}

const startPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
  
  pollInterval = setInterval(async () => {
    if (!qrToken.value) return
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/qr/status/${qrToken.value}`)
      
      if (response.status === 404 || response.status === 410) {
        // Token expired or invalid, generate new one
        clearInterval(pollInterval!)
        generateQRCode()
        return
      }
      
      if (!response.ok) {
        throw new Error('Error checking QR status')
      }
      
      const data = await response.json()
      
      if (data.data.tokenStatus === 'authenticated' && data.data.user) {
        clearInterval(pollInterval!)
        clearInterval(refreshInterval!)
        
        // Start loading sequence
        loadingAuth.value = true
        loadingStep.value = 0
        successMessage.value = `¡Bienvenido, ${data.data.user.nombre}!`
        
        // Set user in auth store
        authStore.user = data.data.user
        
        // Start loading steps animation
        startLoadingSequence()
      }
      
    } catch (error) {
      console.error('Error polling QR status:', error)
    }
  }, 2000) // Poll every 2 seconds
}

const startAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  
  refreshInterval = setInterval(() => {
    console.log('Auto-refreshing QR code...')
    generateQRCode()
  }, 30000) // Refresh every 30 seconds
}

const startLoadingSequence = () => {
  // Change loading message every 1.5 seconds for 5 steps (7.5 seconds total)
  const stepInterval = setInterval(() => {
    loadingStep.value++
    
    if (loadingStep.value >= loadingMessages.length) {
      clearInterval(stepInterval)
      // Show success after loading sequence
      setTimeout(() => {
        loadingAuth.value = false
        authSuccess.value = true
        
        // Redirect after success message
        setTimeout(() => {
          router.push('/dashboard')
        }, 2500)
      }, 500)
    }
  }, 1500) // 1.5 seconds per step
}

onMounted(() => {
  generateQRCode()
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
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

/* QR Code Styles */
.qr-section {
  padding: 2rem 0;
}

.qr-container-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 3px dashed #e2e8f0;
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s ease;
  position: relative;
}


.qr-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-code-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.qr-code-main {
  position: relative;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
  display: inline-block;
}

.qr-svg :deep(svg) {
  display: block;
  max-width: 320px;
  max-height: 320px;
  width: 100%;
  height: auto;
  background: #ffffff;
}

.qr-svg :deep(svg path) {
  fill: #000000;
}

/* Logo overlay in center of QR */
.qr-logo-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.qr-logo-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.qr-instructions {
  max-width: 300px;
  margin: 0 auto;
}

.instruction-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  text-align: left;
  color: #475569;
  font-weight: 500;
}

.qr-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #64748b;
}

/* Full Screen Loading Overlay */
.fullscreen-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #7C3AED 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.5s ease-out;
}

.loading-content {
  text-align: center;
  color: white;
  max-width: 500px;
  padding: 2rem;
}

.loading-animation {
  margin-bottom: 2rem;
}

.loading-spinner {
  filter: drop-shadow(0 4px 20px rgba(255, 255, 255, 0.3));
  animation: float 3s ease-in-out infinite;
}

.loading-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 2rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  animation: slideInUp 0.6s ease-out;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-progress-bar {
  margin: 2rem 0;
  width: 100%;
}

.custom-progress {
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 10px;
  overflow: hidden;
}

.progress-text {
  margin-top: 1rem;
  font-size: 1rem;
  opacity: 0.9;
  font-weight: 500;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 2rem 0;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.dot.active {
  background: white;
  transform: scale(1.2);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
}

.user-welcome {
  margin-top: 2rem;
}

.welcome-message {
  font-size: 1.2rem;
  font-weight: 500;
  opacity: 0.9;
  margin: 0;
}

/* Full Screen Success Overlay */
.fullscreen-success {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #7C3AED 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.5s ease-out;
}

.success-content {
  text-align: center;
  color: white;
  max-width: 500px;
  padding: 2rem;
}

.success-animation {
  margin-bottom: 2rem;
}

.success-icon {
  filter: drop-shadow(0 4px 20px rgba(255, 255, 255, 0.3));
  animation: successPulse 1s ease-out;
}

.success-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  animation: slideInUp 0.6s ease-out 0.2s both;
}

.success-message {
  font-size: 1.4rem;
  font-weight: 500;
  margin-bottom: 2rem;
  opacity: 0.95;
  animation: slideInUp 0.6s ease-out 0.4s both;
}

.success-progress {
  width: 100%;
  max-width: 350px;
  margin: 0 auto;
  animation: slideInUp 0.6s ease-out 0.6s both;
}

.redirect-text {
  margin-top: 1rem;
  font-size: 1rem;
  opacity: 0.9;
  font-weight: 500;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes successPulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
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

  .qr-container-main {
    min-height: 300px;
    padding: 1.5rem;
  }

  .qr-svg :deep(svg) {
    max-width: 280px;
    max-height: 280px;
  }

  .qr-logo-img {
    width: 70px;
    height: 70px;
  }

  .qr-instructions {
    max-width: 280px;
  }

  .instruction-item {
    font-size: 0.9rem;
  }

  .success-title {
    font-size: 1.3rem;
  }

  .success-message {
    font-size: 1rem;
  }

  .auth-success {
    padding: 1.5rem;
  }

  /* Fullscreen overlays responsive */
  .loading-content,
  .success-content {
    padding: 1.5rem;
    max-width: 90%;
  }

  .loading-title {
    font-size: 1.5rem;
    min-height: 50px;
  }

  .success-title {
    font-size: 2rem;
  }

  .success-message {
    font-size: 1.2rem;
  }

  .welcome-message {
    font-size: 1.1rem;
  }

  .loading-spinner {
    width: 80px !important;
    height: 80px !important;
  }

  .success-icon {
    font-size: 100px !important;
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

  .qr-container-main {
    min-height: 280px;
    padding: 1rem;
  }

  .qr-svg :deep(svg) {
    max-width: 220px;
    max-height: 220px;
  }

  .qr-logo-img {
    width: 60px;
    height: 60px;
  }

  .qr-instructions {
    max-width: 250px;
  }

  .instruction-item {
    font-size: 0.85rem;
    margin-bottom: 8px;
  }

  .success-title {
    font-size: 1.2rem;
  }

  .success-message {
    font-size: 0.95rem;
  }

  .auth-success {
    padding: 1rem;
  }

  .success-icon {
    font-size: 80px !important;
  }

  /* Fullscreen overlays mobile */
  .loading-content,
  .success-content {
    padding: 1rem;
    max-width: 95%;
  }

  .loading-title {
    font-size: 1.3rem;
    min-height: 45px;
  }

  .success-title {
    font-size: 1.8rem;
  }

  .success-message {
    font-size: 1.1rem;
  }

  .welcome-message {
    font-size: 1rem;
  }

  .loading-spinner {
    width: 70px !important;
    height: 70px !important;
  }

  .success-icon {
    font-size: 90px !important;
  }

  .loading-dots {
    gap: 8px;
  }

  .dot {
    width: 10px;
    height: 10px;
  }
}
</style>
