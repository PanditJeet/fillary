import { Capacitor } from '@capacitor/core';
import { AdMob, RewardAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';
import { Toast } from '../ui/Toast.js';

/**
 * Google AdMob Test Ad Unit IDs (Official Google Test IDs)
 * Safe to test on Android and iOS without triggering invalid traffic strikes.
 */
const AD_UNITS = {
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917'
  },
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded: 'ca-app-pub-3940256099942544/1712485313'
  }
};

export class AdService {
  private static initialized = false;
  private static lastInterstitialTime = 0;
  private static readonly INTERSTITIAL_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes cooldown

  /**
   * Initializes the Google AdMob SDK.
   */
  public static async initialize(): Promise<void> {
    if (this.initialized) return;

    if (Capacitor.isNativePlatform()) {
      try {
        await AdMob.initialize({
          testingDevices: ['EMULATOR'],
          initializeForTesting: true
        });

        // Request tracking authorization for iOS ATT if required
        if (Capacitor.getPlatform() === 'ios') {
          await AdMob.requestTrackingAuthorization();
        }

        this.initialized = true;
        console.log('[AdService] Google AdMob SDK initialized on native platform.');
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
      console.log(`[AdService] Interstitial cooldown active (${Math.round((this.INTERSTITIAL_COOLDOWN_MS - (now - this.lastInterstitialTime)) / 1000)}s left)`);
      return false;
    }

    this.lastInterstitialTime = now;

    if (Capacitor.isNativePlatform()) {
      try {
        const platform = Capacitor.getPlatform() as 'ios' | 'android';
        const adId = AD_UNITS[platform]?.interstitial || AD_UNITS.android.interstitial;

        await AdMob.prepareInterstitial({
          adId,
          isTesting: true
        });

        await AdMob.showInterstitial();
        return true;
      } catch (err) {
        console.warn('[AdService] Native interstitial failed:', err);
        return false;
      }
    } else {
      // Show simulated web ad modal
      return this.simulateWebAd('interstitial', `Sponsored Interstitial (${placement})`);
    }
  }

  /**
   * Displays a Rewarded Video Ad to grant the user a reward (e.g. unlocking a bonus palette).
   * Resolves true only if the user finished watching and earned the reward.
   */
  public static async showRewarded(rewardPurpose: string = 'Unlock Premium Palette'): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        const platform = Capacitor.getPlatform() as 'ios' | 'android';
        const adId = AD_UNITS[platform]?.rewarded || AD_UNITS.android.rewarded;

        await AdMob.prepareRewardVideoAd({
          adId,
          isTesting: true
        });

        let earned = false;
        const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
          console.log('[AdService] Rewarded video completed:', reward);
          earned = true;
        });

        await AdMob.showRewardVideoAd();
        await rewardListener.remove();
        return earned;
      } catch (err) {
        console.warn('[AdService] Native rewarded ad failed:', err);
        return false;
      }
    } else {
      // Show simulated web rewarded ad modal
      return this.simulateWebAd('rewarded', rewardPurpose);
    }
  }

  /**
   * Checks if a palette is unlocked.
   */
  public static isPaletteUnlocked(paletteId: string): boolean {
    const unlocked = localStorage.getItem(`fillary_unlocked_palette_${paletteId}`);
    return unlocked === 'true';
  }

  /**
   * Unlocks a palette permanently or for the session.
   */
  public static unlockPalette(paletteId: string): void {
    localStorage.setItem(`fillary_unlocked_palette_${paletteId}`, 'true');
    Toast.show('Palette unlocked successfully! 🎨');
  }

  /**
   * Clean, minimalist Web / Simulator Ad Modal with countdown.
   * Lets users test the full monetization flow without needing a native mobile build.
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
            <h3>${title}</h3>
            <p>Google AdMob Simulator • Production Test Mode</p>
          </div>
          <div class="ad-simulation-timer" id="ad-timer">
            ${secondsLeft > 0 ? `Reward in ${secondsLeft}s...` : 'Ready to Close'}
          </div>
          <button class="ad-simulation-btn" id="ad-close-btn" disabled>
            <span>Please wait...</span>
          </button>
        </div>
      `;

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
          timerEl.textContent = `Reward in ${secondsLeft}s...`;
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
