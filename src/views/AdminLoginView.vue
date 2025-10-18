<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card elevation="2">
          <v-card-title>Acceso Administrador</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onSubmit">
              <v-text-field v-model="email" label="Email" type="email" required></v-text-field>
              <v-text-field v-model="password" label="Contraseña" type="password" required></v-text-field>
              <v-alert v-if="error" type="error" variant="tonal" class="mb-3">{{ error }}</v-alert>
              <v-btn type="submit" :loading="loading" color="primary" block>Ingresar</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const onSubmit = async () => {
  error.value = ''
  loading.value = true
  try {
    const resp = await apiService.adminLogin(email.value, password.value)
    if (resp.success && resp.user) {
      auth.setAdminSession({
        id: resp.user.id,
        nombre: resp.user.nombre,
        email: resp.user.email,
        role: 'ADMIN'
      })
      router.push('/dashboard')
    } else {
      error.value = resp.message || 'Credenciales inválidas'
    }
  } catch (e: any) {
    error.value = e?.message || 'Error de conexión'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fill-height { min-height: 100vh; }
</style>

