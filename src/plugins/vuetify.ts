import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#1E3A8A',        // Azul profundo para IA
          secondary: '#7C3AED',      // Púrpura para tech
          accent: '#06B6D4',         // Cian para modernidad
          error: '#DC2626',          // Rojo para errores
          info: '#0EA5E9',           // Azul info
          success: '#059669',        // Verde success
          warning: '#F59E0B',        // Amarillo warning
          background: '#F8FAFC',     // Background neutro
          surface: '#FFFFFF',        // Superficie blanca
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
          'on-surface': '#1E293B',
          'on-background': '#1E293B',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#3B82F6',        // Azul más claro para dark mode
          secondary: '#8B5CF6',      // Púrpura más claro
          accent: '#06B6D4',
          error: '#EF4444',
          info: '#3B82F6',
          success: '#10B981',
          warning: '#F59E0B',
          background: '#0F172A',     // Background oscuro
          surface: '#1E293B',        // Superficie oscura
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
          'on-surface': '#F1F5F9',
          'on-background': '#F1F5F9',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  defaults: {
    VBtn: {
      style: 'text-transform: none;',
    },
    VCard: {
      elevation: 2,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
  },
})