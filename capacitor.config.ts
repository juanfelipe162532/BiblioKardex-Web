import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.bibliokardex.app',
  appName: 'BiblioKardex',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
}

export default config

