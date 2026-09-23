import { FillAction } from '../engine/types.js';

const STORAGE_KEYS = {
  PAGE_PROGRESS_PREFIX: 'fillary_page_',
  RECENT_COLORS: 'fillary_recent_colors',
  ACTIVE_PALETTE: 'fillary_active_palette',
  ACTIVE_PAGE: 'fillary_active_page'
};

export class StorageManager {
  public static savePageProgress(pageId: string, actions: FillAction[]): void {
    try {
      localStorage.setItem(`${STORAGE_KEYS.PAGE_PROGRESS_PREFIX}${pageId}`, JSON.stringify(actions));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  public static loadPageProgress(pageId: string): FillAction[] {
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.PAGE_PROGRESS_PREFIX}${pageId}`);
      if (!data) return [];
      return JSON.parse(data) as FillAction[];
    } catch (e) {
      console.warn('Storage load failed:', e);
      return [];
    }
  }

  public static clearPageProgress(pageId: string): void {
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
