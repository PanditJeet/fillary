import { AudioManager, SoundscapeType } from '../audio/audioManager.js';
import { Toast } from './Toast.js';

export class AudioModal {
  private element: HTMLElement;
  private isOpen = false;
  private onStateChange?: () => void;

  constructor(onStateChange?: () => void) {
    this.onStateChange = onStateChange;
    this.element = document.createElement('div');
    this.element.className = 'audio-modal-overlay modal-hidden';
    this.render();
    this.setupListeners();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public open(): void {
    this.isOpen = true;
    this.render();
    this.setupListeners();
    this.element.classList.remove('modal-hidden');
    this.element.classList.add('modal-active');
  }

  public close(): void {
    this.isOpen = false;
    this.element.classList.remove('modal-active');
    this.element.classList.add('modal-hidden');
    if (this.onStateChange) {
      this.onStateChange();
    }
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private render(): void {
    const isPlaying = AudioManager.getIsMusicPlaying();
    const isSfx = AudioManager.getIsSfxEnabled();
    const currentTrack = AudioManager.getActiveTrack();
    const volumePercent = Math.round(AudioManager.getVolume() * 100);

    this.element.innerHTML = `
      <div class="audio-modal-backdrop" id="audio-backdrop"></div>
      <div class="audio-modal-card">
        <!-- Modal Header -->
        <div class="audio-modal-header">
          <div class="audio-modal-title-group">
            <div class="audio-modal-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
            </div>
            <div>
              <h3 class="audio-modal-title">Sound Sanctuary</h3>
              <p class="audio-modal-subtitle">Procedural ambient soundscapes &amp; ASMR effects</p>
            </div>
          </div>
          <button class="btn-icon audio-modal-close" id="audio-close-btn" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Master Music Toggle -->
        <div class="audio-setting-row">
          <div class="audio-setting-label">
            <span class="audio-setting-name">Ambient Soundscape</span>
            <span class="audio-setting-desc">Infinite generative relaxation music</span>
          </div>
          <button class="toggle-pill ${isPlaying ? 'active' : ''}" id="toggle-music-btn">
            <span class="toggle-slider"></span>
          </button>
        </div>

        <!-- Track Selection Cards -->
        <div class="audio-tracks-grid ${!isPlaying ? 'disabled-section' : ''}">
          <div class="audio-track-card ${currentTrack === 'zen' ? 'active' : ''}" data-track="zen">
            <div class="track-icon">🧘</div>
            <div class="track-info">
              <div class="track-name">Zen Sanctuary</div>
              <div class="track-meta">432Hz Tibetan Singing Bowls</div>
            </div>
            ${currentTrack === 'zen' && isPlaying ? '<span class="audio-wave-anim"><span></span><span></span><span></span></span>' : ''}
          </div>

          <div class="audio-track-card ${currentTrack === 'rain' ? 'active' : ''}" data-track="rain">
            <div class="track-icon">🌧️</div>
            <div class="track-info">
              <div class="track-name">Cozy Rain</div>
              <div class="track-meta">Soft Pink-Noise Window Rain</div>
            </div>
            ${currentTrack === 'rain' && isPlaying ? '<span class="audio-wave-anim"><span></span><span></span><span></span></span>' : ''}
          </div>

          <div class="audio-track-card ${currentTrack === 'chimes' ? 'active' : ''}" data-track="chimes">
            <div class="track-icon">✨</div>
            <div class="track-info">
              <div class="track-name">Celestial Chimes</div>
              <div class="track-meta">Gentle Pentatonic Wind Chimes</div>
            </div>
            ${currentTrack === 'chimes' && isPlaying ? '<span class="audio-wave-anim"><span></span><span></span><span></span></span>' : ''}
          </div>
        </div>

        <!-- Master Volume Slider -->
        <div class="audio-setting-row volume-slider-row ${!isPlaying ? 'disabled-section' : ''}">
          <div class="audio-setting-label">
            <span class="audio-setting-name">Music Volume</span>
            <span class="audio-setting-desc" id="volume-indicator-text">${volumePercent}%</span>
          </div>
          <div class="volume-slider-container">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="volume-icon">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
            <input type="range" min="0" max="100" value="${volumePercent}" class="audio-volume-range" id="audio-volume-range" />
          </div>
        </div>

        <!-- ASMR Fill Effects Toggle -->
        <div class="audio-setting-row">
          <div class="audio-setting-label">
            <span class="audio-setting-name">ASMR Fill Sounds</span>
            <span class="audio-setting-desc">Gentle waterdrop pop on each colored area</span>
          </div>
          <button class="toggle-pill ${isSfx ? 'active' : ''}" id="toggle-sfx-btn">
            <span class="toggle-slider"></span>
          </button>
        </div>

        <!-- Footer / Test Sound Button -->
        <div class="audio-modal-footer">
          <button class="btn-secondary-pill" id="test-sfx-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <span>Preview Fill Sound</span>
          </button>
          <button class="btn-primary-pill" id="audio-done-btn">
            <span>Done</span>
          </button>
        </div>
      </div>
    `;
  }

  private setupListeners(): void {
    // Backdrop / Close
    this.element.querySelector('#audio-backdrop')?.addEventListener('click', () => this.close());
    this.element.querySelector('#audio-close-btn')?.addEventListener('click', () => this.close());
    this.element.querySelector('#audio-done-btn')?.addEventListener('click', () => this.close());

    // Toggle Music
    this.element.querySelector('#toggle-music-btn')?.addEventListener('click', () => {
      const nowPlaying = AudioManager.toggleMusic();
      Toast.show(nowPlaying ? 'Ambient soundscape started' : 'Soundscape paused');
      this.render();
      this.setupListeners();
      if (this.onStateChange) this.onStateChange();
    });

    // Track Selection
    this.element.querySelectorAll('.audio-track-card').forEach(card => {
      card.addEventListener('click', () => {
        const track = card.getAttribute('data-track') as SoundscapeType;
        if (track) {
          AudioManager.setTrack(track);
          if (!AudioManager.getIsMusicPlaying()) {
            AudioManager.toggleMusic();
          }
          this.render();
          this.setupListeners();
          if (this.onStateChange) this.onStateChange();
        }
      });
    });

    // Volume Slider
    const volumeSlider = this.element.querySelector('#audio-volume-range') as HTMLInputElement;
    volumeSlider?.addEventListener('input', (e) => {
      const val = parseInt((e.target as HTMLInputElement).value, 10);
      AudioManager.setVolume(val / 100);
      const textEl = this.element.querySelector('#volume-indicator-text');
      if (textEl) textEl.textContent = `${val}%`;
    });

    // Toggle SFX
    this.element.querySelector('#toggle-sfx-btn')?.addEventListener('click', () => {
      const current = AudioManager.getIsSfxEnabled();
      AudioManager.setSfxEnabled(!current);
      Toast.show(!current ? 'ASMR fill sounds enabled' : 'Fill sounds muted');
      this.render();
      this.setupListeners();
      if (this.onStateChange) this.onStateChange();
    });

    // Preview Sound
    this.element.querySelector('#test-sfx-btn')?.addEventListener('click', () => {
      AudioManager.playFillSound();
    });
  }
}
