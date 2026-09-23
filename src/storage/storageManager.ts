import { FillAction } from '../engine/types.js';

export interface PageProgress {
  pageId: string;
  dataUrl?: string; // High-resolution dataURL of color canvas
  actions: FillAction[]; // History of fill actions
  lastSaved: number;
}

const STORAGE_KEYS = {
  PAGE_PROGRESS_PREFIX: 'fillary_page_',
  RECENT_COLORS: 'fillary_recent_colors',
  ACTIVE_PALETTE: 'fillary_active_palette',
  ACTIVE_PAGE: 'fillary_active_page'
};

export class StorageManager {
  /**
   * Saves both the pixel-perfect raster canvas state and action history.
   */
  public static savePageProgress(pageId: string, actions: FillAction[], dataUrl?: string): void {
    if (!pageId) return;
    try {
      const progress: PageProgress = {
        pageId,
        actions: actions || [],
        dataUrl,
        lastSaved: Date.now()
      };
      localStorage.setItem(`${STORAGE_KEYS.PAGE_PROGRESS_PREFIX}${pageId}`, JSON.stringify(progress));
    } catch (e) {
      console.warn('Storage save failed with dataUrl, falling back to actions-only:', e);
      // If quota exceeded due to dataUrl, fallback to storing actions only
      try {
        const fallback: PageProgress = {
          pageId,
          actions: actions || [],
          lastSaved: Date.now()
        };
        localStorage.setItem(`${STORAGE_KEYS.PAGE_PROGRESS_PREFIX}${pageId}`, JSON.stringify(fallback));
      } catch (inner) {
        console.error('Critical storage save failure:', inner);
      }
    }
  }

  /**
   * Retrieves full page progress including raster snapshot and action list.
   * Handles both new PageProgress format and legacy FillAction[] arrays.
   */
  public static getPageProgress(pageId: string): PageProgress | null {
    if (!pageId) return null;
    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.PAGE_PROGRESS_PREFIX}${pageId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Legacy format: raw array of FillAction
        return {
          pageId,
          actions: parsed,
          lastSaved: Date.now()
        };
      }
      return parsed as PageProgress;
    } catch (e) {
      console.warn('Storage load failed for page:', pageId, e);
      return null;
    }
  }

  /**
   * Returns list of actions for backward-compatibility.
   */
  public static loadPageProgress(pageId: string): FillAction[] {
    const progress = this.getPageProgress(pageId);
    return progress ? progress.actions : [];
  }

  /**
   * Checks if page has saved progress.
   */
  public static hasPageProgress(pageId: string): boolean {
    const progress = this.getPageProgress(pageId);
    if (!progress) return false;
    return !!progress.dataUrl || (progress.actions && progress.actions.length > 0);
  }

  /**
   * Completely clears saved progress for a page.
   */
  public static clearPageProgress(pageId: string): void {
    if (!pageId) return;
    try {
      localStorage.removeItem(`${STORAGE_KEYS.PAGE_PROGRESS_PREFIX}${pageId}`);
    } catch (e) {
      console.warn('Storage clear failed:', e);
    }
  }

  public static getRecentColors(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECENT_COLORS);
      if (!data) {
        return ['#FFD600', '#FF1744', '#00E676', '#00B0FF', '#FF9100', '#D500F9'];
      }
      return JSON.parse(data) as string[];
    } catch {
      return ['#FFD600', '#FF1744', '#00E676', '#00B0FF', '#FF9100', '#D500F9'];
    }
  }

  public static addRecentColor(color: string): string[] {
    const list = this.getRecentColors().filter(c => c.toLowerCase() !== color.toLowerCase());
    list.unshift(color.toUpperCase());
    const trimmed = list.slice(0, 10);
    try {
      localStorage.setItem(STORAGE_KEYS.RECENT_COLORS, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Failed saving recent colors:', e);
    }
    return trimmed;
  }

  public static getActivePalette(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PALETTE) || 'rainbow-spectrum';
  }

  public static setActivePalette(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PALETTE, id);
    } catch (e) {
      console.warn('Failed saving active palette:', e);
    }
  }

  public static getActivePageId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PAGE);
  }

  public static setActivePageId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PAGE, id);
    } catch (e) {
      console.warn('Failed saving active page:', e);
    }
  }
}
