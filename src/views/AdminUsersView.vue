<template>
  <div class="content-section">
    <div class="section-header">
      <h2 class="section-title">Usuarios (Admin)</h2>
      <v-text-field v-model="search" density="compact" hide-details placeholder="Buscar..." clearable style="max-width: 280px" @update:modelValue="debouncedLoad" />
    </div>
    <v-data-table :items="items" :headers="headers" :items-per-page="limit" :page.sync="page" class="mt-4" :loading="loading">
      <template #item.role="{ item }">
        <v-chip size="small" :color="(item.role || '').toUpperCase() === 'ADMIN' ? 'purple' : 'blue'" variant="tonal">{{ item.role }}</v-chip>
      </template>
      <template #item.actions="{ item }">
        <v-btn size="small" variant="tonal" color="primary" @click="openSubscription(item)">Suscripción</v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="560">
      <v-card>
        <v-card-title>Suscripción de {{ selected?.nombre }}</v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-select v-model="form.planKey" :items="planOptions" label="Plan" density="compact"></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="form.status" :items="statusOptions" label="Estado" density="compact"></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.trialStart" label="Inicio Trial" type="date" density="compact"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.trialEnd" label="Fin Trial" type="date" density="compact"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.periodStart" label="Inicio Periodo" type="date" density="compact"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.periodEnd" label="Fin Periodo" type="date" density="compact"></v-text-field>
            </v-col>
          </v-row>
          <v-alert v-if="error" type="error" class="mt-2" variant="tonal">{{ error }}</v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog=false">Cancelar</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveSubscription">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
  
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const loading = ref(false)
const items = ref<Array<any>>([])
const total = ref(0)
const page = ref(1)
const limit = 20
const search = ref('')

const headers = [
  { title: 'Nombre', key: 'nombre' },
  { title: 'Email', key: 'email' },
  { title: 'Rol', key: 'role' },
  { title: 'Biblioteca', key: 'biblioteca' },
  { title: 'Acciones', key: 'actions', sortable: false }
]

async function load() {
  if ((auth.user?.role || '').toUpperCase() !== 'ADMIN') return
  loading.value = true
  try {
    const res = await apiService.getAdminUsers(page.value, limit, search.value)
    items.value = res?.data?.items || []
    total.value = res?.data?.total || 0
  } finally {
    loading.value = false
  }
}

let timer: any
const debouncedLoad = () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { page.value = 1; load() }, 300)
}

load()

// Subscription dialog state
const dialog = ref(false)
const selected = ref<any>(null)
const error = ref('')
const saving = ref(false)
const form = ref<{ planKey: string; status: string; trialStart: string | null; trialEnd: string | null; periodStart: string | null; periodEnd: string | null }>({
  planKey: 'FREE',
  status: 'LOCKED',
  trialStart: null,
  trialEnd: null,
  periodStart: null,
  periodEnd: null
})

const planOptions = [
  { title: 'FREE', value: 'FREE' },
  { title: 'Básico - Mensual', value: 'bibliokardex_basico:basico-monthly' },
  { title: 'Básico - Semestral', value: 'bibliokardex_basico:basico-semiannual' },
  { title: 'Básico - Anual', value: 'bibliokardex_basico:basico-annual' },
  { title: 'Intermedio - Mensual', value: 'bibliokardex_intermedio:intermedio-monthly' },
  { title: 'Intermedio - Semestral', value: 'bibliokardex_intermedio:intermedio-semiannual' },
  { title: 'Intermedio - Anual', value: 'bibliokardex_intermedio:intermedio-annual' },
  { title: 'Avanzado - Mensual', value: 'bibliokardex_avanzado:avanzado-monthly' },
  { title: 'Avanzado - Semestral', value: 'bibliokardex_avanzado:avanzado-semiannual' },
  { title: 'Avanzado - Anual', value: 'bibliokardex_avanzado:avanzado-annual' }
]

const statusOptions = [
  { title: 'LOCKED', value: 'LOCKED' },
  { title: 'TRIALING', value: 'TRIALING' },
  { title: 'ACTIVE', value: 'ACTIVE' },
  { title: 'PAST_DUE', value: 'PAST_DUE' },
  { title: 'CANCELED', value: 'CANCELED' }
]

function toDateInput(d?: string | null) {
  if (!d) return null
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return null
  const yyyy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function fromDateInput(s?: string | null) {
  if (!s) return null
  // Treat as local date at midnight
  return new Date(s + 'T00:00:00')
}

async function openSubscription(user: any) {
  selected.value = user
  error.value = ''
  dialog.value = true
  try {
    const res = await apiService.getAdminUserSubscription(user.id)
    const sub = res?.data?.subscription
    form.value.planKey = sub?.planKey || 'FREE'
    form.value.status = sub?.status || 'LOCKED'
    form.value.trialStart = toDateInput(sub?.trialStart)
    form.value.trialEnd = toDateInput(sub?.trialEnd)
    form.value.periodStart = toDateInput(sub?.periodStart)
    form.value.periodEnd = toDateInput(sub?.periodEnd)
  } catch (e: any) {
    error.value = e?.message || 'No se pudo cargar la suscripción'
  }
}

async function saveSubscription() {
  if (!selected.value) return
  saving.value = true
  error.value = ''
  try {
    const payload = {
      planKey: form.value.planKey,
      status: form.value.status,
      trialStart: form.value.trialStart,
      trialEnd: form.value.trialEnd,
      periodStart: form.value.periodStart,
      periodEnd: form.value.periodEnd
    }
    await apiService.updateAdminUserSubscription(selected.value.id, payload)
    dialog.value = false
  } catch (e: any) {
    error.value = e?.message || 'No se pudo guardar la suscripción'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.content-section { max-width: 1200px; margin: 16px auto 0 auto; padding: 24px; }
.section-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.section-title { margin: 0; font-size: 20px; font-weight: 700; color: #1E293B; }
</style>
