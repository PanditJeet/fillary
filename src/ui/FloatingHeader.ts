import { CanvasManager } from '../engine/canvasManager.js';
import { PageMetadata } from '../engine/types.js';
import { Toast } from './Toast.js';
import { Logo } from './Logo.js';

export class FloatingHeader {
  private element: HTMLElement;
  private canvasManager: CanvasManager;
  private onOpenGallery: () => void;
  private onGoHome: () => void;

  private undoBtn!: HTMLButtonElement;
  private redoBtn!: HTMLButtonElement;
  private zoomIndicator!: HTMLElement;
  private titleEl!: HTMLElement;
  private categoryEl!: HTMLElement;

  constructor(canvasManager: CanvasManager, onOpenGallery: () => void, onGoHome: () => void) {
    this.canvasManager = canvasManager;
    this.onOpenGallery = onOpenGallery;
    this.onGoHome = onGoHome;

    this.element = document.createElement('header');
    this.element.className = 'floating-header';
    this.render();
    this.setupListeners();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public updatePageInfo(page: PageMetadata): void {
    if (this.titleEl) this.titleEl.textContent = page.title;
    if (this.categoryEl) this.categoryEl.textContent = page.category;
  }

  public updateZoom(scalePercent: number): void {
    if (this.zoomIndicator) {
      this.zoomIndicator.textContent = `${scalePercent}%`;
    }
  }

  public updateHistoryState(canUndo: boolean, canRedo: boolean): void {
    if (this.undoBtn) this.undoBtn.disabled = !canUndo;
    if (this.redoBtn) this.redoBtn.disabled = !canRedo;
  }

  private render(): void {
    this.element.innerHTML = `
      <!-- Left Pill: Home, Gallery Navigation & Title -->
      <div class="header-group">
        <div class="pill-card">
          <!-- Return to Home Button with Logo -->
          <button class="btn-icon btn-logo-home" id="btn-home" title="Return to Home" aria-label="Return to Home">
            ${Logo.getMarkSvg(24)}
          </button>

          <div class="pill-separator"></div>

          <!-- Open Gallery Modal Button -->
          <button class="btn-icon" id="btn-gallery" title="Open All Pages" aria-label="Open Gallery">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </button>

          <div class="title-badge-container">
            <span class="badge-category" id="header-category">Animals</span>
            <span class="page-title-text" id="header-title">Playful Puppy</span>
          </div>
        </div>
      </div>

      <!-- Right Pill: Actions, History, Zoom & Export -->
      <div class="header-group">
        <!-- History & Zoom Pill -->
        <div class="pill-card">
          <button class="btn-icon" id="btn-undo" title="Undo (Ctrl+Z)" disabled>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 14 4 9 9 4"></polyline>
              <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
            </svg>
          </button>

          <button class="btn-icon" id="btn-redo" title="Redo (Ctrl+Y)" disabled>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 14 20 9 15 4"></polyline>
              <path d="M4 20v-7a4 4 0 0 1 4-4h12"></path>
            </svg>
          </button>

          <span class="zoom-indicator" id="zoom-indicator">100%</span>

          <button class="btn-icon" id="btn-zoom-reset" title="Fit to Screen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h6v6"></path>
              <path d="M9 21H3v-6"></path>
              <path d="M21 3l-7 7"></path>
              <path d="M3 21l7-7"></path>
            </svg>
          </button>

          <button class="btn-icon" id="btn-clear" title="Reset Canvas">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        </div>

        <!-- Export Pill -->
        <button class="btn-primary-pill" id="btn-export" title="Export Artwork">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Export</span>
        </button>
      </div>
    `;

    this.undoBtn = this.element.querySelector('#btn-undo')!;
    this.redoBtn = this.element.querySelector('#btn-redo')!;
    this.zoomIndicator = this.element.querySelector('#zoom-indicator')!;
    this.titleEl = this.element.querySelector('#header-title')!;
    this.categoryEl = this.element.querySelector('#header-category')!;
  }

  private setupListeners(): void {
    // Return to Home
    this.element.querySelector('#btn-home')?.addEventListener('click', () => {
      this.onGoHome();
    });

    // Open Gallery
    this.element.querySelector('#btn-gallery')?.addEventListener('click', () => {
      this.onOpenGallery();
    });

    this.undoBtn.addEventListener('click', () => {
      this.canvasManager.undo();
    });

    this.redoBtn.addEventListener('click', () => {
      this.canvasManager.redo();
    });

    this.element.querySelector('#btn-zoom-reset')?.addEventListener('click', () => {
      this.canvasManager.fitToScreen();
      Toast.show('Zoom centered');
    });

    this.element.querySelector('#btn-clear')?.addEventListener('click', () => {
      if (confirm('Revert all coloring on this page?')) {
        this.canvasManager.resetCanvas();
        Toast.show('Canvas cleared');
      }
    });

    this.element.querySelector('#btn-export')?.addEventListener('click', () => {
      this.exportArtwork();
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          this.canvasManager.redo();
        } else {
          this.canvasManager.undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        this.canvasManager.redo();
      }
    });
  }

  private exportArtwork(): void {
    const dataUrl = this.canvasManager.exportImage();
    const link = document.createElement('a');
    link.download = `Fillary-${(this.titleEl.textContent || 'art').toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    Toast.show('High-res artwork exported');
  }
}
