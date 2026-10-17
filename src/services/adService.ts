import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import {
  AdMob,
  RewardAdPluginEvents,
  MaxAdContentRating,
  AdmobConsentStatus
} from '@capacitor-community/admob';
import { Toast } from '../ui/Toast.js';
import { StorageManager } from '../storage/storageManager.js';
import { AD_UNITS, USE_TEST_ADS, AdUnitSet } from '../config/ads.js';

export class AdService {
  private static initialized = false;
  /** False only if the user's consent (EEA/UK) doesn't allow ad requests. */
  private static canRequestAds = true;
  private static privacyOptionsRequired = false;

  /**
   * Minimum time the user must actively spend in the app between two interstitials.
   * Ads are only shown at natural breaks (going home, opening another picture, exporting),
   * never while the user is in the middle of coloring (AdMob / Families policy).
   */
  private static readonly INTERSTITIAL_INTERVAL_MS = 4 * 60 * 1000;

  // Active (foreground) time tracking — time spent in the background doesn't count
  private static activeAccumMs = 0;
  private static activeSince: number | null = Date.now();

  private static interstitialReady: Promise<boolean> | null = null;
  private static interstitialLoaded = false;
  private static isShowing = false;

  private static readonly DAILY_APP_OPEN_KEY = 'fillary_app_open_ad_day';
  private static readonly APP_OPEN_LOAD_TIMEOUT_MS = 4000;
  private static appOpenInFlight = false;

  private static adIds(): AdUnitSet {
    const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';
    return AD_UNITS[platform];
  }

  /**
   * Initializes the Google AdMob SDK.
   *
   * Fillary's audience includes children, so every ad request is tagged as
   * child-directed (COPPA) / under the age of consent (GDPR) and limited to
   * "General" (G-rated) content, as required by Google Play's Families policy.
   */
  public static async initialize(): Promise<void> {
    if (this.initialized) return;

    if (Capacitor.isNativePlatform()) {
      try {
        await AdMob.initialize({
          initializeForTesting: USE_TEST_ADS,
          testingDevices: USE_TEST_ADS ? ['EMULATOR'] : [],
          tagForChildDirectedTreatment: true,
          tagForUnderAgeOfConsent: true,
          maxAdContentRating: MaxAdContentRating.General
        });

        await this.gatherConsent();
        this.initialized = true;
        console.log(`[AdService] AdMob initialized (${USE_TEST_ADS ? 'TEST ads' : 'production ads'}, canRequestAds=${this.canRequestAds}).`);
        this.preloadInterstitial();
      } catch (err) {
        console.warn('[AdService] AdMob native initialization failed:', err);
      }
    } else {
      this.initialized = true;
      console.log('[AdService] AdMob running in Web / Simulator mode.');
    }
  }

  /** Call when the app goes to the background. */
  public static onAppPause(): void {
    if (this.activeSince !== null) {
      this.activeAccumMs += Date.now() - this.activeSince;
      this.activeSince = null;
    }
  }

  /** Call when the app returns to the foreground. */
  public static onAppResume(): void {
    if (this.activeSince === null) {
      this.activeSince = Date.now();
    }
  }

  private static activeTimeMs(): number {
    return this.activeAccumMs + (this.activeSince !== null ? Date.now() - this.activeSince : 0);
  }

  private static resetActiveTimer(): void {
    this.activeAccumMs = 0;
    this.activeSince = Date.now();
  }

  /** Loads the next interstitial in the background so it can show instantly. */
  private static preloadInterstitial(): void {
    if (!Capacitor.isNativePlatform() || !this.initialized || !this.canRequestAds || this.interstitialReady) return;
    this.interstitialReady = AdMob.prepareInterstitial({
      adId: this.adIds().interstitial,
      isTesting: USE_TEST_ADS
    })
      .then(() => {
        this.interstitialLoaded = true;
        return true;
      })
      .catch((err) => {
        console.warn('[AdService] Interstitial preload failed:', err);
        this.interstitialReady = null; // retry at the next opportunity
        return false;
      });
  }

  /**
   * True when a timed ad break is due (4 active minutes since the last ad)
   * AND an ad is already loaded, so a "Ad break in 5s" countdown never leads to nothing.
   */
  public static isTimedAdReady(): boolean {
    if (this.isShowing) return false;
    const elapsed = this.activeTimeMs();
    if (elapsed > this.INTERSTITIAL_INTERVAL_MS - 60 * 1000) this.preloadInterstitial();
    if (elapsed < this.INTERSTITIAL_INTERVAL_MS) return false;
    if (Capacitor.isNativePlatform()) return this.initialized && this.interstitialLoaded;
    return true;
  }

