import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fillary.app',
  appName: 'Fillary',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    AdMob: {
      // Official Google AdMob Test App IDs
      appIdAndroid: 'ca-app-pub-3940256099942544~3347511713',
      appIdIos: 'ca-app-pub-3940256099942544~1458002511'
    }
  }
};

export default config;
