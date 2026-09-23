import './styles/theme.css';
import { CanvasManager } from './engine/canvasManager.js';
import { FloatingHeader } from './ui/FloatingHeader.js';
import { PaletteTray } from './ui/PaletteTray.js';
import { GalleryModal } from './ui/GalleryModal.js';
import { Toast } from './ui/Toast.js';
import { PAGES, getPageById } from './pages/pageCatalog.js';
import { StorageManager } from './storage/storageManager.js';
import { PageMetadata } from './engine/types.js';

class App {
  private canvasManager!: CanvasManager;
  private header!: FloatingHeader;
  private paletteTray!: PaletteTray;
  private galleryModal!: GalleryModal;
  private currentPage!: PageMetadata;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    const appEl = document.getElementById('app')!;
    Toast.init();

    // 1. Create Canvas Container & Display Canvas
    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'canvas-container';

    const displayCanvas = document.createElement('canvas');
    displayCanvas.id = 'display-canvas';
    canvasContainer.appendChild(displayCanvas);
    appEl.appendChild(canvasContainer);

    // 2. Initialize Canvas Engine
    this.canvasManager = new CanvasManager(displayCanvas);

    // 3. Initialize Gallery Modal
    this.galleryModal = new GalleryModal((selectedPage) => {
      this.switchPage(selectedPage);
    });
    document.body.appendChild(this.galleryModal.getElement());

    // 4. Initialize Header
    this.header = new FloatingHeader(this.canvasManager, () => {
      this.galleryModal.open();
    });
    appEl.appendChild(this.header.getElement());

    // 5. Initialize Palette Dock
    this.paletteTray = new PaletteTray(this.canvasManager);
    appEl.appendChild(this.paletteTray.getElement());

    // 6. Connect Canvas Engine Callbacks to UI
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

    // 7. Load Initial Page
    const savedPageId = StorageManager.getActivePageId();
    const initialPage = savedPageId ? getPageById(savedPageId) : PAGES[0];
    await this.switchPage(initialPage);
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
