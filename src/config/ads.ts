/**
 * AdMob ad unit configuration.
 *
 * Real IDs are read from environment variables at build time (Vite):
 *   VITE_ADMOB_ANDROID_INTERSTITIAL, VITE_ADMOB_ANDROID_REWARDED, VITE_ADMOB_ANDROID_APP_OPEN
 *   VITE_ADMOB_IOS_INTERSTITIAL,     VITE_ADMOB_IOS_REWARDED,     VITE_ADMOB_IOS_APP_OPEN
 * Put them in a `.env.production` file (not committed) or in GitHub Actions secrets.
 *
 * If they are missing, or the app runs in dev mode, Google's official TEST ad units
 * are used, which never earn money but are safe to click.
 *
 * The AdMob *App ID* is set separately for Android in android/gradle.properties
 * (ADMOB_APP_ID) or the ADMOB_APP_ID environment variable.
 */

const TEST_UNITS = {
  android: {
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
    appOpen: 'ca-app-pub-3940256099942544/9257395921'
  },
  ios: {
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded: 'ca-app-pub-3940256099942544/1712485313',
    appOpen: 'ca-app-pub-3940256099942544/5575463023'
  }
};

const env = import.meta.env;

const PROD_UNITS = {
  android: {
    interstitial: env.VITE_ADMOB_ANDROID_INTERSTITIAL as string | undefined,
    rewarded: env.VITE_ADMOB_ANDROID_REWARDED as string | undefined,
    appOpen: env.VITE_ADMOB_ANDROID_APP_OPEN as string | undefined
  },
  ios: {
    interstitial: env.VITE_ADMOB_IOS_INTERSTITIAL as string | undefined,
    rewarded: env.VITE_ADMOB_IOS_REWARDED as string | undefined,
    appOpen: env.VITE_ADMOB_IOS_APP_OPEN as string | undefined
  }
};

const hasProdAndroid = !!(PROD_UNITS.android.interstitial && PROD_UNITS.android.rewarded);

/** True when Google's test ads are in use (dev builds, or real IDs not configured). */
export const USE_TEST_ADS: boolean = env.DEV || !hasProdAndroid;

export interface AdUnitSet {
  interstitial: string;
  rewarded: string;
  /** Missing in production = the daily app-open ad is skipped. */
  appOpen?: string;
}

export const AD_UNITS: { android: AdUnitSet; ios: AdUnitSet } = USE_TEST_ADS
  ? TEST_UNITS
  : {
      android: {
        interstitial: PROD_UNITS.android.interstitial!,
        rewarded: PROD_UNITS.android.rewarded!,
        appOpen: PROD_UNITS.android.appOpen
      },
      ios: {
        interstitial: PROD_UNITS.ios.interstitial || TEST_UNITS.ios.interstitial,
        rewarded: PROD_UNITS.ios.rewarded || TEST_UNITS.ios.rewarded,
        appOpen: PROD_UNITS.ios.appOpen
      }
    };
