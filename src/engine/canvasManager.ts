import { PageMetadata, Point, ViewportTransform } from './types.js';
import { floodFillDiff, hexToPacked, TinyRegion } from './floodFill.js';
import { HistoryManager, HistoryEntry } from './history.js';
import { AudioManager } from '../audio/audioManager.js';
import { PageProgress } from '../storage/storageManager.js';

const MAX_ZOOM = 6.0;
/** Minimum number of on-screen pixels of the artwork that must stay visible while panning. */
const MIN_VISIBLE_PX = 80;

export class CanvasManager {
  private displayCanvas: HTMLCanvasElement;
  private displayCtx: CanvasRenderingContext2D;

  private colorCanvas: HTMLCanvasElement;
  private colorCtx: CanvasRenderingContext2D;

  private lineArtCanvas: HTMLCanvasElement;
  private lineArtCtx: CanvasRenderingContext2D;

  private canvasSize: number = 1024;
  /** Pixels that block the fill (visible lines + invisible gap seals). */
  private lineArtMask: Uint8Array = new Uint8Array(1024 * 1024);
  /** Invisible gap-seal pixels: block the fill but get colored alongside the adjacent area. */
  private gapMask: Uint8Array = new Uint8Array(1024 * 1024);
  /** Tiny untappable pockets between strokes, colored together with the area they border. */
  private tinyRegions: TinyRegion[] = [];

  /** Source of truth for the color layer (avoids getImageData on every tap). */
  private colorData: ImageData;
  private color32: Uint32Array;
  private readonly whitePacked = hexToPacked('#FFFFFF');

  private transform: ViewportTransform = { scale: 1, offsetX: 0, offsetY: 0 };
  private fitScale = 1;
  private userAdjustedView = false;
  private dragStart: Point = { x: 0, y: 0 };
  private lastClientWidth = 0;
  private lastClientHeight = 0;

  // Touch tracking for pinch-to-zoom
  private activeTouchPointers: Map<number, Point> = new Map();
  private initialPinchDistance: number = 0;
  private initialPinchScale: number = 1;
  private pinchCenter: Point = { x: 0, y: 0 };

  private currentColor: string = '#E07A5F';
  private currentPage: PageMetadata | null = null;
  private loadToken = 0;
  public history: HistoryManager = new HistoryManager();

  private onTransformChange?: (scale: number) => void;
  private onFillChange?: (actionCount: number) => void;

