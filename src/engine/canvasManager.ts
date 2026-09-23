import { PageMetadata, Point, ViewportTransform } from './types.js';
import { scanlineFloodFill } from './floodFill.js';
import { HistoryManager } from './history.js';
import { AudioManager } from '../audio/audioManager.js';
import { PageProgress } from '../storage/storageManager.js';

export class CanvasManager {
  private displayCanvas: HTMLCanvasElement;
  private displayCtx: CanvasRenderingContext2D;

  private colorCanvas: HTMLCanvasElement;
  private colorCtx: CanvasRenderingContext2D;

  private lineArtCanvas: HTMLCanvasElement;
  private lineArtCtx: CanvasRenderingContext2D;

  private lineArtMask: Uint8Array = new Uint8Array(1024 * 1024);
  private canvasSize: number = 1024;

  private transform: ViewportTransform = { scale: 1, offsetX: 0, offsetY: 0 };
  private dragStart: Point = { x: 0, y: 0 };

  // Touch tracking for pinch-to-zoom
  private activeTouchPointers: Map<number, Point> = new Map();
  private initialPinchDistance: number = 0;
  private initialPinchScale: number = 1;
  private pinchCenter: Point = { x: 0, y: 0 };

  private currentColor: string = '#E07A5F';
  private currentPage: PageMetadata | null = null;
  public history: HistoryManager = new HistoryManager();

  private onTransformChange?: (scale: number) => void;
  private onFillChange?: (actionCount: number) => void;

