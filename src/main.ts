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

type ViewMode = 'home' | 'studio';

class App {
  private canvasManager!: CanvasManager;
  private header!: FloatingHeader;
  private paletteTray!: PaletteTray;
  private galleryModal!: GalleryModal;
  private homePage!: HomePage;
  private currentPage!: PageMetadata;

  private studioContainer!: HTMLElement;
  private currentView: ViewMode = 'home';

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    const appEl = document.getElementById('app')!;
    Toast.init();
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

    // 5. Initialize Header with Home and Gallery navigation
    this.header = new FloatingHeader(
      this.canvasManager,
      () => this.galleryModal.open(),
      () => this.showHome()
    );
    this.studioContainer.appendChild(this.header.getElement());

    // 6. Initialize Palette Dock
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
      // Auto-save progress
      if (this.currentPage) {
        StorageManager.savePageProgress(
          this.currentPage.id,
          this.canvasManager.history.getActions()
        );
      }
    });

    // 8. Initialize Home Page
    this.homePage = new HomePage((selectedPage) => {
      this.showStudio(selectedPage);
    });

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

  public showHome(): void {
    this.currentView = 'home';
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
    this.currentPage = page;
    StorageManager.setActivePageId(page.id);
    this.header.updatePageInfo(page);

    // Load saved progress
    const savedActions = StorageManager.loadPageProgress(page.id);
    await this.canvasManager.loadPage(page, savedActions);

    if (savedActions.length > 0) {
      Toast.show(`Resumed "${page.title}" (${savedActions.length} fills)`);
    } else {
      Toast.show(`Loaded "${page.title}"`);
    }
  }
}

// Start application once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