  constructor(displayCanvas: HTMLCanvasElement) {
    this.displayCanvas = displayCanvas;
    this.displayCtx = displayCanvas.getContext('2d', { alpha: false })!;

    // Offscreen color layer
    this.colorCanvas = document.createElement('canvas');
    this.colorCanvas.width = this.canvasSize;
    this.colorCanvas.height = this.canvasSize;
    this.colorCtx = this.colorCanvas.getContext('2d', { willReadFrequently: true })!;

    // Offscreen line-art layer
    this.lineArtCanvas = document.createElement('canvas');
    this.lineArtCanvas.width = this.canvasSize;
    this.lineArtCanvas.height = this.canvasSize;
    this.lineArtCtx = this.lineArtCanvas.getContext('2d', { willReadFrequently: true })!;

    this.colorData = new ImageData(this.canvasSize, this.canvasSize);
    this.color32 = new Uint32Array(this.colorData.data.buffer);

    this.initColorCanvas();
    this.setupEventListeners();
    this.handleResize();

    const onResizeHandler = (forceFit = false) => {
      const changed = this.handleResize();
      if (!changed) return;
      if (forceFit || !this.userAdjustedView) {
        this.fitToScreen();
      } else {
        this.clampTransform();
        this.render();
      }
    };

    window.addEventListener('resize', () => onResizeHandler());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => onResizeHandler(true), 100);
    });

    // Automatically observe parent resize / visibility changes
    if (this.displayCanvas.parentElement && window.ResizeObserver) {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
            onResizeHandler();
          }
        }
      });
      ro.observe(this.displayCanvas.parentElement);
    }
  }

  private initColorCanvas(): void {
    this.color32.fill(this.whitePacked);
    this.flushColorLayer();
  }

  private flushColorLayer(): void {
    this.colorCtx.putImageData(this.colorData, 0, 0);
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

  public getCurrentPage(): PageMetadata | null {
    return this.currentPage;
  }

  public getColorCanvasDataUrl(): string {
    return this.colorCanvas.toDataURL('image/png');
  }

  public getThumbnailDataUrl(maxDim = 256): string {
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = maxDim;
    thumbCanvas.height = maxDim;
    const ctx = thumbCanvas.getContext('2d');
    if (!ctx) return '';
    ctx.drawImage(this.colorCanvas, 0, 0, maxDim, maxDim);
    return thumbCanvas.toDataURL('image/jpeg', 0.82);
  }

  public getHasFills(): boolean {
    return this.history.actionCount > 0;
  }

  public handleResize(): boolean {
    const parent = this.displayCanvas.parentElement;
    if (!parent) return false;

    const width = parent.clientWidth;
    const height = parent.clientHeight;
    if (width <= 0 || height <= 0) return false;

    if (Math.abs(width - this.lastClientWidth) < 2 && Math.abs(height - this.lastClientHeight) < 2) {
      return false; // No significant dimension change
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const targetW = Math.round(width * dpr);
    const targetH = Math.round(height * dpr);

    this.lastClientWidth = width;
    this.lastClientHeight = height;

    if (this.displayCanvas.width !== targetW || this.displayCanvas.height !== targetH) {
      this.displayCanvas.width = targetW;
      this.displayCanvas.height = targetH;
      this.displayCanvas.style.width = `${width}px`;
      this.displayCanvas.style.height = `${height}px`;
    }

    this.render();
    return true;
  }

  /**
   * Reset zoom and center the canvas in the display viewport.
   * Adapts insets for portrait, landscape, mobile, and tablets
   * so the floating header and bottom palette dock don't cover the artwork.
   */
  public fitToScreen(): void {
    const parent = this.displayCanvas.parentElement;
    if (!parent) return;

    const viewW = parent.clientWidth;
    const viewH = parent.clientHeight;
    if (viewW <= 0 || viewH <= 0) return;

    let topInset = 70;
    let bottomInset = 160;
    let sideInset = 24;

    const isLandscape = viewW > viewH;
    const isCompactHeight = viewH < 620;

    if (isLandscape && isCompactHeight) {
      topInset = 42;
      bottomInset = 66;
      sideInset = 14;
    } else if (viewW <= 640) {
      topInset = 50;
      bottomInset = 150;
      sideInset = 10;
    } else if (isLandscape) {
      topInset = 76;
      bottomInset = 150;
      sideInset = 32;
    }

    const availableW = Math.max(viewW - sideInset * 2, 80);
    const availableH = Math.max(viewH - topInset - bottomInset, 80);

    const scale = Math.max(Math.min(availableW / this.canvasSize, availableH / this.canvasSize, 1.0), 0.1);
    const offsetX = (viewW - this.canvasSize * scale) / 2;
    const offsetY = topInset + (availableH - this.canvasSize * scale) / 2;

    this.fitScale = scale;
    this.userAdjustedView = false;
    this.transform = { scale, offsetX, offsetY };
    this.notifyTransform();
    this.render();
  }

  /** Smallest allowed zoom: a bit below the fitted size, so zoom-out always zooms out. */
  private get minScale(): number {
    return Math.min(0.4, this.fitScale * 0.75);
  }

  public zoomIn(): void {
    this.zoomToPoint(1.25, this.displayCanvas.clientWidth / 2, this.displayCanvas.clientHeight / 2);
  }

  public zoomOut(): void {
    this.zoomToPoint(0.8, this.displayCanvas.clientWidth / 2, this.displayCanvas.clientHeight / 2);
  }

  private zoomToPoint(factor: number, clientX: number, clientY: number): void {
    if (isNaN(clientX) || isNaN(clientY)) {
      clientX = this.displayCanvas.clientWidth / 2 || 0;
      clientY = this.displayCanvas.clientHeight / 2 || 0;
    }
    const currentScale = this.transform.scale > 0 ? this.transform.scale : 1.0;
    const newScale = Math.min(Math.max(currentScale * factor, this.minScale), MAX_ZOOM);
    const ratio = newScale / currentScale;

    this.transform.offsetX = clientX - (clientX - this.transform.offsetX) * ratio;
    this.transform.offsetY = clientY - (clientY - this.transform.offsetY) * ratio;
    this.transform.scale = newScale;
    this.userAdjustedView = true;

    this.clampTransform();
    this.notifyTransform();
    this.render();
  }

  private panBy(dx: number, dy: number): void {
    this.transform.offsetX += dx;
    this.transform.offsetY += dy;
    this.userAdjustedView = true;
    this.clampTransform();
    this.render();
  }

  /** Keeps at least part of the artwork on screen so it can't be panned out of reach. */
  private clampTransform(): void {
    const viewW = this.displayCanvas.clientWidth;
    const viewH = this.displayCanvas.clientHeight;
    if (viewW <= 0 || viewH <= 0) return;
    const size = this.canvasSize * this.transform.scale;
    const margin = Math.min(MIN_VISIBLE_PX, size);
    this.transform.offsetX = Math.min(Math.max(this.transform.offsetX, margin - size), viewW - margin);
    this.transform.offsetY = Math.min(Math.max(this.transform.offsetY, margin - size), viewH - margin);
  }

  private notifyTransform(): void {
    if (this.onTransformChange) {
      this.onTransformChange(Math.round(this.transform.scale * 100));
    }
  }

  /**
   * Loads a line-art page, creates boundary mask, and restores any saved progress.
   * Returns false if a newer loadPage call superseded this one.
   * Throws if the page artwork could not be loaded.
   */
  public async loadPage(
    page: PageMetadata,
    savedData?: PageProgress | Array<{ x: number; y: number; color: string }> | null
  ): Promise<boolean> {
    const token = ++this.loadToken;

    // Load line-art into a temporary canvas first, so a slower earlier load can't overwrite a newer page
    const art = page.imageUrl
      ? await this.loadImageFileAsLineArt(page.imageUrl)
      : page.svgContent
        ? await this.loadSvgAsLineArt(page.svgContent)
        : null;

    if (token !== this.loadToken) return false;

    this.currentPage = page;
    this.history.clear();
    this.color32.fill(this.whitePacked);

    this.lineArtCtx.clearRect(0, 0, this.canvasSize, this.canvasSize);
    if (art) {
      this.lineArtCtx.putImageData(art, 0, 0);
    }

    this.computeLineArtMask();

    // Restore saved progress if present
    if (savedData) {
      const isProgressObj = typeof savedData === 'object' && !Array.isArray(savedData) && 'pageId' in savedData;
      const progress = isProgressObj ? (savedData as PageProgress) : null;
      const actions = isProgressObj ? progress!.actions : (savedData as Array<{ x: number; y: number; color: string }>);

      if (actions && actions.length > 0) {
        // Replay fills in order to rebuild the artwork and its undo history
        for (const act of actions) {
          const action = {
            pageId: page.id,
            x: act.x,
            y: act.y,
            color: act.color,
            timestamp: (act as { timestamp?: number }).timestamp || Date.now()
          };
          const diff = floodFillDiff(
            this.color32, this.canvasSize, this.canvasSize,
            this.lineArtMask, act.x, act.y, hexToPacked(act.color), this.gapMask, this.tinyRegions
          );
          if (diff) {
            this.history.push({ ...diff, action }, false);
          }
          // Fills that change nothing on replay are dropped (they were no-ops)
        }
        this.history.notify();
      } else if (progress && progress.dataUrl) {
        // Legacy raster-only save: draw it as the starting point (not undoable)
        this.flushColorLayer();
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            this.colorCtx.drawImage(img, 0, 0, this.canvasSize, this.canvasSize);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = progress.dataUrl!;
        });
        if (token !== this.loadToken) return false;
        const loaded = this.colorCtx.getImageData(0, 0, this.canvasSize, this.canvasSize);
        this.colorData.data.set(loaded.data);
      }
    }

    this.flushColorLayer();
    this.fitToScreen();
    this.render();
    return true;
  }

  private drawToTempCanvas(img: CanvasImageSource): ImageData {
    const tmp = document.createElement('canvas');
    tmp.width = this.canvasSize;
    tmp.height = this.canvasSize;
    const ctx = tmp.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0, this.canvasSize, this.canvasSize);
    return ctx.getImageData(0, 0, this.canvasSize, this.canvasSize);
  }

  private loadImageFileAsLineArt(url: string): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (url.startsWith('http://') || url.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = () => {
        // Convert light/white background pixels to transparent so colors underneath show through.
        // Keep linework bold and solid.
        const imgData = this.drawToTempCanvas(img);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          if (lum > 225) {
            d[i + 3] = 0;
          } else {
            d[i] = 18;
            d[i + 1] = 18;
            d[i + 2] = 18;
            d[i + 3] = 255;
          }
        }
        resolve(imgData);
      };

      img.onerror = () => reject(new Error(`Could not load artwork: ${url}`));
      img.src = url;
    });
  }

  private loadSvgAsLineArt(svgString: string): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        const imgData = this.drawToTempCanvas(img);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i] > 225 && d[i + 1] > 225 && d[i + 2] > 225) {
            d[i + 3] = 0;
          }
        }
        URL.revokeObjectURL(url);
        resolve(imgData);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Could not load SVG artwork'));
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
      const a = data[idx + 3];
      // Opaque/semi-opaque and sufficiently dark (lum <= 225) = visible line
      if (a > 50 && (0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]) <= 225) {
        rawMask[i] = 1;
      }
    }

    // Morphological micro-gap and diagonal seal pass.
    // Bridges 1-3 pixel gaps and diagonal steps so the fill never leaks between distinct objects.
    // Bridged pixels go into gapMask: they block the fill but are colored together with the area they touch.
    const width = this.canvasSize;
    const height = this.canvasSize;

    for (let y = 0; y < height; y++) {
      const yOffset = y * width;
      for (let x = 0; x < width; x++) {
        const idx = yOffset + x;
        if (rawMask[idx] === 1) {
          this.lineArtMask[idx] = 1;
          this.gapMask[idx] = 0;
          continue;
        }

        const left = x > 0 && rawMask[idx - 1] === 1;
        const right = x < width - 1 && rawMask[idx + 1] === 1;
        const up = y > 0 && rawMask[idx - width] === 1;
        const down = y < height - 1 && rawMask[idx + width] === 1;

        const hGap = left && right;
        const vGap = up && down;
        const diagCorner = (left && up) || (right && up) || (left && down) || (right && down);

        const diag1 = (x > 0 && y > 0 && rawMask[idx - width - 1] === 1) && (x < width - 1 && y < height - 1 && rawMask[idx + width + 1] === 1);
        const diag2 = (x < width - 1 && y > 0 && rawMask[idx - width + 1] === 1) && (x > 0 && y < height - 1 && rawMask[idx + width - 1] === 1);

        const left2 = x > 1 && rawMask[idx - 2] === 1;
        const right2 = x < width - 2 && rawMask[idx + 2] === 1;
        const up2 = y > 1 && rawMask[idx - width * 2] === 1;
        const down2 = y < height - 2 && rawMask[idx + width * 2] === 1;
        const hGap2 = (left && right2) || (left2 && right);
        const vGap2 = (up && down2) || (up2 && down);

        const left3 = x > 2 && rawMask[idx - 3] === 1;
        const right3 = x < width - 3 && rawMask[idx + 3] === 1;
        const up3 = y > 2 && rawMask[idx - width * 3] === 1;
        const down3 = y < height - 3 && rawMask[idx + width * 3] === 1;
        const hGap3 = (left && right3) || (left2 && right2) || (left3 && right);
        const vGap3 = (up && down3) || (up2 && down2) || (up3 && down);

        const sealed = hGap || vGap || diagCorner || diag1 || diag2 || hGap2 || vGap2 || hGap3 || vGap3;
        this.lineArtMask[idx] = sealed ? 1 : 0;
        this.gapMask[idx] = sealed ? 1 : 0;
      }
    }

    this.computeTinyRegions();
  }

  /**
   * Finds tiny enclosed pockets (≤ TINY_MAX_AREA px) — typically slivers where thin strokes
   * meet or pockets created by gap sealing — and links each to the large area it borders
   * across a thin line (≤ TINY_MAX_LINE px). Filling that area then colors the pocket too,
   * so no white specks are left behind. Pockets behind thick outlines (e.g. eye highlights)
   * are not linked and stay as they are.
   */
  private computeTinyRegions(): void {
    const TINY_MAX_AREA = 80;
    const TINY_MAX_LINE = 5;
    const W = this.canvasSize, N = W * W, mask = this.lineArtMask;

    // 1. Label fillable regions (4-connected)
    const labels = new Int32Array(N);
    const areas: number[] = [0];
    const stack = new Int32Array(N);
    let count = 0;
    for (let i = 0; i < N; i++) {
      if (mask[i] || labels[i]) continue;
      count++;
      let sp = 0, area = 0;
      stack[sp++] = i;
      labels[i] = count;
      while (sp > 0) {
        const p = stack[--sp];
        area++;
        const x = p % W;
        if (x > 0 && !mask[p - 1] && !labels[p - 1]) { labels[p - 1] = count; stack[sp++] = p - 1; }
        if (x < W - 1 && !mask[p + 1] && !labels[p + 1]) { labels[p + 1] = count; stack[sp++] = p + 1; }
        if (p >= W && !mask[p - W] && !labels[p - W]) { labels[p - W] = count; stack[sp++] = p - W; }
        if (p < N - W && !mask[p + W] && !labels[p + W]) { labels[p + W] = count; stack[sp++] = p + W; }
      }
      areas.push(area);
    }

    // 2. Collect pixels of tiny regions
    const tinyPixels = new Map<number, number[]>();
    for (let i = 0; i < N; i++) {
      const l = labels[i];
      if (l && areas[l] <= TINY_MAX_AREA) {
        let arr = tinyPixels.get(l);
        if (!arr) { arr = []; tinyPixels.set(l, arr); }
        arr.push(i);
      }
    }

    // 3. For each tiny region, search outward through line pixels for the nearest large region
    const result: TinyRegion[] = [];
    const seen = new Uint32Array(N); // visit stamp per tiny region
    let stamp = 0;
    for (const [, pixels] of tinyPixels) {
      stamp++;
      let frontier: number[] = [];
      for (const p of pixels) { seen[p] = stamp; frontier.push(p); }
      const votes = new Map<number, { n: number; anchor: number }>();
      for (let depth = 0; depth < TINY_MAX_LINE + 1 && votes.size === 0 && frontier.length; depth++) {
        const next: number[] = [];
        for (const p of frontier) {
          const x = p % W;
          const nbs = [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, p >= W ? p - W : -1, p < N - W ? p + W : -1];
          for (const q of nbs) {
            if (q < 0 || seen[q] === stamp) continue;
            seen[q] = stamp;
            const l = labels[q];
            if (l && areas[l] > TINY_MAX_AREA) {
              const v = votes.get(l);
              if (v) v.n++; else votes.set(l, { n: 1, anchor: q });
            } else if (mask[q]) {
              next.push(q); // keep walking through the line
            }
          }
        }
        frontier = next;
      }
      if (votes.size === 0) continue;
      let best: { n: number; anchor: number } | null = null;
      for (const v of votes.values()) if (!best || v.n > best.n) best = v;
      result.push({ anchor: best!.anchor, pixels: Uint32Array.from(pixels) });
    }
    this.tinyRegions = result;
  }

  /**
   * Executes flood fill at given display canvas coordinates.
   */
  public fillAtScreenPoint(clientX: number, clientY: number): boolean {
    if (!this.currentPage) return false;

    const nativeX = Math.floor((clientX - this.transform.offsetX) / this.transform.scale);
    const nativeY = Math.floor((clientY - this.transform.offsetY) / this.transform.scale);

    if (nativeX < 0 || nativeX >= this.canvasSize || nativeY < 0 || nativeY >= this.canvasSize) {
      return false;
    }

    const diff = floodFillDiff(
      this.color32, this.canvasSize, this.canvasSize,
      this.lineArtMask, nativeX, nativeY, hexToPacked(this.currentColor), this.gapMask, this.tinyRegions
    );

    // Taps on lines or same-colored areas change nothing and create no undo step
    if (!diff) return false;

    this.history.push({
      ...diff,
      action: {
        pageId: this.currentPage.id,
        x: nativeX,
        y: nativeY,
        color: this.currentColor,
        timestamp: Date.now()
      }
    });

    this.flushColorLayer();
    this.render();
    AudioManager.playFillSound();
    this.onFillChange?.(this.history.actionCount);
    return true;
  }

  private applyEntry(entry: HistoryEntry, revert: boolean): void {
    const { indices, before, after } = entry;
    const c = this.color32;
    if (revert) {
      for (let k = 0; k < indices.length; k++) c[indices[k]] = before[k];
    } else {
      for (let k = 0; k < indices.length; k++) c[indices[k]] = after;
    }
    this.flushColorLayer();
    this.render();
    this.onFillChange?.(this.history.actionCount);
  }

  public undo(): void {
    const entry = this.history.undo();
    if (entry) this.applyEntry(entry, true);
  }

  public redo(): void {
    const entry = this.history.redo();
    if (entry) this.applyEntry(entry, false);
  }

  public resetCanvas(): void {
    if (!this.currentPage) return;
    this.history.clear();
    this.initColorCanvas();
    this.render();
    this.onFillChange?.(0);
  }

  /**
   * Main render loop compositing background, filled color layer, and crisp line-art.
   */
  public render(): void {
    const rect = this.displayCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    this.displayCtx.save();
    this.displayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.displayCtx.fillStyle = '#0F1117';
    this.displayCtx.fillRect(0, 0, rect.width, rect.height);

    this.displayCtx.translate(this.transform.offsetX, this.transform.offsetY);
    this.displayCtx.scale(this.transform.scale, this.transform.scale);

    // Drop shadow behind paper canvas
    this.displayCtx.save();
    this.displayCtx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    this.displayCtx.shadowBlur = 35 / this.transform.scale;
    this.displayCtx.shadowOffsetY = 12 / this.transform.scale;
    this.displayCtx.fillStyle = '#FFFFFF';
    this.displayCtx.fillRect(0, 0, this.canvasSize, this.canvasSize);
    this.displayCtx.restore();

    this.displayCtx.drawImage(this.colorCanvas, 0, 0);
    this.displayCtx.drawImage(this.lineArtCanvas, 0, 0);

    this.displayCtx.restore();
  }

  /**
   * Export the finished 1024x1024 artwork as a PNG data URL.
   */
  public exportImage(): string {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = this.canvasSize;
    exportCanvas.height = this.canvasSize;
    const exportCtx = exportCanvas.getContext('2d')!;

    exportCtx.fillStyle = '#FFFFFF';
    exportCtx.fillRect(0, 0, this.canvasSize, this.canvasSize);
    exportCtx.drawImage(this.colorCanvas, 0, 0);
    exportCtx.drawImage(this.lineArtCanvas, 0, 0);

    return exportCanvas.toDataURL('image/png');
  }

  private setupEventListeners(): void {
    const PAN_THRESHOLD = 7;
    let isMouseDown = false;
    let isActuallyPanning = false;
    let mouseButton = 0;
    let mouseDownPos = { x: 0, y: 0 };

    // Mouse events
    this.displayCanvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0 && e.button !== 1) return;
      if (e.button === 1) e.preventDefault();
      isMouseDown = true;
      isActuallyPanning = false;
      mouseButton = e.button;
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
        this.dragStart = { x: e.clientX, y: e.clientY };
        this.panBy(dx, dy);
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (!isMouseDown) return;
      isMouseDown = false;

      const totalDist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);

      // Left-click without dragging = fill (middle button only pans)
      if (mouseButton === 0 && !isActuallyPanning && totalDist <= PAN_THRESHOLD) {
        const rect = this.displayCanvas.getBoundingClientRect();
        this.fillAtScreenPoint(e.clientX - rect.left, e.clientY - rect.top);
      }
    });

    // Mouse wheel zoom
    this.displayCanvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = this.displayCanvas.getBoundingClientRect();
      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      this.zoomToPoint(factor, e.clientX - rect.left, e.clientY - rect.top);
    }, { passive: false });

    // Touch events for mobile/tablet (pinch-to-zoom + pan + tap)
    let touchStartPos = { x: 0, y: 0 };
    let isTouchPanning = false;
    let wasMultiTouch = false;

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
        wasMultiTouch = false;
      } else if (e.touches.length >= 2) {
        wasMultiTouch = true;
        isTouchPanning = true;
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        this.initialPinchDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        this.initialPinchScale = this.transform.scale;
        this.pinchCenter = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2
        };
        this.dragStart = { x: this.pinchCenter.x, y: this.pinchCenter.y };
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
        if (wasMultiTouch) {
          // Continuing pan after lifting one of the two fingers
          const dx = t.clientX - this.dragStart.x;
          const dy = t.clientY - this.dragStart.y;
          this.dragStart = { x: t.clientX, y: t.clientY };
          this.panBy(dx, dy);
        } else {
          const totalDist = Math.hypot(t.clientX - touchStartPos.x, t.clientY - touchStartPos.y);
          if (!isTouchPanning && totalDist > 10) {
            isTouchPanning = true;
          }

          if (isTouchPanning) {
            const dx = t.clientX - this.dragStart.x;
            const dy = t.clientY - this.dragStart.y;
            this.dragStart = { x: t.clientX, y: t.clientY };
            this.panBy(dx, dy);
          }
        }
      } else if (e.touches.length >= 2) {
        wasMultiTouch = true;
        isTouchPanning = true;

        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentCenter = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2
        };

        // Two-finger pan
        const dx = currentCenter.x - this.dragStart.x;
        const dy = currentCenter.y - this.dragStart.y;
        this.transform.offsetX += dx;
        this.transform.offsetY += dy;
        this.dragStart = currentCenter;

        // Two-finger pinch zoom
        const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        if (this.initialPinchDistance > 0 && currentDist > 0) {
          const factor = currentDist / this.initialPinchDistance;
          const rect = this.displayCanvas.getBoundingClientRect();
          this.zoomToPoint(
            factor * (this.initialPinchScale / this.transform.scale),
            currentCenter.x - rect.left,
            currentCenter.y - rect.top
          );
        } else {
          this.panBy(0, 0);
        }
      }
    }, { passive: false });

    this.displayCanvas.addEventListener('touchend', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        this.activeTouchPointers.delete(touch.identifier);
      }

      if (e.touches.length === 1) {
        // One finger remains down: keep multi-touch flag so lifting it won't trigger a fill
        const remaining = e.touches[0];
        this.dragStart = { x: remaining.clientX, y: remaining.clientY };
      } else if (e.touches.length === 0) {
        if (!isTouchPanning && !wasMultiTouch) {
          const touch = e.changedTouches[0];
          const rect = this.displayCanvas.getBoundingClientRect();
          this.fillAtScreenPoint(touch.clientX - rect.left, touch.clientY - rect.top);
        }
        isTouchPanning = false;
        wasMultiTouch = false;
        this.initialPinchDistance = 0;
      }
    });

    this.displayCanvas.addEventListener('touchcancel', () => {
      this.activeTouchPointers.clear();
      isTouchPanning = false;
      wasMultiTouch = false;
      this.initialPinchDistance = 0;
    });
  }
}
