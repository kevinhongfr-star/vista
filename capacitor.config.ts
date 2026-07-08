import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'ai.lyc.vista',
  appName: 'VISTA',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    url: 'https://vista-azure-delta.vercel.app',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#C108AB',
      showSpinner: true,
      spinnerColor: '#ffffff'
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#C108AB'
    }
  }
}

export default config
