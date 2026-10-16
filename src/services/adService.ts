import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import {
  AdMob,
  RewardAdPluginEvents,
  MaxAdContentRating
} from '@capacitor-community/admob';
import { Toast } from '../ui/Toast.js';
import { StorageManager } from '../storage/storageManager.js';
import { AD_UNITS, USE_TEST_ADS } from '../config/ads.js';

export class AdService {
  private static initialized = false;
  private static lastInterstitialTime = 0;
  private static readonly INTERSTITIAL_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes cooldown

  private static adIds(): { interstitial: string; rewarded: string } {
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

        this.initialized = true;
        console.log(`[AdService] AdMob initialized (${USE_TEST_ADS ? 'TEST ads' : 'production ads'}).`);
      } catch (err) {
        console.warn('[AdService] AdMob native initialization failed:', err);
      }
    } else {
      this.initialized = true;
      console.log('[AdService] AdMob running in Web / Simulator mode.');
    }
  }

  /**
   * Displays a full-screen Interstitial Ad (e.g. after Exporting artwork).
   * Automatically enforces cooldown so users are never annoyed.
   */
  public static async showInterstitial(placement: string = 'export'): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastInterstitialTime < this.INTERSTITIAL_COOLDOWN_MS) {
      return false;
    }

    if (Capacitor.isNativePlatform()) {
      if (!this.initialized) return false;
      try {
        await AdMob.prepareInterstitial({
          adId: this.adIds().interstitial,
          isTesting: USE_TEST_ADS
        });

        await AdMob.showInterstitial();
        this.lastInterstitialTime = Date.now();
        return true;
      } catch (err) {
        console.warn('[AdService] Native interstitial failed:', err);
        return false;
      }
    } else {
      this.lastInterstitialTime = now;
      return this.simulateWebAd('interstitial', `Sponsored Interstitial (${placement})`);
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

    if (!this.initialized) {
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
