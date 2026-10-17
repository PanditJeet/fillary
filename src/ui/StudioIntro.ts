/**
 * Short "EasyBitz Studios" intro shown when the app starts.
 * Fades the studio logo in on black, holds briefly, then fades out.
 * Tapping skips it. Resolves when the intro has finished.
 */
export function showStudioIntro(): Promise<void> {
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
        resolve();
      }, 380);
    };

    el.addEventListener('click', finish);
    el.addEventListener('touchend', finish, { passive: true });

    // Fade in on next frame, hold, then fade out
    requestAnimationFrame(() => el.classList.add('studio-intro-in'));
    timers.push(window.setTimeout(finish, 1700));
  });
}
