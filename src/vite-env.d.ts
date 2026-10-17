/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMOB_ANDROID_INTERSTITIAL?: string;
  readonly VITE_ADMOB_ANDROID_REWARDED?: string;
  readonly VITE_ADMOB_IOS_INTERSTITIAL?: string;
  readonly VITE_ADMOB_IOS_REWARDED?: string;
  readonly VITE_ADMOB_ANDROID_APP_OPEN?: string;
  readonly VITE_ADMOB_IOS_APP_OPEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
