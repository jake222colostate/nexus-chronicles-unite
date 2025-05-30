
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c98985285bc94c23b41f6926d694c4e3',
  appName: 'nexus-chronicles-unite',
  webDir: 'dist',
  server: {
    url: 'https://c9898528-5bc9-4c23-b41f-6926d694c4e3.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1e1b4b',
      showSpinner: false
    }
  }
};

export default config;
