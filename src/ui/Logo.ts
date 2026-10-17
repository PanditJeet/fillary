/**
 * Fillary Brand Logo
 * Cartoon puppy with a splash of pink paint on its head, on a sky-blue rounded tile.
 * (Same artwork as the Android app icon.)
 */

const PUPPY_TILE_INNER = `<rect width="100" height="100" rx="22" fill="#7FD3F7"/><g transform="translate(6 6) scale(0.88)">
 
 <!-- ears (behind head) -->
 <path d="M24 30 C10 30, 6 52, 12 64 C16 72, 26 70, 28 60 C30 50, 32 38, 30 32 Z" fill="#B9773F" stroke="#2B2340" stroke-width="3.5" stroke-linejoin="round"/>
 <path d="M76 30 C90 30, 94 52, 88 64 C84 72, 74 70, 72 60 C70 50, 68 38, 70 32 Z" fill="#B9773F" stroke="#2B2340" stroke-width="3.5" stroke-linejoin="round"/>
 <!-- head -->
 <path d="M50 18 C72 18, 82 34, 80 52 C78 72, 66 84, 50 84 C34 84, 22 72, 20 52 C18 34, 28 18, 50 18 Z" fill="#F4C27D" stroke="#2B2340" stroke-width="3.5" stroke-linejoin="round"/>
 <!-- tuft -->
 <path d="M42 20 C44 12, 50 12, 50 18 C52 11, 59 13, 58 21" fill="#F4C27D" stroke="#2B2340" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
 <!-- muzzle -->
 <ellipse cx="50" cy="66" rx="17" ry="13" fill="#FFF3E2" stroke="#2B2340" stroke-width="3"/>
 <!-- eye patch -->
 <path d="M56 36 C66 33, 72 42, 69 50 C66 56, 57 55, 55 48 C54 43, 53 38, 56 36 Z" fill="#E3A35E"/>
 <!-- eyes -->
 <ellipse cx="38" cy="47" rx="5.2" ry="6.4" fill="#2B2340"/><ellipse cx="62" cy="47" rx="5.2" ry="6.4" fill="#2B2340"/>
 <circle cx="39.8" cy="44.6" r="2.1" fill="#fff"/><circle cx="63.8" cy="44.6" r="2.1" fill="#fff"/>
 <circle cx="36.6" cy="49.6" r="0.9" fill="#fff"/><circle cx="60.6" cy="49.6" r="0.9" fill="#fff"/>
 <!-- nose -->
 <path d="M44 59 Q50 55 56 59 Q55 64 50 65 Q45 64 44 59 Z" fill="#2B2340"/>
 <ellipse cx="48" cy="58.6" rx="2" ry="1" fill="#fff" opacity="0.7"/>
 <!-- mouth + tongue -->
 <path d="M50 65 L50 68 M43 68 Q46.5 72 50 68 Q53.5 72 57 68" fill="none" stroke="#2B2340" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M46.5 70.5 Q46 78 50 78.5 Q54 78 53.5 70.5 Q50 72.5 46.5 70.5 Z" fill="#FF7A93" stroke="#2B2340" stroke-width="2.4" stroke-linejoin="round"/>
 <!-- cheeks -->
 <ellipse cx="29" cy="60" rx="4" ry="2.5" fill="#FF8FB3" opacity="0.85"/><ellipse cx="71" cy="60" rx="4" ry="2.5" fill="#FF8FB3" opacity="0.85"/>
 
 <path d="M30 26 C34 16, 46 14, 52 18 C50 22, 52 26, 48 28 C46 33, 43 36, 41 32 C40 28, 36 30, 35 34 C34 38, 30 37, 30 33 Z" fill="#FF6FA1" stroke="#2B2340" stroke-width="3" stroke-linejoin="round"/>
 <ellipse cx="38" cy="22" rx="4" ry="1.6" fill="#fff" opacity="0.7" transform="rotate(-20 38 22)"/>
 <path d="M86 12 L88 17 L93 19 L88 21 L86 26 L84 21 L79 19 L84 17 Z" fill="#FFD23F" stroke="#2B2340" stroke-width="1.8" stroke-linejoin="round"/>
 <circle cx="10" cy="20" r="3.4" fill="#FFFFFF" stroke="#2B2340" stroke-width="1.8"/>
 <circle cx="91" cy="82" r="3" fill="#8BE08B" stroke="#2B2340" stroke-width="1.8"/>
</g>`;

export class Logo {
  /**
   * The logo mark: puppy on a sky-blue rounded tile.
   */
  public static getMarkSvg(size: number = 36): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="fillary-logo-mark" role="img" aria-label="Fillary">${PUPPY_TILE_INNER}</svg>`;
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
