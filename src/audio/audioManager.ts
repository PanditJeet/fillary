/**
 * Zen Relaxation Audio Engine for Fillary
 * Procedural ambient music & ASMR waterdrop fill sound effects using the Web Audio API.
 * 0 MB download, works completely offline, infinite non-repeating relaxation.
 */

import { StorageManager } from '../storage/storageManager.js';

export type SoundscapeType = 'chimes';

export class AudioManager {
  private static ctx: AudioContext | null = null;
  private static masterGain: GainNode | null = null;
  private static musicGain: GainNode | null = null;
  private static sfxGain: GainNode | null = null;

  private static isMusicPlaying = false;
  private static isSfxEnabled = true;
  private static activeTrack: SoundscapeType = 'chimes';
  private static volume = 0.70; // 70% default for optimal mobile speaker audibility

  // Active synthesizers
  private static activeNodes: Array<{ stop: () => void }> = [];
  private static chimesTimer: number | null = null;
  private static stopFadeTimer: number | null = null;
  private static isInitialized = false;

  public static initialize(): void {
    if (this.isInitialized) return;

    // Load saved preferences
    const savedMusic = StorageManager.getItem('fillary_audio_music');
    const savedSfx = StorageManager.getItem('fillary_audio_sfx');
    const savedVol = StorageManager.getItem('fillary_audio_volume');
    const savedTrack = StorageManager.getItem('fillary_audio_track') as SoundscapeType;

    if (savedMusic !== null) this.isMusicPlaying = savedMusic === 'true';
    if (savedSfx !== null) this.isSfxEnabled = savedSfx === 'true';
    if (savedVol !== null) {
      const v = parseFloat(savedVol);
      if (isFinite(v)) this.volume = Math.max(0, Math.min(1, v));
    }
    if (savedTrack && ['chimes'].includes(savedTrack)) {
      this.activeTrack = savedTrack as SoundscapeType;
    } else {
      this.activeTrack = 'chimes';
    }

    this.isInitialized = true;

    // Unlock AudioContext on first user interaction with retry until confirmed running
    const unlockEvents = ['click', 'touchstart', 'touchend', 'pointerdown', 'keydown'];
    const unlockAudio = async () => {
      try {
        const ctx = this.ensureContext();
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        if (ctx.state === 'running') {
          if (this.isMusicPlaying && this.activeNodes.length === 0) {
            this.startSoundscape(this.activeTrack);
          }
          // Only remove once AudioContext is actively running
          unlockEvents.forEach(evt => {
            window.removeEventListener(evt, unlockAudio);
          });
        }
      } catch (err) {
        console.warn('[AudioManager] Audio unlock error:', err);
      }
    };

    unlockEvents.forEach(evt => {
      window.addEventListener(evt, unlockAudio, { passive: true });
    });
  }

