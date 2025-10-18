<template>
  <div class="content-section">
    <div class="section-header">
      <h2 class="section-title">Soporte</h2>
      <div class="d-flex align-center" style="gap:8px">
        <v-select v-model="filterStatus" :items="statusOptions" density="compact" hide-details style="max-width: 160px" />
        <v-btn variant="tonal" color="primary" @click="refreshHealth" :loading="loading">
          Verificar sistemas
          <v-icon end>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </div>

    <v-row class="mt-4" dense>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Tickets</v-card-title>
          <v-card-text style="padding-top:0">
            <v-list density="compact">
              <v-list-item v-for="t in tickets" :key="t.id" :active="selected?.id===t.id" @click="selectTicket(t)">
                <template #prepend>
                  <v-chip size="x-small" :color="(t.status==='OPEN') ? 'primary' : 'grey'" variant="tonal">{{ t.status }}</v-chip>
                </template>
                <v-list-item-title class="text-truncate">{{ t.title }}</v-list-item-title>
                <v-list-item-subtitle class="text-truncate">{{ t.reporter?.nombre || 'Usuario' }} • {{ formatDate(t.lastMessageAt) }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <v-card class="mt-4">
          <v-card-title>Notificaciones</v-card-title>
          <v-card-text style="padding-top:0">
            <v-list density="compact">
              <v-list-item v-for="n in notifications" :key="n.id">
                <v-list-item-title class="text-truncate">{{ n.title }}</v-list-item-title>
                <v-list-item-subtitle class="text-truncate">{{ n.message }}</v-list-item-subtitle>
                <template #append>
                  <v-btn icon size="x-small" @click="markRead(n)"><v-icon size="16">mdi-check</v-icon></v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card v-if="selected">
          <v-card-title class="d-flex align-center justify-space-between">
            <div>
              <div class="text-subtitle-1">{{ selected.title }}</div>
              <div class="text-caption">{{ selected.reporter?.nombre }} • {{ selected.biblioteca?.nombre }}</div>
            </div>
            <div class="d-flex align-center" style="gap:8px">
              <v-select v-model="selected.status" :items="statusOptions" density="compact" hide-details style="max-width: 160px" @update:modelValue="updateStatus" />
            </div>
          </v-card-title>
          <v-divider />
          <v-card-text class="conversation">
            <div v-for="m in messages" :key="m.id" class="msg" :class="m.senderType==='ADMIN' ? 'admin' : 'user'">
              <div class="msg-meta">{{ m.senderType==='ADMIN' ? 'Admin' : (selected.reporter?.nombre||'Usuario') }} • {{ formatDate(m.createdAt) }}</div>
              <div class="msg-body">{{ m.message }}</div>
            </div>
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-textarea v-model="reply" label="Responder" auto-grow rows="2" variant="outlined" density="comfortable" class="flex-grow-1" />
            <v-btn color="primary" :disabled="!reply.trim()" :loading="sending" @click="sendReply">Enviar</v-btn>
          </v-card-actions>
        </v-card>
        <v-alert v-else type="info" variant="tonal">Selecciona un ticket para ver la conversación</v-alert>

        <v-card class="mt-4">
          <v-card-title>Estado del Sistema</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>Base de Datos</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip :color="health?.db?.ok ? 'success' : 'error'" size="small" variant="tonal">
                    {{ health?.db?.ok ? 'OK' : 'Error' }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Servicio de Análisis</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip :color="health?.analysis?.configured ? 'success' : 'warning'" size="small" variant="tonal">
                    {{ health?.analysis?.configured ? 'Configurado' : 'No configurado' }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Uptime</v-list-item-title>
                <v-list-item-subtitle>{{ (health?.uptime || 0).toFixed(0) }}s</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <v-card class="mt-4">
          <v-card-title>Contacto</v-card-title>
          <v-card-text>
            <p class="mb-2">¿Necesitas ayuda? Escríbenos:</p>
            <v-btn :href="'mailto:' + supportEmail" color="primary" variant="tonal">
              {{ supportEmail }}
              <v-icon end>mdi-email</v-icon>
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { apiService } from '@/services/api'

const supportEmail = 'soporte@bibliokardex.app'
const health = ref<any>(null)
const loading = ref(false)
const tickets = ref<any[]>([])
const selected = ref<any | null>(null)
const messages = ref<any[]>([])
const reply = ref('')
const sending = ref(false)
const notifications = ref<any[]>([])
const filterStatus = ref<'OPEN'|'CLOSED'|'TODOS'>('OPEN')
const statusOptions = [
  { title: 'Abiertos', value: 'OPEN' },
  { title: 'Cerrados', value: 'CLOSED' },
  { title: 'Todos', value: 'TODOS' }
]
let refreshTimer: any

async function refreshHealth() {
  loading.value = true
  try {
    const res = await apiService.getAdminHealth()
    health.value = res?.data || null
  } finally {
    loading.value = false
  }
}

onMounted(refreshHealth)

async function loadTickets() {
  const status = filterStatus.value === 'TODOS' ? undefined : filterStatus.value
  const res = await apiService.adminGetTickets(status as any)
  tickets.value = (res?.data?.tickets || []).map((t: any) => ({
    id: t.id || t._id,
    title: t.title,
    status: t.status,
    lastMessageAt: t.lastMessageAt,
    reporter: t.reporterId || t.reporter,
    biblioteca: t.bibliotecaId || t.biblioteca
  }))
  if (!selected.value && tickets.value.length) {
    selectTicket(tickets.value[0])
  }
}

async function selectTicket(t: any) {
  selected.value = t
  const res = await apiService.adminGetTicket(t.id)
  const data = res?.data || {}
  selected.value = {
    id: (data.ticket?.id || data.ticket?._id || t.id),
    title: data.ticket?.title || t.title,
    status: data.ticket?.status || t.status,
    reporter: data.ticket?.reporterId || data.ticket?.reporter,
    biblioteca: data.ticket?.bibliotecaId || data.ticket?.biblioteca
  }
  messages.value = (data.messages || []).map((m: any) => ({ id: m.id || m._id, senderType: m.senderType, message: m.message, createdAt: m.createdAt }))
}

async function sendReply() {
  if (!selected.value) return
  sending.value = true
  try {
    const res = await apiService.adminReplyTicket(selected.value.id, reply.value.trim())
    const m = res?.data?.message
    if (m) messages.value.push({ id: m.id || m._id, senderType: m.senderType, message: m.message, createdAt: m.createdAt })
    reply.value = ''
  } finally {
    sending.value = false
  }
}

async function updateStatus() {
  if (!selected.value) return
  const res = await apiService.adminUpdateTicketStatus(selected.value.id, selected.value.status)
  selected.value.status = res?.data?.ticket?.status || selected.value.status
  await loadTickets()
}

async function loadNotifications() {
  const res = await apiService.adminGetNotifications()
  notifications.value = (res?.data?.items || []).map((n: any) => ({ id: n.id || n._id, title: n.title, message: n.message, read: n.read }))
}

async function markRead(n: any) {
  await apiService.markNotificationRead(n.id)
  notifications.value = notifications.value.filter(i => i.id !== n.id)
}

onMounted(async () => {
  await Promise.all([loadTickets(), loadNotifications()])
  // Auto-refresh tickets and conversation every 6s
  refreshTimer = setInterval(async () => {
    await loadTickets()
    if (selected.value) {
      await selectTicket(selected.value)
    }
  }, 6000)
})

watch(filterStatus, () => { loadTickets() })

onUnmounted(() => {
  if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null }
})

function formatDate(value: any): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const mins = Math.floor(diffMs / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days >= 1) return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
  if (hours >= 1) return `Hace ${hours} hora${hours>1?'s':''}`
  if (mins >= 1) return `Hace ${mins} minuto${mins>1?'s':''}`
  return 'Justo ahora'
}
</script>

<style scoped>
.content-section { max-width: 1200px; margin: 16px auto 0 auto; padding: 24px; }
.section-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.section-title { margin: 0; font-size: 20px; font-weight: 700; color: #1E293B; }
.conversation { max-height: 360px; overflow: auto; padding: 12px 16px; }
.msg { margin-bottom: 12px; }
.msg.admin .msg-body { background: #EEF2FF; padding: 10px 12px; border-radius: 8px; }
.msg.user .msg-body { background: #F1F5F9; padding: 10px 12px; border-radius: 8px; }
.msg-meta { font-size: 12px; color: #64748B; margin-bottom: 4px; }
</style>
