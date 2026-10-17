/**
 * Short "EasyBitz Studios" intro shown when the app starts.
 * Fades the studio logo in on black, holds briefly, then fades out.
 * It always plays fully: touches are swallowed so they can't skip it or
 * reach the app underneath. Resolves when the intro has finished.
 */
/** True while the studio intro is on screen (the Back button is ignored meanwhile). */
export let studioIntroActive = false;

export function showStudioIntro(): Promise<void> {
  studioIntroActive = true;
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = 'studio-intro';
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', 'EasyBitz Studios');
    el.innerHTML = '<img class="studio-intro-logo" src="/brand/easybitz-lockup.png" alt="EasyBitz Studios" />';
    document.body.appendChild(el);

    let finished = false;
    const timers: number[] = [];
    const finish = () => {
      if (finished) return;
      finished = true;
      timers.forEach(t => window.clearTimeout(t));
      el.classList.add('studio-intro-out');
      window.setTimeout(() => {
        el.remove();
        studioIntroActive = false;
        resolve();
      }, 380);
    };

    // Swallow all touches/clicks while the intro is showing
    const block = (e: Event) => { e.preventDefault(); e.stopPropagation(); };
    for (const type of ['click', 'touchstart', 'touchmove', 'touchend', 'pointerdown', 'pointermove', 'pointerup', 'mousedown', 'mouseup', 'contextmenu', 'wheel']) {
      el.addEventListener(type, block, { passive: false });
    }

    // Fade in on next frame, hold, then fade out
    requestAnimationFrame(() => el.classList.add('studio-intro-in'));
    timers.push(window.setTimeout(finish, 1700));
  });
}
