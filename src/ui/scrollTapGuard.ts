/**
 * Stops a scroll from opening a picture: if the finger moved more than a few pixels
 * between touching and lifting, the resulting "click" inside a scrolling list is ignored.
 * (Some Android WebViews still send a click after a short drag.)
 */
const MOVE_TOLERANCE_PX = 10;
const SCROLL_AREAS = '.home-scroll-container, .gallery-grid, .modal-overlay';

let startX = 0;
let startY = 0;
let moved = false;
let startScroll: Element | null = null;
let startScrollTop = 0;

export function installScrollTapGuard(): void {
  window.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    startY = e.clientY;
    moved = false;
    startScroll = (e.target as Element | null)?.closest?.(SCROLL_AREAS) ?? null;
    startScrollTop = startScroll ? startScroll.scrollTop : 0;
  }, { capture: true, passive: true });

  window.addEventListener('pointermove', (e) => {
    if (!moved && Math.hypot(e.clientX - startX, e.clientY - startY) > MOVE_TOLERANCE_PX) moved = true;
  }, { capture: true, passive: true });

  window.addEventListener('click', (e) => {
    const area = (e.target as Element | null)?.closest?.(SCROLL_AREAS);
    if (!area) return;
    const scrolled = startScroll === area && Math.abs(area.scrollTop - startScrollTop) > 2;
    if (moved || scrolled) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }, { capture: true });
}