  constructor(displayCanvas: HTMLCanvasElement) {
    this.displayCanvas = displayCanvas;
    this.displayCtx = displayCanvas.getContext('2d', { alpha: false })!;

    // Create 1024x1024 offscreen color layer
    this.colorCanvas = document.createElement('canvas');
    this.colorCanvas.width = this.canvasSize;
    this.colorCanvas.height = this.canvasSize;
    this.colorCtx = this.colorCanvas.getContext('2d', { willReadFrequently: true })!;

    // Create 1024x1024 offscreen line-art layer
    this.lineArtCanvas = document.createElement('canvas');
    this.lineArtCanvas.width = this.canvasSize;
    this.lineArtCanvas.height = this.canvasSize;
    this.lineArtCtx = this.lineArtCanvas.getContext('2d', { willReadFrequently: true })!;

    this.initColorCanvas();
    this.setupEventListeners();
    this.handleResize();
    window.addEventListener('resize', () => {
      this.handleResize();
      this.fitToScreen();
    });

    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleResize();
        this.fitToScreen();
      }, 100);
    });

    // Automatically observe parent resize / visibility changes
    if (this.displayCanvas.parentElement && window.ResizeObserver) {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
            this.handleResize();
            this.fitToScreen();
          }
        }
      });
      ro.observe(this.displayCanvas.parentElement);
    }
  }

  private initColorCanvas(): void {
    this.colorCtx.fillStyle = '#FFFFFF';
    this.colorCtx.fillRect(0, 0, this.canvasSize, this.canvasSize);
  }

  public setOnTransformChange(cb: (scale: number) => void): void {
    this.onTransformChange = cb;
  }

  public setOnFillChange(cb: (actionCount: number) => void): void {
    this.onFillChange = cb;
  }

  public setCurrentColor(hex: string): void {
    this.currentColor = hex;
  }

  public getCurrentColor(): string {
    return this.currentColor;
  }

  public getColorCanvasDataUrl(): string {
    return this.colorCanvas.toDataURL('image/png');
  }

  public getHasFills(): boolean {
    return this.history.getActions().length > 0;
  }

  public handleResize(): void {
    const parent = this.displayCanvas.parentElement;
    if (!parent) return;

    const width = parent.clientWidth;
    const height = parent.clientHeight;
    if (width <= 0 || height <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    this.displayCanvas.width = width * dpr;
    this.displayCanvas.height = height * dpr;
    this.displayCanvas.style.width = `${width}px`;
    this.displayCanvas.style.height = `${height}px`;

    this.displayCtx.scale(dpr, dpr);
    this.render();
  }

  /**
   * Reset zoom and center the 1024x1024 canvas in the display viewport.
   * Dynamically adapts insets for portrait, landscape, mobile, and tablets
   * to ensure zero obstruction by the floating header or bottom palette dock.
   */
  public fitToScreen(): void {
    const parent = this.displayCanvas.parentElement;
    if (!parent) return;

    const viewW = parent.clientWidth;
    const viewH = parent.clientHeight;
    if (viewW <= 0 || viewH <= 0) return;

    // Adaptive insets based on device orientation and compact dimensions
    let topInset = 70;
    let bottomInset = 160;
    let sideInset = 24;

    const isLandscape = viewW > viewH;
    const isCompactHeight = viewH < 620;

    if (isLandscape && isCompactHeight) {
      // Mobile / Compact Landscape: slim header & compact dock
      topInset = 46;
      bottomInset = 74;
      sideInset = 16;
    } else if (viewW <= 640) {
      // Mobile Portrait: standard header & docked palette
      topInset = 66;
      bottomInset = 175;
      sideInset = 12;
    } else if (isLandscape) {
      // Tablet / Desktop Landscape
      topInset = 76;
      bottomInset = 150;
      sideInset = 32;
    }

    const availableW = Math.max(viewW - sideInset * 2, 80);
    const availableH = Math.max(viewH - topInset - bottomInset, 80);

    const scale = Math.max(Math.min(availableW / this.canvasSize, availableH / this.canvasSize, 1.0), 0.1);
    const offsetX = (viewW - this.canvasSize * scale) / 2;
    const offsetY = topInset + (availableH - this.canvasSize * scale) / 2;

    this.transform = { scale, offsetX, offsetY };
    this.notifyTransform();
    this.render();
  }

  public zoomIn(): void {
    this.zoomToPoint(1.25, this.displayCanvas.clientWidth / 2, this.displayCanvas.clientHeight / 2);
  }

  public zoomOut(): void {
    this.zoomToPoint(0.8, this.displayCanvas.clientWidth / 2, this.displayCanvas.clientHeight / 2);
  }

  private zoomToPoint(factor: number, clientX: number, clientY: number): void {
    const newScale = Math.min(Math.max(this.transform.scale * factor, 0.4), 6.0);
    const ratio = newScale / this.transform.scale;

    this.transform.offsetX = clientX - (clientX - this.transform.offsetX) * ratio;
    this.transform.offsetY = clientY - (clientY - this.transform.offsetY) * ratio;
    this.transform.scale = newScale;

    this.notifyTransform();
    this.render();
  }

  private notifyTransform(): void {
    if (this.onTransformChange) {
      this.onTransformChange(Math.round(this.transform.scale * 100));
    }
  }

  /**
   * Loads a line-art page, creates boundary mask, and restores any saved progress.
   */
  public async loadPage(
    page: PageMetadata,
    savedData?: PageProgress | Array<{ x: number; y: number; color: string }> | null
  ): Promise<void> {
    this.currentPage = page;
    this.history.clear();

    // Reset color layer to pristine white
    this.initColorCanvas();

    // Load line-art (either image file or SVG)
    if (page.imageUrl) {
      await this.renderImageFileToLineArtCanvas(page.imageUrl);
    } else if (page.svgContent) {
      await this.renderSvgToLineArtCanvas(page.svgContent);
    }

    // Compute boundary mask
    this.computeLineArtMask();

    // Restore saved progress if present
    if (savedData) {
      const isProgressObj = typeof savedData === 'object' && !Array.isArray(savedData) && 'pageId' in savedData;
      const progress = isProgressObj ? (savedData as PageProgress) : null;
      const actions = isProgressObj ? progress!.actions : (savedData as Array<{ x: number; y: number; color: string }>);

      if (actions && actions.length > 0) {
        // Replay actions sequentially to recreate multi-step undo history
        const colorImgData = this.colorCtx.getImageData(0, 0, this.canvasSize, this.canvasSize);
        for (const act of actions) {
          // Push snapshot before this action
          this.history.pushSnapshot(colorImgData, {
            pageId: page.id,
            x: act.x,
            y: act.y,
            color: act.color,
            timestamp: Date.now()
          });
          scanlineFloodFill(colorImgData, this.lineArtMask, act.x, act.y, act.color);
        }
        this.colorCtx.putImageData(colorImgData, 0, 0);

        // If raster dataUrl is present, overlay it to guarantee exact pixel restoration
        if (progress && progress.dataUrl) {
          await new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              this.colorCtx.drawImage(img, 0, 0, this.canvasSize, this.canvasSize);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = progress.dataUrl!;
          });
        }
      } else if (progress && progress.dataUrl) {
        // Only raster dataUrl saved (no actions array):
        // Save initial white state as base snapshot so user can undo back to clean white!
        const initialWhite = this.colorCtx.getImageData(0, 0, this.canvasSize, this.canvasSize);
        this.history.pushSnapshot(initialWhite);

        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            this.colorCtx.drawImage(img, 0, 0, this.canvasSize, this.canvasSize);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = progress.dataUrl!;
        });
      }
    }

    this.fitToScreen();
    this.render();
  }

  private renderImageFileToLineArtCanvas(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        this.lineArtCtx.clearRect(0, 0, this.canvasSize, this.canvasSize);
        this.lineArtCtx.drawImage(img, 0, 0, this.canvasSize, this.canvasSize);

        // Convert light/white background pixels to transparent so colors underneath show through
        // Keep linework bold and solid
        const imgData = this.lineArtCtx.getImageData(0, 0, this.canvasSize, this.canvasSize);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          if (lum > 210) {
            d[i + 3] = 0; // Pure transparent for all fillable areas
          } else {
            d[i] = 18;
            d[i + 1] = 18;
            d[i + 2] = 18;
            d[i + 3] = 255;
          }
        }
        this.lineArtCtx.putImageData(imgData, 0, 0);
        resolve();
      };

      img.onerror = (e) => reject(e);
      img.src = url;
    });
  }

  private renderSvgToLineArtCanvas(svgString: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        this.lineArtCtx.clearRect(0, 0, this.canvasSize, this.canvasSize);
        this.lineArtCtx.drawImage(img, 0, 0, this.canvasSize, this.canvasSize);

        // Strip any white/near-white pixels to transparent to guarantee colors underneath are visible
        const imgData = this.lineArtCtx.getImageData(0, 0, this.canvasSize, this.canvasSize);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          if (r > 210 && g > 210 && b > 210) {
            d[i + 3] = 0; // Set alpha to 0 so it never occludes colors
          }
        }
        this.lineArtCtx.putImageData(imgData, 0, 0);

        URL.revokeObjectURL(url);
        resolve();
      };

      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };

      img.src = url;
    });
  }

  private computeLineArtMask(): void {
    const imgData = this.lineArtCtx.getImageData(0, 0, this.canvasSize, this.canvasSize);
    const data = imgData.data;
    const len = this.canvasSize * this.canvasSize;
    const rawMask = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      const idx = i * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      // If opaque/semi-opaque and sufficiently dark (lum < 210), treat as line border
      if (a > 60 && (0.299 * r + 0.587 * g + 0.114 * b) < 210) {
        rawMask[i] = 1;
      } else {
        rawMask[i] = 0;
      }
    }

    // Morphological micro-gap and diagonal seal pass
    // This bridges 1-2 pixel micro-gaps and diagonal touches,
    // ensuring flood fill never bleeds between distinct objects.
    const width = this.canvasSize;
    const height = this.canvasSize;

    for (let y = 0; y < height; y++) {
      const yOffset = y * width;
      for (let x = 0; x < width; x++) {
        const idx = yOffset + x;
        if (rawMask[idx] === 1) {
          this.lineArtMask[idx] = 1;
          continue;
        }

        const left = x > 0 && rawMask[idx - 1] === 1;
        const right = x < width - 1 && rawMask[idx + 1] === 1;
        const up = y > 0 && rawMask[idx - width] === 1;
        const down = y < height - 1 && rawMask[idx + width] === 1;

        // Bridge 1px micro-gaps horizontally or vertically
        const hGap = left && right;
        const vGap = up && down;

        // Bridge diagonal corners so 4-connected scanline fill cannot slip diagonally
        const diagCorner = (left && up) || (right && up) || (left && down) || (right && down);

        // Bridge 2px micro-gaps
        const left2 = x > 1 && rawMask[idx - 2] === 1;
        const right2 = x < width - 2 && rawMask[idx + 2] === 1;
        const up2 = y > 1 && rawMask[idx - width * 2] === 1;
        const down2 = y < height - 2 && rawMask[idx + width * 2] === 1;
        const hGap2 = (left && right2) || (left2 && right);
        const vGap2 = (up && down2) || (up2 && down);

        if (hGap || vGap || diagCorner || hGap2 || vGap2) {
          this.lineArtMask[idx] = 1;
        } else {
          this.lineArtMask[idx] = 0;
        }
      }
    }
  }

  /**
   * Executes flood fill at given display canvas coordinates.
   */
  public fillAtScreenPoint(clientX: number, clientY: number): boolean {
    if (!this.currentPage) return false;

    // Convert display client coordinates to 1024x1024 native coordinates
    const nativeX = Math.floor((clientX - this.transform.offsetX) / this.transform.scale);
    const nativeY = Math.floor((clientY - this.transform.offsetY) / this.transform.scale);

    if (nativeX < 0 || nativeX >= this.canvasSize || nativeY < 0 || nativeY >= this.canvasSize) {
      return false; // Out of bounds
    }

    const colorImgData = this.colorCtx.getImageData(0, 0, this.canvasSize, this.canvasSize);

    // Save snapshot before mutating for undo
    this.history.pushSnapshot(colorImgData, {
      pageId: this.currentPage.id,
      x: nativeX,
      y: nativeY,
      color: this.currentColor,
      timestamp: Date.now()
    });

    const changed = scanlineFloodFill(
      colorImgData,
      this.lineArtMask,
      nativeX,
      nativeY,
      this.currentColor
    );

    if (changed) {
      this.colorCtx.putImageData(colorImgData, 0, 0);
      this.render();
      AudioManager.playFillSound();
      if (this.onFillChange) {
        this.onFillChange(this.history.getActions().length);
      }
      return true;
    }

    return false;
  }

  public undo(): void {
    const current = this.colorCtx.getImageData(0, 0, this.canvasSize, this.canvasSize);
    const prevState = this.history.undo(current);
    if (prevState) {
      this.colorCtx.putImageData(prevState, 0, 0);
      this.render();
      if (this.onFillChange) {
        this.onFillChange(this.history.getActions().length);
      }
    }
  }

  public redo(): void {
    const current = this.colorCtx.getImageData(0, 0, this.canvasSize, this.canvasSize);
    const nextState = this.history.redo(current);
    if (nextState) {
      this.colorCtx.putImageData(nextState, 0, 0);
      this.render();
      if (this.onFillChange) {
        this.onFillChange(this.history.getActions().length);
      }
    }
  }

  public resetCanvas(): void {
    if (!this.currentPage) return;
    this.history.clear();
    this.initColorCanvas();
    this.render();
    if (this.onFillChange) {
      this.onFillChange(0);
    }
  }

  /**
   * Main render loop compositing background, filled color layer, and crisp line-art.
   */
  public render(): void {
    const rect = this.displayCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    this.displayCtx.save();
    this.displayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Minimalist zen dark background around artwork
    this.displayCtx.fillStyle = '#0F1117';
    this.displayCtx.fillRect(0, 0, rect.width, rect.height);

    // Apply zoom & pan translation
    this.displayCtx.translate(this.transform.offsetX, this.transform.offsetY);
    this.displayCtx.scale(this.transform.scale, this.transform.scale);

    // Draw drop shadow behind paper canvas
    this.displayCtx.save();
    this.displayCtx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    this.displayCtx.shadowBlur = 35 / this.transform.scale;
    this.displayCtx.shadowOffsetY = 12 / this.transform.scale;
    this.displayCtx.fillStyle = '#FFFFFF';
    this.displayCtx.fillRect(0, 0, this.canvasSize, this.canvasSize);
    this.displayCtx.restore();

    // 1. Draw color layer
    this.displayCtx.drawImage(this.colorCanvas, 0, 0);

    // 2. Draw line-art layer on top (transparent background, only black lines)
    this.displayCtx.drawImage(this.lineArtCanvas, 0, 0);

    this.displayCtx.restore();
  }

  /**
   * Export high-resolution 1024x1024 finished artwork.
   */
  public exportImage(): string {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = this.canvasSize;
    exportCanvas.height = this.canvasSize;
    const exportCtx = exportCanvas.getContext('2d')!;

    // Paper background
    exportCtx.fillStyle = '#FFFFFF';
    exportCtx.fillRect(0, 0, this.canvasSize, this.canvasSize);

    // Composite color + line-art
    exportCtx.drawImage(this.colorCanvas, 0, 0);
    exportCtx.drawImage(this.lineArtCanvas, 0, 0);

    return exportCanvas.toDataURL('image/png');
  }

  private setupEventListeners(): void {
    const PAN_THRESHOLD = 7;
    let isMouseDown = false;
    let isActuallyPanning = false;
    let mouseDownPos = { x: 0, y: 0 };

    // Mouse events
    this.displayCanvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0 && e.button !== 1) return;
      isMouseDown = true;
      isActuallyPanning = false;
      mouseDownPos = { x: e.clientX, y: e.clientY };
      this.dragStart = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;

      const totalDist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);
      if (!isActuallyPanning && totalDist > PAN_THRESHOLD) {
        isActuallyPanning = true;
      }

      if (isActuallyPanning) {
        const dx = e.clientX - this.dragStart.x;
        const dy = e.clientY - this.dragStart.y;
        this.transform.offsetX += dx;
        this.transform.offsetY += dy;
        this.dragStart = { x: e.clientX, y: e.clientY };
        this.render();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (!isMouseDown) return;
      isMouseDown = false;

      const totalDist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);

      // If user did not pan past threshold, it's an intentional tap to fill!
      if (!isActuallyPanning && totalDist <= PAN_THRESHOLD) {
        const rect = this.displayCanvas.getBoundingClientRect();
        this.fillAtScreenPoint(e.clientX - rect.left, e.clientY - rect.top);
      }
    });

    // Mouse wheel zoom
    this.displayCanvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = this.displayCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      this.zoomToPoint(factor, mouseX, mouseY);
    }, { passive: false });

    // Touch events for mobile/tablet (pinch-to-zoom + pan + tap)
    let touchStartPos = { x: 0, y: 0 };
    let isTouchPanning = false;

    this.displayCanvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        this.activeTouchPointers.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
      }

      if (e.touches.length === 1) {
        const t = e.touches[0];
        touchStartPos = { x: t.clientX, y: t.clientY };
        this.dragStart = { x: t.clientX, y: t.clientY };
        isTouchPanning = false;
      } else if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        this.initialPinchDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        this.initialPinchScale = this.transform.scale;
        this.pinchCenter = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2
        };
      }
    }, { passive: false });

    this.displayCanvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        this.activeTouchPointers.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
      }

      if (e.touches.length === 1) {
        const t = e.touches[0];
        const totalDist = Math.hypot(t.clientX - touchStartPos.x, t.clientY - touchStartPos.y);
        if (!isTouchPanning && totalDist > 10) {
          isTouchPanning = true;
        }

        if (isTouchPanning) {
          const dx = t.clientX - this.dragStart.x;
          const dy = t.clientY - this.dragStart.y;
          this.transform.offsetX += dx;
          this.transform.offsetY += dy;
          this.dragStart = { x: t.clientX, y: t.clientY };
          this.render();
        }
      } else if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        if (this.initialPinchDistance > 0) {
          const factor = currentDist / this.initialPinchDistance;
          const rect = this.displayCanvas.getBoundingClientRect();
          this.zoomToPoint(factor * (this.initialPinchScale / this.transform.scale), this.pinchCenter.x - rect.left, this.pinchCenter.y - rect.top);
        }
      }
    }, { passive: false });

    this.displayCanvas.addEventListener('touchend', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        this.activeTouchPointers.delete(touch.identifier);
      }

      if (e.touches.length === 0 && !isTouchPanning) {
        const touch = e.changedTouches[0];
        const rect = this.displayCanvas.getBoundingClientRect();
        this.fillAtScreenPoint(touch.clientX - rect.left, touch.clientY - rect.top);
      }
    });
  }
}
