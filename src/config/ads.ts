/**
 * AdMob ad unit configuration.
 *
 * Production builds use Fillary's real Android ad units (FILLARY_ANDROID_UNITS below).
 * They can be overridden at build time with the env vars
 *   VITE_ADMOB_ANDROID_INTERSTITIAL, VITE_ADMOB_ANDROID_REWARDED, VITE_ADMOB_ANDROID_APP_OPEN
 *   VITE_ADMOB_IOS_INTERSTITIAL,     VITE_ADMOB_IOS_REWARDED,     VITE_ADMOB_IOS_APP_OPEN
 *
 * In dev mode (npm run dev) Google's official TEST ad units are used.
 * To test release builds on your own phone without risking invalid clicks, add the phone
 * as a test device in AdMob (Settings → Test devices).
 *
 * The AdMob *App ID* is set separately for Android in android/gradle.properties
 * (ADMOB_APP_ID) or the ADMOB_APP_ID environment variable.
 */

export const TEST_UNITS = {
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

/** Fillary's real AdMob ad units (AdMob app "Fillary", Android). Env vars can override them. */
const FILLARY_ANDROID_UNITS = {
  interstitial: 'ca-app-pub-5099555951520770/5112659556',
  rewarded: 'ca-app-pub-5099555951520770/4123011511',
  appOpen: 'ca-app-pub-5099555951520770/2920601320'
};

const PROD_UNITS = {
  android: {
    interstitial: (env.VITE_ADMOB_ANDROID_INTERSTITIAL as string | undefined) || FILLARY_ANDROID_UNITS.interstitial,
    rewarded: (env.VITE_ADMOB_ANDROID_REWARDED as string | undefined) || FILLARY_ANDROID_UNITS.rewarded,
    appOpen: (env.VITE_ADMOB_ANDROID_APP_OPEN as string | undefined) || FILLARY_ANDROID_UNITS.appOpen
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
