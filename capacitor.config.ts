import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.53a730bf0ed64164936c315867d01df5',
  appName: 'yaraunatrialtwo-98',
  webDir: 'dist',
  server: {
    url: 'https://53a730bf-0ed6-4164-936c-315867d01df5.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;