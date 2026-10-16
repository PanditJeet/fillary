import { Capacitor, registerPlugin } from '@capacitor/core';

interface FillaryExportPlugin {
  saveImage(options: { base64: string; fileName: string; share?: boolean }): Promise<{
    savedToGallery: boolean;
    shareOpened: boolean;
  }>;
}

// Native implementation lives in android/app/src/main/java/com/fillary/app/FillaryExportPlugin.java
const FillaryExport = registerPlugin<FillaryExportPlugin>('FillaryExport');

export type ExportResult = 'saved' | 'shared' | 'downloaded' | 'cancelled' | 'failed';

/**
 * Saves / shares a PNG data URL.
 * - Android app: saves to the gallery (Pictures/Fillary) and opens the share sheet.
 * - Browser: Web Share API where available, otherwise a file download.
 */
export async function exportPng(dataUrl: string, fileName: string, title: string): Promise<ExportResult> {
  if (Capacitor.isNativePlatform()) {
    try {
      const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
      const res = await FillaryExport.saveImage({ base64, fileName, share: true });
      if (res.savedToGallery) return 'saved';
      return res.shareOpened ? 'shared' : 'failed';
    } catch (err) {
      console.warn('[Export] Native export failed:', err);
      return 'failed';
    }
  }

  // Web Share API (mobile browsers)
  if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function') {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], fileName, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Fillary — ${title}`,
          text: 'Colored with Fillary'
        });
        return 'shared';
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return 'cancelled';
      console.warn('[Export] Web Share failed, falling back to download:', err);
    }
  }

  // Desktop browser download
  try {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => link.remove(), 100);
    return 'downloaded';
  } catch (e) {
    console.error('[Export] Download failed:', e);
    return 'failed';
  }
}
