/**
 * Zen Relaxation Audio Engine for Fillary
 * Procedural ambient music & ASMR waterdrop fill sound effects using the Web Audio API.
 * 0 MB download, works completely offline, infinite non-repeating relaxation.
 */

export type SoundscapeType = 'zen' | 'rain' | 'chimes';

export class AudioManager {
  private static ctx: AudioContext | null = null;
  private static masterGain: GainNode | null = null;
  private static musicGain: GainNode | null = null;
  private static sfxGain: GainNode | null = null;

  private static isMusicPlaying = false;
  private static isSfxEnabled = true;
  private static activeTrack: SoundscapeType = 'zen';
  private static volume = 0.35; // Soft 35% default for calming ambiance

  // Active synthesizers
  private static activeNodes: Array<{ stop: () => void }> = [];
  private static chimesTimer: number | null = null;
  private static isInitialized = false;

  public static initialize(): void {
    if (this.isInitialized) return;

    // Load saved preferences
    const savedMusic = localStorage.getItem('fillary_audio_music');
    const savedSfx = localStorage.getItem('fillary_audio_sfx');
    const savedVol = localStorage.getItem('fillary_audio_volume');
    const savedTrack = localStorage.getItem('fillary_audio_track') as SoundscapeType;

    if (savedMusic !== null) this.isMusicPlaying = savedMusic === 'true';
    if (savedSfx !== null) this.isSfxEnabled = savedSfx === 'true';
    if (savedVol !== null) this.volume = parseFloat(savedVol);
    if (savedTrack && ['zen', 'rain', 'chimes'].includes(savedTrack)) this.activeTrack = savedTrack;

    this.isInitialized = true;

    // Unlock AudioContext on first user interaction (browser policy)
    const unlockAudio = () => {
      this.ensureContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (this.isMusicPlaying && this.activeNodes.length === 0) {
        this.startSoundscape(this.activeTrack);
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
  }

  private static ensureContext(): AudioContext {
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

  /**
   * Toggles background music on / off.
   */
  public static toggleMusic(): boolean {
    this.ensureContext();
    this.isMusicPlaying = !this.isMusicPlaying;
    localStorage.setItem('fillary_audio_music', String(this.isMusicPlaying));

    if (this.musicGain && this.ctx) {
      if (this.isMusicPlaying) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.musicGain.gain.setTargetAtTime(1, this.ctx.currentTime, 0.4);
        if (this.activeNodes.length === 0) {
          this.startSoundscape(this.activeTrack);
        }
      } else {
        this.musicGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
        setTimeout(() => this.stopSoundscape(), 500);
      }
    }

    return this.isMusicPlaying;
  }

  public static getIsMusicPlaying(): boolean {
    return this.isMusicPlaying;
  }

  public static getIsSfxEnabled(): boolean {
    return this.isSfxEnabled;
  }

  public static setSfxEnabled(enabled: boolean): void {
    this.isSfxEnabled = enabled;
    localStorage.setItem('fillary_audio_sfx', String(enabled));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(enabled ? 1 : 0, this.ctx.currentTime);
    }
  }

  public static getActiveTrack(): SoundscapeType {
    return this.activeTrack;
  }

  public static setTrack(track: SoundscapeType): void {
    if (this.activeTrack === track && this.activeNodes.length > 0) return;
    this.activeTrack = track;
    localStorage.setItem('fillary_audio_track', track);

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
    localStorage.setItem('fillary_audio_volume', String(this.volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }
  }

  /**
   * Plays satisfying ASMR waterdrop / bubble pop on color fill.
   */
  public static playFillSound(): void {
    if (!this.isSfxEnabled) return;
    try {
      const ctx = this.ensureContext();
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      // Dual-oscillator waterdrop effect: fast upward pitch glide with soft exponential decay
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pitch sweep: 380Hz -> 640Hz (mimicking water droplet pop)
      const baseFreq = 380 + Math.random() * 80;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // AudioContext not ready or blocked
    }
  }

  /**
   * Starts chosen procedural ambient soundscape.
   */
  private static startSoundscape(track: SoundscapeType): void {
    this.stopSoundscape();
    const ctx = this.ensureContext();

    if (track === 'zen') {
      this.synthesizeZenSanctuary(ctx);
    } else if (track === 'rain') {
      this.synthesizeCozyRain(ctx);
    } else if (track === 'chimes') {
      this.synthesizeCelestialChimes(ctx);
    }
  }

  private static stopSoundscape(): void {
    if (this.chimesTimer) {
      clearInterval(this.chimesTimer);
      this.chimesTimer = null;
    }
    this.activeNodes.forEach(n => {
      try { n.stop(); } catch {}
    });
    this.activeNodes = [];
  }

  /**
   * 1. Zen Sanctuary: 432Hz meditative Tibetan singing bowl chords with warm low drone.
   */
  private static synthesizeZenSanctuary(ctx: AudioContext): void {
    // Tibetan Singing Bowl Harmonic Frequencies: 108Hz (Root), 216Hz, 324Hz, 432Hz
    const freqs = [108, 162, 216, 324, 432];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Gentle LFO vibrato / beating effect
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.15 + idx * 0.08, ctx.currentTime);
      lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, ctx.currentTime);

      gain.gain.setValueAtTime(0.08 / freqs.length, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain!);

      osc.start();

      this.activeNodes.push({
        stop: () => {
          try {
            lfo.stop();
            osc.stop();
          } catch {}
        }
      });
    });
  }

  /**
   * 2. Cozy Rain: Soft pink-noise rain simulation with bandpass filtered droplets.
   */
  private static synthesizeCozyRain(ctx: AudioContext): void {
    // 5 seconds pink noise buffer looped
    const bufferSize = ctx.sampleRate * 5;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to sound like soft window rain
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain!);

    whiteNoise.start();

    this.activeNodes.push({
      stop: () => {
        try { whiteNoise.stop(); } catch {}
      }
    });
  }

  /**
   * 3. Celestial Chimes: Gentle, crystal pentatonic chimes drifting over a calming pad.
   */
  private static synthesizeCelestialChimes(ctx: AudioContext): void {
    // Background pad
    const padOsc = ctx.createOscillator();
    const padGain = ctx.createGain();
    padOsc.type = 'sine';
    padOsc.frequency.setValueAtTime(144, ctx.currentTime);
    padGain.gain.setValueAtTime(0.04, ctx.currentTime);
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

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

        osc.connect(gain);
        gain.connect(this.musicGain!);

        osc.start(now);
        osc.stop(now + 2.6);
      } catch {}
    };

    // Trigger chimes at relaxing, organic intervals
    this.chimesTimer = window.setInterval(() => {
      if (Math.random() > 0.3) {
        playRandomChime();
      }
    }, 1800);
  }
}
