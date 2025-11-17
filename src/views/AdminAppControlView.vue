<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-icon size="32" color="primary" class="mr-3">mdi-cellphone-cog</v-icon>
          <h1 class="text-h4 font-weight-bold">Control de Versiones de la App</h1>
        </div>
        <p class="text-subtitle-1 text-grey-darken-1">
          Gestiona las notificaciones de actualización para la aplicación móvil
        </p>
      </v-col>
    </v-row>

    <!-- Actions Bar -->
    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Buscar versión"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4" class="d-flex align-center justify-end">
        <v-btn
          color="primary"
          size="large"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Nueva Versión
        </v-btn>
      </v-col>
    </v-row>

    <!-- Versions Table -->
    <v-card elevation="2">
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="filteredVersions"
          :loading="loading"
          :items-per-page="itemsPerPage"
          class="elevation-0"
        >
          <template #item.platform="{ item }">
            <v-chip size="small" :color="getPlatformColor(item.platform)">
              <v-icon start size="16">{{ getPlatformIcon(item.platform) }}</v-icon>
              {{ item.platform.toUpperCase() }}
            </v-chip>
          </template>

          <template #item.versionNumber="{ item }">
            <div class="font-weight-bold">{{ item.versionNumber }}</div>
            <div class="text-caption text-grey">Build {{ item.versionCode }}</div>
          </template>

          <template #item.releaseDate="{ item }">
            <div>{{ formatDate(item.releaseDate) }}</div>
            <div class="text-caption text-grey">
              Notif: {{ formatDate(item.notificationStartsAt) }}
            </div>
          </template>

          <template #item.isCritical="{ item }">
            <v-chip
              size="small"
              :color="item.isCritical ? 'error' : 'success'"
              variant="flat"
            >
              {{ item.isCritical ? 'Crítica' : 'Normal' }}
            </v-chip>
          </template>

          <template #item.isActive="{ item }">
            <v-switch
              v-model="item.isActive"
              color="primary"
              hide-details
              @change="toggleActive(item)"
            ></v-switch>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              @click="openEditDialog(item)"
            ></v-btn>
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="confirmDelete(item)"
            ></v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="700px" persistent>
      <v-card>
        <v-card-title class="text-h5 bg-primary text-white pa-4">
          {{ editMode ? 'Editar Versión' : 'Nueva Versión' }}
        </v-card-title>
        <v-card-text class="pt-6">
          <v-form ref="formRef" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.versionNumber"
                  label="Versión (semver) *"
                  placeholder="1.2.0"
                  variant="outlined"
                  :rules="[rules.required]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="formData.versionCode"
                  label="Build Number *"
                  placeholder="3"
                  type="number"
                  variant="outlined"
                  :rules="[rules.required, rules.number]"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.platform"
                  label="Plataforma *"
                  :items="platforms"
                  variant="outlined"
                  :rules="[rules.required]"
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.releaseDate"
                  label="Fecha de Publicación *"
                  type="datetime-local"
                  variant="outlined"
                  :rules="[rules.required]"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="formData.delayMinutes"
                  label="Retraso (minutos)"
                  placeholder="20"
                  type="number"
                  variant="outlined"
                  hint="Minutos de espera antes de mostrar notificación"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-switch
                  v-model="formData.isCritical"
                  label="Actualización Crítica"
                  color="error"
                  hide-details
                  class="mt-2"
                ></v-switch>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="formData.title"
                  label="Título del mensaje"
                  placeholder="Nueva actualización disponible"
                  variant="outlined"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="formData.message"
                  label="Mensaje *"
                  placeholder="Hemos mejorado el rendimiento y corregido errores..."
                  variant="outlined"
                  rows="3"
                  :rules="[rules.required]"
                ></v-textarea>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="formData.updateUrl"
                  label="URL de la tienda"
                  placeholder="https://play.google.com/store/apps/details?id=..."
                  variant="outlined"
                  hint="URL de Play Store o App Store"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn @click="closeDialog" :disabled="saving">Cancelar</v-btn>
          <v-btn
            color="primary"
            @click="saveVersion"
            :loading="saving"
            :disabled="!formValid"
          >
            {{ editMode ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar la versión
          <strong>{{ deleteItem?.versionNumber }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" @click="deleteVersion" :loading="deleting">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { appVersionService, type AppVersion, type CreateAppVersionRequest } from '@/services/app-version.service'

const search = ref('')
const loading = ref(false)
const versions = ref<AppVersion[]>([])
const itemsPerPage = ref(10)

const dialog = ref(false)
const editMode = ref(false)
const formValid = ref(false)
const saving = ref(false)
const formRef = ref<any>(null)

const deleteDialog = ref(false)
const deleteItem = ref<AppVersion | null>(null)
const deleting = ref(false)

const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const headers: Array<{
  title: string
  key: string
  sortable: boolean
  align?: 'start' | 'end' | 'center'
}> = [
  { title: 'Versión', key: 'versionNumber', sortable: true },
  { title: 'Plataforma', key: 'platform', sortable: true },
  { title: 'Fecha de Publicación', key: 'releaseDate', sortable: true },
  { title: 'Tipo', key: 'isCritical', sortable: false },
  { title: 'Activa', key: 'isActive', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' }
]

const platforms = [
  { title: 'Todas', value: 'all' },
  { title: 'Android', value: 'android' },
  { title: 'iOS', value: 'ios' }
]

const formData = ref<CreateAppVersionRequest & { _id?: string }>({
  versionNumber: '',
  versionCode: 0,
  platform: 'all',
  releaseDate: '',
  delayMinutes: 20,
  title: '',
  message: '',
  updateUrl: '',
  isCritical: false
})

const rules = {
  required: (v: any) => !!v || 'Campo requerido',
  number: (v: any) => (typeof v === 'number' && v > 0) || 'Debe ser un número positivo'
}

// Computed
const filteredVersions = computed(() => {
  if (!search.value) return versions.value
  const searchLower = search.value.toLowerCase()
  return versions.value.filter(
    (v) =>
      v.versionNumber.toLowerCase().includes(searchLower) ||
      v.platform.toLowerCase().includes(searchLower)
  )
})

// Methods
async function loadVersions() {
  loading.value = true
  try {
    console.log('🔄 Cargando versiones...')
    const response = await appVersionService.listVersions(1, 50)
    console.log('📦 Respuesta del servidor:', response)

    if (response.status === 'success' && response.data) {
      versions.value = response.data.versions
      console.log('✅ Versiones cargadas:', versions.value.length)
    } else {
      console.warn('⚠️ Respuesta sin éxito:', response)
      showSnackbar('No se pudieron cargar las versiones', 'warning')
    }
  } catch (error: any) {
    console.error('❌ Error al cargar versiones:', error)
    showSnackbar('Error al cargar versiones: ' + error.message, 'error')
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  editMode.value = false
  formData.value = {
    versionNumber: '',
    versionCode: 0,
    platform: 'all',
    releaseDate: new Date().toISOString().slice(0, 16),
    delayMinutes: 20,
    title: 'Nueva actualización disponible',
    message: '',
    updateUrl: '',
    isCritical: false
  }
  dialog.value = true
}

function openEditDialog(item: AppVersion) {
  editMode.value = true
  formData.value = {
    _id: item._id,
    versionNumber: item.versionNumber,
    versionCode: item.versionCode,
    platform: item.platform,
    releaseDate: new Date(item.releaseDate).toISOString().slice(0, 16),
    delayMinutes: item.delayMinutes,
    title: item.title || '',
    message: item.message,
    updateUrl: item.updateUrl || '',
    isCritical: item.isCritical
  }
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
  formRef.value?.reset()
}

async function saveVersion() {
  if (!formValid.value) return

  saving.value = true
  try {
    const payload = {
      ...formData.value,
      releaseDate: new Date(formData.value.releaseDate).toISOString()
    }
    delete payload._id

    let response
    if (editMode.value && formData.value._id) {
      response = await appVersionService.updateVersion(formData.value._id, payload)
      if (response.status === 'success') {
        showSnackbar('Versión actualizada exitosamente', 'success')
      }
    } else {
      response = await appVersionService.createVersion(payload)
      if (response.status === 'success') {
        showSnackbar('Versión creada exitosamente', 'success')
      }
    }

    closeDialog()
    await loadVersions()
  } catch (error: any) {
    showSnackbar('Error al guardar: ' + error.message, 'error')
  } finally {
    saving.value = false
  }
}

async function toggleActive(item: AppVersion) {
  try {
    const response = await appVersionService.toggleActive(item._id, item.isActive)
    if (response.status === 'success') {
      showSnackbar(
        item.isActive ? 'Versión activada' : 'Versión desactivada',
        'success'
      )
    }
  } catch (error: any) {
    item.isActive = !item.isActive // Revertir cambio
    showSnackbar('Error al cambiar estado: ' + error.message, 'error')
  }
}

function confirmDelete(item: AppVersion) {
  deleteItem.value = item
  deleteDialog.value = true
}

async function deleteVersion() {
  if (!deleteItem.value) return

  deleting.value = true
  try {
    const response = await appVersionService.deleteVersion(deleteItem.value._id)
    if (response.status === 'success') {
      showSnackbar('Versión eliminada exitosamente', 'success')
      deleteDialog.value = false
      await loadVersions()
    }
  } catch (error: any) {
    showSnackbar('Error al eliminar: ' + error.message, 'error')
  } finally {
    deleting.value = false
  }
}

function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    android: 'success',
    ios: 'info',
    all: 'primary'
  }
  return colors[platform] || 'grey'
}

function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    android: 'mdi-android',
    ios: 'mdi-apple',
    all: 'mdi-cellphone-link'
  }
  return icons[platform] || 'mdi-cellphone'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function showSnackbar(text: string, color: string = 'success') {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

onMounted(() => {
  loadVersions()
})
</script>

<style scoped>
.v-data-table {
  background: transparent;
}
</style>