  public static ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.isMusicPlaying ? 1 : 0, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.isSfxEnabled ? 1 : 0, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }
    return this.ctx;
  }

  public static async resumeContext(): Promise<AudioContext> {
    const ctx = this.ensureContext();
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (_) {}
    }
    return ctx;
  }

  public static startMusicIfPlaying(): void {
    if (!this.isMusicPlaying) return;
    const ctx = this.ensureContext();
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        if (this.isMusicPlaying && this.activeNodes.length === 0) {
          this.startSoundscape(this.activeTrack);
        }
      }).catch(() => {});
    } else if (this.activeNodes.length === 0) {
      this.startSoundscape(this.activeTrack);
    }
  }

  public static pauseOnBackground(): void {
    if (this.ctx && this.ctx.state === 'running') {
      try {
        this.ctx.suspend();
      } catch (_) {}
    }
  }

  public static resumeOnForeground(): void {
    if (this.ctx && this.ctx.state === 'suspended' && this.isMusicPlaying) {
      try {
        this.ctx.resume();
      } catch (_) {}
    }
  }

  /**
   * Toggles background music on / off.
   */
  public static toggleMusic(): boolean {
    this.ensureContext();
    this.isMusicPlaying = !this.isMusicPlaying;
    StorageManager.setItem('fillary_audio_music', String(this.isMusicPlaying));

    if (this.stopFadeTimer) {
      window.clearTimeout(this.stopFadeTimer);
      this.stopFadeTimer = null;
    }

    if (this.musicGain && this.ctx) {
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      if (this.isMusicPlaying) {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().then(() => {
            if (this.activeNodes.length === 0) {
              this.startSoundscape(this.activeTrack);
            }
          }).catch(() => {});
        } else {
          if (this.activeNodes.length === 0) {
            this.startSoundscape(this.activeTrack);
          }
        }
        this.musicGain.gain.setTargetAtTime(1, this.ctx.currentTime, 0.3);
      } else {
        this.musicGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
        this.stopFadeTimer = window.setTimeout(() => {
          if (!this.isMusicPlaying) {
            this.stopSoundscape();
          }
          this.stopFadeTimer = null;
        }, 400);
      }
    }

    return this.isMusicPlaying;
  }

  public static setMusicEnabled(enabled: boolean): void {
    if (this.isMusicPlaying === enabled) return;
    this.toggleMusic();
  }

  public static getIsMusicPlaying(): boolean {
    return this.isMusicPlaying;
  }

  public static getIsSfxEnabled(): boolean {
    return this.isSfxEnabled;
  }

  public static setSfxEnabled(enabled: boolean): void {
    this.isSfxEnabled = enabled;
    StorageManager.setItem('fillary_audio_sfx', String(enabled));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(enabled ? 1 : 0, this.ctx.currentTime);
    }
  }

  public static getActiveTrack(): SoundscapeType {
    return this.activeTrack;
  }

  public static setTrack(track: SoundscapeType): void {
    if (this.stopFadeTimer) {
      window.clearTimeout(this.stopFadeTimer);
      this.stopFadeTimer = null;
    }

    if (this.activeTrack === track && this.activeNodes.length > 0) return;
    this.activeTrack = track;
    StorageManager.setItem('fillary_audio_track', track);

    if (this.isMusicPlaying) {
      this.stopSoundscape();
      this.startSoundscape(track);
    }
  }

  public static getVolume(): number {
    return this.volume;
  }

  public static setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    StorageManager.setItem('fillary_audio_volume', String(this.volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Plays satisfying ASMR waterdrop / bubble pop on color fill.
   */
  public static playFillSound(): void {
    if (!this.isSfxEnabled) return;
    try {
      const ctx = this.ensureContext();
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          this.triggerWaterdrop(ctx);
        }).catch(() => {});
        return;
      }
      this.triggerWaterdrop(ctx);
    } catch {
      // AudioContext not ready or blocked
    }
  }

  private static triggerWaterdrop(ctx: AudioContext): void {
    const now = ctx.currentTime;

    // Dual-oscillator ASMR water droplet effect
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Pitch sweep: 440Hz -> 840Hz (crisp water droplet pop)
    const baseFreq = 440 + Math.random() * 80;
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.85, now + 0.08);

    // Warm resonant undertone
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 0.5, now);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.95, now + 0.08);

    // Punchy attack with soft exponential tail
    gainNode.gain.setValueAtTime(0.75, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.sfxGain!);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.23);
    osc2.stop(now + 0.23);
  }

  /**
   * Starts chosen procedural ambient soundscape.
   */
  private static startSoundscape(track: SoundscapeType): void {
    this.stopSoundscape();
    const ctx = this.ensureContext();

    if (track === 'chimes') {
      this.synthesizeCelestialChimes(ctx);
    }
  }

  private static stopSoundscape(): void {
    if (this.stopFadeTimer) {
      window.clearTimeout(this.stopFadeTimer);
      this.stopFadeTimer = null;
    }
    if (this.chimesTimer) {
      window.clearInterval(this.chimesTimer);
      this.chimesTimer = null;
    }
    this.activeNodes.forEach(n => {
      try { n.stop(); } catch {}
    });
    this.activeNodes = [];
  }

  /**
   * 3. Celestial Chimes: Gentle, crystal pentatonic chimes with lush presence.
   */
  private static synthesizeCelestialChimes(ctx: AudioContext): void {
    // Warm harmonic background pad
    const padOsc = ctx.createOscillator();
    const padGain = ctx.createGain();
    padOsc.type = 'sine';
    padOsc.frequency.setValueAtTime(288, ctx.currentTime);
    padGain.gain.setValueAtTime(0.12, ctx.currentTime);
    padOsc.connect(padGain);
    padGain.connect(this.musicGain!);
    padOsc.start();

    this.activeNodes.push({
      stop: () => {
        try { padOsc.stop(); } catch {}
      }
    });

    // Pentatonic scale frequencies for soothing chimes (C major pentatonic in octave 5 & 6)
    const chimeFreqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];

    const playRandomChime = () => {
      if (!this.isMusicPlaying || this.activeTrack !== 'chimes') return;
      try {
        const now = ctx.currentTime;
        const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

        osc.connect(gain);
        gain.connect(this.musicGain!);

        osc.start(now);
        osc.stop(now + 2.5);
      } catch {}
    };

    // Initial chime
    playRandomChime();

    // Trigger chimes at relaxing intervals
    this.chimesTimer = window.setInterval(() => {
      if (Math.random() > 0.25) {
        playRandomChime();
      }
    }, 1600);
  }
}
