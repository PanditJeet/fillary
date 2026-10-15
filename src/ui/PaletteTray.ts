import { CanvasManager } from '../engine/canvasManager.js';
import { ColorPalette } from '../engine/types.js';
import { PALETTES, getPaletteById } from '../pages/paletteCatalog.js';
import { StorageManager } from '../storage/storageManager.js';
import { AdService } from '../services/adService.js';

export class PaletteTray {
  private element: HTMLElement;
  private canvasManager: CanvasManager;
  private activePalette: ColorPalette;
  private currentColor: string;

  private swatchesContainer!: HTMLElement;
  private recentContainer!: HTMLElement;
  private tabsContainer!: HTMLElement;
  private colorInput!: HTMLInputElement;

  private static readonly PREMIUM_PALETTES = ['tropical-neon', 'jewel-crystals'];

  constructor(canvasManager: CanvasManager) {
    this.canvasManager = canvasManager;
    const initialPaletteId = StorageManager.getActivePalette();
    this.activePalette = getPaletteById(initialPaletteId);
    this.currentColor = this.activePalette.colors[0];
    this.canvasManager.setCurrentColor(this.currentColor);

    this.element = document.createElement('div');
    this.element.className = 'palette-dock-wrapper';
    this.render();
    this.setupListeners();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="palette-dock">
        <!-- Top Row: Palette Themes & Custom Picker -->
        <div class="palette-tabs-row">
          <div class="palette-tabs" id="palette-tabs-list">
          </div>

          <div class="color-picker-wrapper">
            <input type="color" id="hidden-color-picker" class="color-input-hidden" value="${this.currentColor}" />
            <button class="btn-custom-color" id="btn-custom-color" title="Custom Color">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <span>Custom</span>
            </button>
          </div>
        </div>

        <!-- Middle Row: Swatches of Current Palette -->
        <div class="swatches-row" id="palette-swatches">
          <!-- Populated dynamically -->
        </div>

        <!-- Bottom Row: Recent Colors -->
        <div class="recent-row">
          <span class="recent-label">Recent</span>
          <div class="recent-swatches" id="recent-swatches">
            <!-- Populated dynamically -->
          </div>
        </div>
      </div>
    `;

    this.swatchesContainer = this.element.querySelector('#palette-swatches')!;
    this.recentContainer = this.element.querySelector('#recent-swatches')!;
    this.tabsContainer = this.element.querySelector('#palette-tabs-list')!;
    this.colorInput = this.element.querySelector('#hidden-color-picker')!;

    this.renderTabs();
    this.renderSwatches();
    this.renderRecentColors();
  }

  private renderTabs(): void {
    if (!this.tabsContainer) return;
    this.tabsContainer.innerHTML = PALETTES.map(p => {
      const isPremium = PaletteTray.PREMIUM_PALETTES.includes(p.id);
      const isUnlocked = !isPremium || AdService.isPaletteUnlocked(p.id);
      const lockBadge = !isUnlocked ? '<span class="palette-lock-icon">🔒</span>' : '';
      return `
        <button class="palette-tab-btn ${p.id === this.activePalette.id ? 'active' : ''} ${!isUnlocked ? 'locked-palette' : ''}" data-palette-id="${p.id}">
          ${lockBadge}
          <span>${p.name}</span>
        </button>
      `;
    }).join('');
  }

  private renderSwatches(): void {
    this.swatchesContainer.innerHTML = '';
    const activeHex = this.normalizeHex(this.currentColor);

    this.activePalette.colors.forEach(color => {
      const btn = document.createElement('button');
      const isCurrent = this.normalizeHex(color) === activeHex;
      btn.className = `color-swatch ${isCurrent ? 'active' : ''}`;
      btn.style.backgroundColor = color;
      btn.title = color;

      btn.addEventListener('click', () => {
        this.selectColor(color);
      });

      this.swatchesContainer.appendChild(btn);
    });
  }

  private renderRecentColors(): void {
    const recent = StorageManager.getRecentColors();
    this.recentContainer.innerHTML = '';
    const activeHex = this.normalizeHex(this.currentColor);

    recent.slice(0, 7).forEach(color => {
      const chip = document.createElement('button');
      const isCurrent = this.normalizeHex(color) === activeHex;
      chip.className = `recent-swatch ${isCurrent ? 'active' : ''}`;
      chip.style.backgroundColor = color;
      chip.title = color;

      chip.addEventListener('click', () => {
        this.selectColor(color);
      });

      this.recentContainer.appendChild(chip);
    });
  }

  public selectColor(hex: string): void {
    const normalized = this.normalizeHex(hex);
    this.currentColor = normalized;
    this.canvasManager.setCurrentColor(normalized);
    this.colorInput.value = normalized;

    StorageManager.addRecentColor(normalized);

    // Update active UI classes
    const swatches = this.swatchesContainer.querySelectorAll('.color-swatch');
    swatches.forEach(s => {
      const el = s as HTMLElement;
      if (this.normalizeHex(el.style.backgroundColor) === normalized) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    this.renderRecentColors();
  }

  public selectPalette(paletteId: string): void {
    this.activePalette = getPaletteById(paletteId);
    StorageManager.setActivePalette(paletteId);

    // Update tab styles
    this.tabsContainer.querySelectorAll('.palette-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-palette-id') === paletteId);
    });

    this.renderSwatches();
    // Default to the first color in newly selected palette
    if (this.activePalette.colors.length > 0) {
      this.selectColor(this.activePalette.colors[0]);
    }
  }

  private normalizeHex(colorStr: string): string {
    if (!colorStr) return '';
    if (colorStr.startsWith('#')) {
      let hex = colorStr.slice(1);
      if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
      } else if (hex.length === 4) {
        hex = hex.slice(0, 3).split('').map(c => c + c).join('');
      } else if (hex.length >= 6) {
        hex = hex.slice(0, 6);
      }
      return `#${hex.toUpperCase()}`;
    }
    const match = colorStr.match(/\d+/g);
    if (!match || match.length < 3) return colorStr.toUpperCase();
    const [r, g, b] = match.map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`.toUpperCase();
  }

  private setupListeners(): void {
    // Tab switching with Rewarded Ad unlock for premium palettes
    this.tabsContainer.addEventListener('click', async (e) => {
      const target = (e.target as HTMLElement).closest('.palette-tab-btn');
      if (!target) return;

      const paletteId = target.getAttribute('data-palette-id');
      if (paletteId) {
        const isPremium = PaletteTray.PREMIUM_PALETTES.includes(paletteId);
        if (isPremium && !AdService.isPaletteUnlocked(paletteId)) {
          const palette = getPaletteById(paletteId);
          const confirmUnlock = confirm(`Watch a quick sponsored video to unlock the "${palette.name}" palette?`);
          if (confirmUnlock) {
            const earned = await AdService.showRewarded(`Unlock ${palette.name}`);
            if (earned) {
              AdService.unlockPalette(paletteId);
              this.renderTabs(); // Re-render tabs with unlocked badge
              this.selectPalette(paletteId);
            }
          }
          return;
        }

        this.selectPalette(paletteId);
      }
    });

    // Custom Color picker
    const customBtn = this.element.querySelector('#btn-custom-color')!;
    customBtn.addEventListener('click', () => {
      this.colorInput.click();
    });

    this.colorInput.addEventListener('input', (e) => {
      const val = (e.target as HTMLInputElement).value;
      this.selectColor(val);
    });
  }
}
