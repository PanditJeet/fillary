import './styles/theme.css';
import { CanvasManager } from './engine/canvasManager.js';
import { FloatingHeader } from './ui/FloatingHeader.js';
import { PaletteTray } from './ui/PaletteTray.js';
import { GalleryModal } from './ui/GalleryModal.js';
import { HomePage } from './ui/HomePage.js';
import { Toast } from './ui/Toast.js';
import { PAGES, getPageById } from './pages/pageCatalog.js';
import { StorageManager } from './storage/storageManager.js';
import { PageMetadata } from './engine/types.js';
import { AdService } from './services/adService.js';
import { AudioManager } from './audio/audioManager.js';
import { AudioModal } from './ui/AudioModal.js';
import { App as CapApp } from '@capacitor/app';

type ViewMode = 'home' | 'studio';

class App {
  private canvasManager!: CanvasManager;
  private header!: FloatingHeader;
  private paletteTray!: PaletteTray;
  private galleryModal!: GalleryModal;
  private audioModal!: AudioModal;
  private homePage!: HomePage;
  private currentPage!: PageMetadata;

  private studioContainer!: HTMLElement;
  private currentView: ViewMode = 'home';
  private saveTimer: number | null = null;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    const appEl = document.getElementById('app')!;
    Toast.init();
    AudioManager.initialize();
    await AdService.initialize();

    // 1. Studio View Wrapper
    this.studioContainer = document.createElement('div');
    this.studioContainer.className = 'studio-container view-hidden';

    // 2. Create Canvas Container & Display Canvas
    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'canvas-container';

    const displayCanvas = document.createElement('canvas');
    displayCanvas.id = 'display-canvas';
    canvasContainer.appendChild(displayCanvas);
    this.studioContainer.appendChild(canvasContainer);

    // 3. Initialize Canvas Engine
    this.canvasManager = new CanvasManager(displayCanvas);

    // 4. Initialize Gallery Modal
    this.galleryModal = new GalleryModal((selectedPage) => {
      this.switchPage(selectedPage);
    });
    document.body.appendChild(this.galleryModal.getElement());

    // 5. Initialize Audio Sanctuary Modal
    this.audioModal = new AudioModal(() => {
      this.header.updateAudioState();
      this.homePage.refresh();
    });
    document.body.appendChild(this.audioModal.getElement());

    // 6. Initialize Header with Home, Gallery, and Audio Sanctuary navigation
    this.header = new FloatingHeader(
      this.canvasManager,
      () => this.galleryModal.open(),
      () => this.showHome(),
      () => this.audioModal.open()
    );
    this.studioContainer.appendChild(this.header.getElement());

    // 7. Initialize Palette Dock
    this.paletteTray = new PaletteTray(this.canvasManager);
    this.studioContainer.appendChild(this.paletteTray.getElement());

    // 7. Connect Canvas Engine Callbacks to UI
    this.canvasManager.setOnTransformChange((scalePercent) => {
      this.header.updateZoom(scalePercent);
    });

    this.canvasManager.history.setOnStateChange((canUndo, canRedo) => {
      this.header.updateHistoryState(canUndo, canRedo);
    });

    this.canvasManager.setOnFillChange((_actionCount) => {
      // Auto-save shortly after each fill (batched so rapid taps don't re-encode the thumbnail every time).
      // Lifecycle events below flush immediately, so progress isn't lost if the app is closed.
      this.scheduleSave();
    });

    // Native Capacitor App Lifecycle Listeners (Android APK)
    if (typeof window !== 'undefined') {
      try {
        CapApp.addListener('appStateChange', (state) => {
          if (!state.isActive) {
            this.saveCurrentProgress();
            AudioManager.pauseOnBackground();
          } else {
            AudioManager.resumeOnForeground();
          }
        }).catch(() => {});

        CapApp.addListener('pause', () => {
          this.saveCurrentProgress();
          AudioManager.pauseOnBackground();
        }).catch(() => {});

        CapApp.addListener('backButton', () => {
          // Close the top-most overlay first, then leave the studio, then exit
          if (document.querySelector('.ad-simulation-overlay')) {
            return;
          }
          if (this.audioModal.isOpen()) {
            this.audioModal.close();
          } else if (this.galleryModal.isOpen()) {
            this.galleryModal.close();
          } else if (this.currentView === 'studio') {
            this.showHome();
          } else {
            this.saveCurrentProgress();
            CapApp.exitApp();
          }
        }).catch(() => {});
      } catch (_) {}
    }

