import { AdService } from '../services/adService.js';

/**
 * Timed ad breaks with a visible warning.
 *
 * Every second it checks whether an ad break is due (4 active minutes since the last ad,
 * ad already loaded). If so, and the user is in the coloring studio with no popup open,
 * it shows a small "Ad break in 5…" pill, then shows the ad once the countdown ends
 * and no finger is on the screen (prevents accidental ad taps).
 */
export class AdBreakCountdown {
  private static readonly COUNTDOWN_SECONDS = 5;

  private pill: HTMLElement;
  private running = false;
  private pointersDown = 0;
  private isEligible: () => boolean;

  constructor(isEligible: () => boolean) {
    this.isEligible = isEligible;

    this.pill = document.createElement('div');
    this.pill.className = 'ad-countdown-pill';
    this.pill.setAttribute('role', 'status');
    this.pill.setAttribute('aria-live', 'polite');
    document.body.appendChild(this.pill);

    // Track fingers / mouse buttons so the ad never appears under an active touch
    window.addEventListener('pointerdown', () => { this.pointersDown++; }, true);
    const up = () => { this.pointersDown = Math.max(0, this.pointersDown - 1); };
    window.addEventListener('pointerup', up, true);
    window.addEventListener('pointercancel', up, true);
    window.addEventListener('blur', () => { this.pointersDown = 0; });

    window.setInterval(() => this.tick(), 1000);
  }

  private tick(): void {
    if (this.running || document.hidden) return;
    if (!this.isEligible()) return;
    if (!AdService.isTimedAdReady()) return;
    void this.runCountdown();
  }

  private async runCountdown(): Promise<void> {
    this.running = true;
    try {
      for (let s = AdBreakCountdown.COUNTDOWN_SECONDS; s > 0; s--) {
        if (!this.isEligible() || document.hidden) return; // user left the studio: try again later
        this.show(`Ad break in ${s}s`);
        await this.sleep(1000);
      }
      this.show('Ad break');
      // Wait (up to 10s) until no finger is on the screen
      for (let i = 0; i < 40 && this.pointersDown > 0; i++) {
        await this.sleep(250);
      }
      await this.sleep(300);
      if (!this.isEligible() || document.hidden) return;
      await AdService.showInterstitial('timed');
    } finally {
      this.hide();
      this.running = false;
    }
  }

  private show(text: string): void {
    this.pill.textContent = text;
    this.pill.classList.add('visible');
  }

  private hide(): void {
    this.pill.classList.remove('visible');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }
}
