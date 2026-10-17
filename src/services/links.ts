import { Capacitor } from '@capacitor/core';

/** Opens an external web page in the phone's browser (or a new tab on the web). */
export function openExternal(url: string): void {
  if (Capacitor.isNativePlatform()) {
    // Capacitor hands navigation to other hosts over to the system browser
    window.location.href = url;
  } else {
    window.open(url, '_blank', 'noopener');
  }
}
