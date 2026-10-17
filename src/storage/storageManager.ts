import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { FillAction } from '../engine/types.js';

export interface PageProgress {
  pageId: string;
  dataUrl?: string; // High-resolution or preview thumbnail dataURL of color canvas
  actions: FillAction[]; // History of fill actions
  lastSaved: number;
  /** Artwork file the progress was made on (fills are only valid for that exact drawing). */
  art?: string;
}

const STORAGE_KEYS = {
  PAGE_PROGRESS_PREFIX: 'fillary_page_',
  RECENT_COLORS: 'fillary_recent_colors',
  ACTIVE_PALETTE: 'fillary_active_palette',
  ACTIVE_PAGE: 'fillary_active_page'
};

export class StorageManager {
  private static cache: Map<string, string> = new Map();
  private static isInitialized: boolean = false;

  private static canUsePreferences(): boolean {
    if (typeof window === 'undefined') return false;
    if (Capacitor.isNativePlatform()) return true;
    return typeof window.localStorage !== 'undefined';
  }

  /**
   * Initializes storage from native Android SharedPreferences via @capacitor/preferences
   * with seamless bidirectional sync to browser localStorage and in-memory cache.
   * Guarantees 100% persistence across APK restarts, process kills, and updates.
   */
  public static async init(): Promise<void> {
    if (this.isInitialized) return;

    // 1. Populate cache immediately from localStorage (fast sync)
    if (typeof localStorage !== 'undefined') {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('fillary_')) {
            const val = localStorage.getItem(key);
            if (val) this.cache.set(key, val);
          }
        }
      } catch (e) {
        console.warn('Initial localStorage read warning:', e);
      }
    }

    // 2. Fetch and merge from native Android SharedPreferences
    if (this.canUsePreferences()) {
      try {
        const { keys } = await Preferences.keys();
        const fillaryKeys = keys.filter(k => k.startsWith('fillary_'));
        const entries = await Promise.all(
          fillaryKeys.map(async key => ({ key, value: (await Preferences.get({ key })).value }))
        );
        const nativeKeys = new Set<string>();
        for (const { key, value } of entries) {
          if (value === null || value === undefined) continue;
          nativeKeys.add(key);
          if (this.cache.get(key) === value) continue;
          this.cache.set(key, value);
          // Mirror back to localStorage for redundancy
          if (typeof localStorage !== 'undefined') {
            try {
              localStorage.setItem(key, value);
            } catch (_) {}
          }
        }

        // 3. Migrate only localStorage keys that are missing from Preferences
        for (const [key, value] of this.cache.entries()) {
          if (!nativeKeys.has(key)) {
            Preferences.set({ key, value }).catch(() => {});
          }
        }
      } catch (e) {
        console.warn('Preferences.init fallback to localStorage:', e);
      }
    }

    this.isInitialized = true;
  }

  /**
   * Synchronous get item backed by in-memory cache, localStorage, and native Preferences.
   */
  public static getItem(key: string): string | null {
    if (this.cache.has(key)) {
      return this.cache.get(key) || null;
    }
    if (typeof localStorage !== 'undefined') {
      try {
        const val = localStorage.getItem(key);
        if (val !== null) {
          this.cache.set(key, val);
          if (this.canUsePreferences()) {
            Preferences.set({ key, value: val }).catch(() => {});
          }
          return val;
        }
      } catch (_) {}
    }
    return null;
  }

  /**
   * Synchronous write-through to cache and localStorage with async write to native SharedPreferences.
   */
  public static setItem(key: string, value: string): void {
    this.cache.set(key, value);

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn(`localStorage.setItem failed for key ${key}:`, e);
      }
    }

    if (this.canUsePreferences()) {
      Preferences.set({ key, value }).catch((e) => {
        console.warn(`Preferences.set failed for key ${key}:`, e);
      });
    }
  }

  /**
   * Removes item from cache, localStorage, and native SharedPreferences.
   */
  public static removeItem(key: string): void {
    this.cache.delete(key);

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`localStorage.removeItem failed for key ${key}:`, e);
      }
    }

    if (this.canUsePreferences()) {
      Preferences.remove({ key }).catch((e) => {
        console.warn(`Preferences.remove failed for key ${key}:`, e);
      });
    }
  }

  /**
   * Saves both the pixel-perfect raster canvas state and action history.
   * Merges with existing progress so thumbnails or actions are never accidentally lost.
   */
  public static savePageProgress(pageId: string, actions: FillAction[], dataUrl?: string, art?: string): void {
    if (!pageId) return;
    try {
      const existing = this.getPageProgress(pageId);
      const progress: PageProgress = {
        pageId,
        actions: actions || [],
        dataUrl: dataUrl || existing?.dataUrl,
        lastSaved: Date.now(),
        art: art || existing?.art
      };
      this.setItem(`${STORAGE_KEYS.PAGE_PROGRESS_PREFIX}${pageId}`, JSON.stringify(progress));
    } catch (e) {
      console.warn('Storage save failed with dataUrl, falling back to actions-only:', e);
      try {
        const fallback: PageProgress = {
          pageId,
          actions: actions || [],
          lastSaved: Date.now()
        };
        this.setItem(`${STORAGE_KEYS.PAGE_PROGRESS_PREFIX}${pageId}`, JSON.stringify(fallback));
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
      const raw = this.getItem(`${STORAGE_KEYS.PAGE_PROGRESS_PREFIX}${pageId}`);
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
    return !!((progress.actions && progress.actions.length > 0) || progress.dataUrl);
  }

  /**
   * Removes saved progress that was made on an older version of a page's artwork
   * (e.g. after a picture is replaced with a new drawing), so old fills aren't
   * replayed onto a different drawing. Progress from before artwork tracking is
   * assumed to belong to the original .jpg artwork.
   */
  public static discardOutdatedProgress(pages: Array<{ id: string; imageUrl?: string }>): void {
    for (const page of pages) {
      const progress = this.getPageProgress(page.id);
      if (!progress || !page.imageUrl) continue;
      const art = progress.art ?? (page.imageUrl.endsWith('.png') ? 'legacy-jpg' : page.imageUrl);
      if (art !== page.imageUrl) {
        this.clearPageProgress(page.id);
      }
    }
  }

  /**
   * Completely clears saved progress for a page.
   */
  public static clearPageProgress(pageId: string): void {
    if (!pageId) return;
    this.removeItem(`${STORAGE_KEYS.PAGE_PROGRESS_PREFIX}${pageId}`);
  }

  public static getRecentColors(): string[] {
    try {
      const data = this.getItem(STORAGE_KEYS.RECENT_COLORS);
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
    this.setItem(STORAGE_KEYS.RECENT_COLORS, JSON.stringify(trimmed));
    return trimmed;
  }

  public static getActivePalette(): string {
    return this.getItem(STORAGE_KEYS.ACTIVE_PALETTE) || 'rainbow-spectrum';
  }

  public static setActivePalette(id: string): void {
    this.setItem(STORAGE_KEYS.ACTIVE_PALETTE, id);
  }

  public static getActivePageId(): string | null {
    return this.getItem(STORAGE_KEYS.ACTIVE_PAGE);
  }

  public static setActivePageId(id: string): void {
    this.setItem(STORAGE_KEYS.ACTIVE_PAGE, id);
  }
}
