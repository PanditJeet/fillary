/**
 * Fillary Brand Logo Component
 * Minimalist geometric mark representing fluid color fill, mindfulness, and relaxation.
 */

export class Logo {
  /**
   * Generates the standalone icon mark (droplet-prism with gold ring accent).
   */
  public static getMarkSvg(size: number = 36): string {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="fillary-logo-mark">
        <defs>
          <linearGradient id="logo-grad-primary" x1="20" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#E2B168" />
            <stop offset="50%" stop-color="#E07A5F" />
            <stop offset="100%" stop-color="#81B29A" />
          </linearGradient>
          <linearGradient id="logo-ring-grad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="rgba(226, 177, 104, 0.6)" />
            <stop offset="100%" stop-color="rgba(129, 178, 154, 0.2)" />
          </linearGradient>
          <filter id="logo-soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Outer Minimalist Orbital Ring -->
        <circle cx="50" cy="50" r="44" stroke="url(#logo-ring-grad)" stroke-width="2.5" stroke-dasharray="18 6" opacity="0.85" />

        <!-- Zen Center Droplet / Lotus Petal Shape -->
        <g filter="url(#logo-soft-glow)">
          <!-- Left Petal: Sage/Teal -->
          <path d="M 50 20 C 32 36, 26 56, 38 72 C 43 78, 48 81, 50 82 C 46 72, 44 52, 50 20 Z" fill="#81B29A" opacity="0.9" />
          <!-- Right Petal: Coral -->
          <path d="M 50 20 C 68 36, 74 56, 62 72 C 57 78, 52 81, 50 82 C 54 72, 56 52, 50 20 Z" fill="#E07A5F" opacity="0.9" />
          <!-- Center Lotus Bloom: Gold Core -->
          <path d="M 50 24 C 44 42, 44 64, 50 78 C 56 64, 56 42, 50 24 Z" fill="#E2B168" />
          <!-- Radiant Gold Droplet Crown -->
          <circle cx="50" cy="20" r="4.5" fill="#E2B168" />
        </g>
      </svg>
    `.trim();
  }

  /**
   * Generates full brand lockup: Logo Mark + Typographic Title + Optional Subtitle.
   */
  public static getBrandLockup(options: { markSize?: number; showSubtitle?: boolean } = {}): string {
    const { markSize = 36, showSubtitle = true } = options;
    return `
      <div class="fillary-brand-lockup">
        <div class="fillary-brand-icon">
          ${Logo.getMarkSvg(markSize)}
        </div>
        <div class="fillary-brand-text">
          <span class="fillary-brand-name">FILLARY</span>
          ${showSubtitle ? '<span class="fillary-brand-tagline">Mindful Coloring</span>' : ''}
        </div>
      </div>
    `.trim();
  }
}