    // Standard Web Lifecycle Listeners (browser / desktop fallback)
    window.addEventListener('beforeunload', () => this.saveCurrentProgress());
    window.addEventListener('pagehide', () => this.saveCurrentProgress());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.saveCurrentProgress();
    });

    // 8. Initialize Home Page
    this.homePage = new HomePage(
      (selectedPage) => {
        this.showStudio(selectedPage);
      },
      () => {
        this.audioModal.open();
      }
    );

    appEl.appendChild(this.homePage.getElement());
    appEl.appendChild(this.studioContainer);

    // 9. Initial Page Setup
    const savedPageId = StorageManager.getActivePageId();
    this.currentPage = savedPageId ? getPageById(savedPageId) : PAGES[0];

    // Default view: Home Page
    this.showHome();
  }

  public getCurrentView(): ViewMode {
    return this.currentView;
  }

  private scheduleSave(): void {
    if (this.saveTimer !== null) window.clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(() => {
      this.saveTimer = null;
      this.saveCurrentProgress();
    }, 400);
  }

  private saveCurrentProgress(): void {
    if (this.saveTimer !== null) {
      window.clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    if (this.currentView !== 'studio') return;
    const canvasPage = this.canvasManager.getCurrentPage();
    if (!canvasPage || !this.currentPage || canvasPage.id !== this.currentPage.id) return;

    const actions = this.canvasManager.history.getActions();
    if (actions.length === 0 && !StorageManager.hasPageProgress(canvasPage.id)) {
      return;
    }
    const thumbUrl = this.canvasManager.getThumbnailDataUrl(256);
    StorageManager.savePageProgress(canvasPage.id, actions, thumbUrl);
  }

  public showHome(): void {
    if (this.currentView === 'studio') {
      this.saveCurrentProgress();
    }
    this.currentView = 'home';
    this.galleryModal.close();
    this.studioContainer.classList.add('view-hidden');
    this.studioContainer.classList.remove('view-active');
    
    this.homePage.refresh();
    this.homePage.getElement().classList.remove('view-hidden');
    this.homePage.getElement().classList.add('view-active');
  }

  public async showStudio(targetPage?: PageMetadata): Promise<void> {
    this.currentView = 'studio';
    this.homePage.getElement().classList.add('view-hidden');
    this.homePage.getElement().classList.remove('view-active');

    this.studioContainer.classList.remove('view-hidden');
    this.studioContainer.classList.add('view-active');

    // Force synchronous reflow so clientWidth and clientHeight are populated
    void this.studioContainer.offsetHeight;
    this.canvasManager.handleResize();

    const pageToLoad = targetPage || this.currentPage || PAGES[0];
    await this.switchPage(pageToLoad);

    // Music only plays if the user turned it on in Sound settings
    AudioManager.startMusicIfPlaying();
    this.header.updateAudioState();
    
    // Ensure display canvas fits perfectly to the screen
    requestAnimationFrame(() => {
      this.canvasManager.handleResize();
      this.canvasManager.fitToScreen();
    });
    setTimeout(() => {
      this.canvasManager.handleResize();
      this.canvasManager.fitToScreen();
    }, 60);
  }

  private async switchPage(page: PageMetadata): Promise<void> {
    // Flush progress of previous page if switching to another
    if (this.currentPage && this.currentPage.id !== page.id) {
      this.saveCurrentProgress();
    }

    // Load saved progress (with raster dataUrl or action history)
    const savedProgress = StorageManager.getPageProgress(page.id);
    let loaded: boolean;
    try {
      loaded = await this.canvasManager.loadPage(page, savedProgress);
    } catch (err) {
      console.error('[App] Failed to load page', page.id, err);
      Toast.show(`Couldn't open "${page.title}". Please try again.`);
      return;
    }
    if (!loaded) return; // A newer page selection superseded this one

    this.currentPage = page;
    StorageManager.setActivePageId(page.id);
    this.header.updatePageInfo(page);

    const actionCount = this.canvasManager.history.actionCount;
    if (actionCount > 0 || (savedProgress && savedProgress.dataUrl)) {
      Toast.show(`Resumed "${page.title}" (${actionCount} fills)`);
    } else {
      Toast.show(`Loaded "${page.title}"`);
    }
  }
}

// Bootstrap application once DOM and persistent storage are ready
async function bootstrap() {
  await StorageManager.init();
  new App();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