  /**
   * EU / UK user consent (Google UMP). Shows Google's consent message when required
   * (configured in AdMob → Privacy & messaging). Outside the EEA/UK nothing is shown.
   * If no message is configured yet, or the check fails, ads continue as before.
   */
  private static async gatherConsent(): Promise<void> {
    try {
      let info = await AdMob.requestConsentInfo({ tagForUnderAgeOfConsent: true });
      if (info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) {
        info = await AdMob.showConsentForm();
      }
      this.canRequestAds = info.canRequestAds;
      this.privacyOptionsRequired =
        (info.privacyOptionsRequirementStatus as string) === 'REQUIRED';
    } catch (err) {
      console.warn('[AdService] Consent check failed (continuing):', err);
    }
  }

  /** True when the user must be offered a way to change their ad consent (EEA/UK). */
  public static isPrivacyOptionsRequired(): boolean {
    return this.privacyOptionsRequired;
  }

  /** Opens Google's privacy options form so the user can change their consent. */
  public static async showPrivacyOptions(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await AdMob.showPrivacyOptionsForm();
      const info = await AdMob.requestConsentInfo({ tagForUnderAgeOfConsent: true });
      this.canRequestAds = info.canRequestAds;
    } catch (err) {
      console.warn('[AdService] Privacy options form failed:', err);
      Toast.show('Privacy settings are not available right now.');
    }
  }

  private static todayKey(): string {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  /**
   * Shows one App Open ad the first time the app is opened (or brought back) each day.
   * Uses AdMob's dedicated App Open format, which is the policy-compliant way to show
   * an ad at launch. If the ad can't load within a few seconds it is skipped (no waiting),
   * and it will be tried again the next time the app is opened that day.
   */
  public static async showDailyAppOpenAd(): Promise<boolean> {
    if (this.appOpenInFlight || this.isShowing) return false;
    const today = this.todayKey();
    if (StorageManager.getItem(this.DAILY_APP_OPEN_KEY) === today) return false;

    this.appOpenInFlight = true;
    try {
      if (!Capacitor.isNativePlatform()) {
        StorageManager.setItem(this.DAILY_APP_OPEN_KEY, today);
        this.isShowing = true;
        try {
          await this.simulateWebAd('interstitial', 'Daily App Open Ad');
        } finally {
          this.isShowing = false;
        }
        this.resetActiveTimer();
        return true;
      }

      const adId = this.adIds().appOpen;
      if (!this.initialized || !this.canRequestAds || !adId) return false;

      const loaded = await Promise.race([
        AdMob.loadAppOpen({ adId }).then(() => true).catch((err) => {
          console.warn('[AdService] App open ad failed to load:', err);
          return false;
        }),
        new Promise<boolean>(r => setTimeout(() => r(false), this.APP_OPEN_LOAD_TIMEOUT_MS))
      ]);
      if (!loaded) return false;
      // The user may have left the app while the ad was loading
      if (document.hidden) return false;

      StorageManager.setItem(this.DAILY_APP_OPEN_KEY, today);
      this.isShowing = true;
      try {
        await AdMob.showAppOpen();
      } finally {
        this.isShowing = false;
      }
      this.resetActiveTimer(); // don't stack a timed ad break right after
      return true;
    } catch (err) {
      console.warn('[AdService] App open ad failed:', err);
      return false;
    } finally {
      this.appOpenInFlight = false;
    }
  }

  /**
   * Shows a full-screen interstitial at a natural break (going home, opening another
   * picture, exporting) — but only once the user has been active for 4 minutes since
   * the last ad. Returns true if an ad was shown.
   */
  public static async showInterstitial(placement: string = 'break'): Promise<boolean> {
    if (this.isShowing) return false;

    const elapsed = this.activeTimeMs();
    if (elapsed < this.INTERSTITIAL_INTERVAL_MS) {
      // Start loading the ad shortly before it's due
      if (elapsed > this.INTERSTITIAL_INTERVAL_MS - 60 * 1000) this.preloadInterstitial();
      return false;
    }

    if (Capacitor.isNativePlatform()) {
      if (!this.initialized) return false;
      this.preloadInterstitial();
      const ready = this.interstitialReady ? await this.interstitialReady : false;
      if (!ready) return false; // no ad available right now; try again at the next break

      this.isShowing = true;
      try {
        await AdMob.showInterstitial();
        this.resetActiveTimer();
        return true;
      } catch (err) {
        console.warn('[AdService] Native interstitial failed:', err);
        return false;
      } finally {
        this.isShowing = false;
        this.interstitialReady = null;
        this.interstitialLoaded = false;
        this.preloadInterstitial(); // get the next one ready
      }
    } else {
      this.isShowing = true;
      try {
        const shown = await this.simulateWebAd('interstitial', `Sponsored Interstitial (${placement})`);
        this.resetActiveTimer();
        return shown;
      } finally {
        this.isShowing = false;
      }
    }
  }

  /**
   * Displays a Rewarded Video Ad to grant the user a reward (e.g. unlocking a bonus palette).
   * Resolves true only if the user finished watching and earned the reward.
   * Always resolves once the ad is closed (even if the user skipped it).
   */
  public static async showRewarded(rewardPurpose: string = 'Unlock Premium Palette'): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return this.simulateWebAd('rewarded', rewardPurpose);
    }

    if (!this.initialized || !this.canRequestAds) {
      Toast.show('Ads are not available right now. Please try again later.');
      return false;
    }

    const handles: PluginListenerHandle[] = [];
    try {
      await AdMob.prepareRewardVideoAd({
        adId: this.adIds().rewarded,
        isTesting: USE_TEST_ADS
      });

      let earned = false;
      // AdMob's show() promise only settles when a reward is earned, so wait for the
      // ad to be dismissed (or fail) instead of awaiting show() directly.
      const closed = new Promise<void>((resolve) => {
        AdMob.addListener(RewardAdPluginEvents.Rewarded, () => { earned = true; })
          .then(h => handles.push(h));
        AdMob.addListener(RewardAdPluginEvents.Dismissed, () => resolve())
          .then(h => handles.push(h));
        AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => resolve())
          .then(h => handles.push(h));
      });

      AdMob.showRewardVideoAd()
        .then(() => { earned = true; })
        .catch((err) => console.warn('[AdService] Rewarded show failed:', err));

      await closed;
      return earned;
    } catch (err) {
      console.warn('[AdService] Native rewarded ad failed:', err);
      Toast.show('No video available right now. Please try again later.');
      return false;
    } finally {
      for (const h of handles) {
        h.remove().catch(() => {});
      }
    }
  }

  /**
   * Checks if a palette is unlocked.
   */
  public static isPaletteUnlocked(paletteId: string): boolean {
    const unlocked = StorageManager.getItem(`fillary_unlocked_palette_${paletteId}`);
    return unlocked === 'true';
  }

  /**
   * Unlocks a palette permanently.
   */
  public static unlockPalette(paletteId: string): void {
    StorageManager.setItem(`fillary_unlocked_palette_${paletteId}`, 'true');
    Toast.show('Palette unlocked successfully! 🎨');
  }

  /**
   * Minimal web/simulator ad modal with countdown, so the monetization
   * flow can be tested in a browser without a native build.
   */
  private static simulateWebAd(type: 'interstitial' | 'rewarded', title: string): Promise<boolean> {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'ad-simulation-overlay';

      let secondsLeft = type === 'rewarded' ? 5 : 4;

      modal.innerHTML = `
        <div class="ad-simulation-card">
          <div class="ad-simulation-badge">${type === 'rewarded' ? '🎁 Rewarded Ad' : '✨ Sponsored Ad'}</div>
          <div class="ad-simulation-media">
            <div class="ad-media-icon">🎨</div>
            <h3></h3>
            <p>Ad simulator (browser preview only)</p>
          </div>
          <div class="ad-simulation-timer" id="ad-timer">
            ${type === 'rewarded' ? `Reward in ${secondsLeft}s...` : `Closing in ${secondsLeft}s...`}
          </div>
          <button class="ad-simulation-btn" id="ad-close-btn" disabled>
            <span>Please wait...</span>
          </button>
        </div>
      `;
      modal.querySelector('h3')!.textContent = title;

      document.body.appendChild(modal);

      const closeBtn = modal.querySelector('#ad-close-btn') as HTMLButtonElement;
      const timerEl = modal.querySelector('#ad-timer') as HTMLElement;

      const interval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
          clearInterval(interval);
          timerEl.textContent = type === 'rewarded' ? 'Reward Earned! ✨' : 'Ad Finished';
          closeBtn.disabled = false;
          closeBtn.classList.add('ad-btn-active');
          closeBtn.innerHTML = `<span>${type === 'rewarded' ? 'Claim Reward' : 'Continue'}</span>`;
        } else {
          timerEl.textContent = type === 'rewarded' ? `Reward in ${secondsLeft}s...` : `Closing in ${secondsLeft}s...`;
        }
      }, 1000);

      closeBtn.addEventListener('click', () => {
        clearInterval(interval);
        modal.classList.add('fade-out');
        setTimeout(() => modal.remove(), 250);
        resolve(true);
      });
    });
  }
}
