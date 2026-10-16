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
      // Not used by the Android build: the AdMob App ID comes from ADMOB_APP_ID (android/gradle.properties)
      appIdAndroid: 'ca-app-pub-3940256099942544~3347511713',
      appIdIos: 'ca-app-pub-3940256099942544~1458002511'
    }
  }
};

export default config;
