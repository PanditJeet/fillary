import { PageMetadata } from '../engine/types.js';
import { PAGES } from '../pages/pageCatalog.js';
import { StorageManager } from '../storage/storageManager.js';
import { Logo } from './Logo.js';

export class HomePage {
  private element: HTMLElement;
  private onStartStudio: (page?: PageMetadata) => void;
  private currentFilter: string = 'All';

  constructor(onStartStudio: (page?: PageMetadata) => void) {
    this.onStartStudio = onStartStudio;
    this.element = document.createElement('div');
    this.element.className = 'home-page';
    this.render();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public refresh(): void {
    this.render();
  }

  private render(): void {
    const activePageId = StorageManager.getActivePageId();
    const activePage = PAGES.find(p => p.id === activePageId) || PAGES[0];
    const savedActions = StorageManager.loadPageProgress(activePage.id);

    const categories = ['All', 'Animals', 'Human Cartoons', 'Mystical'];
    const filteredPages = this.currentFilter === 'All' 
      ? PAGES 
      : PAGES.filter(p => p.category === this.currentFilter);

    this.element.innerHTML = `
      <!-- Top Navigation Bar -->
      <nav class="home-nav">
        <div class="home-nav-brand">
          ${Logo.getBrandLockup({ markSize: 32, showSubtitle: true })}
        </div>
        <div class="home-nav-actions">
          <span class="home-badge-count">${PAGES.length} Zen Canvases</span>
          <button class="btn-primary-pill" id="home-nav-studio-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
              <path d="M2 2l7.586 7.586"></path>
              <circle cx="11" cy="11" r="2"></circle>
            </svg>
            <span>Open Studio</span>
          </button>
        </div>
      </nav>

      <!-- Main Home Scroll Container -->
      <div class="home-scroll-container">
        <!-- Hero Section -->
        <section class="home-hero">
          <div class="hero-glow-backdrop"></div>
          
          <div class="hero-logo-emblem">
            ${Logo.getMarkSvg(76)}
          </div>

          <h1 class="hero-title">Mindful Coloring &amp; Pure Relaxation</h1>
          <p class="hero-subtitle">
            An ultra-minimalist digital coloring sanctuary. High-precision zero-bleed fills, 
            soothing palettes, and hand-curated art designed to calm your mind.
          </p>

          <div class="hero-cta-group">
            <button class="hero-btn-primary" id="hero-continue-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>${savedActions.length > 0 ? 'Continue Coloring' : 'Start Coloring'}</span>
            </button>

            <button class="hero-btn-secondary" id="hero-browse-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Browse Canvases (${PAGES.length})</span>
            </button>
          </div>

          <!-- Active Artwork Quick Resume Card -->
          <div class="home-active-card" id="home-active-card">
            <div class="active-card-thumb">
              ${activePage.imageUrl 
                ? `<img src="${activePage.imageUrl}" alt="${activePage.title}" />` 
                : `<div class="active-svg-wrap">${activePage.svgContent || ''}</div>`
              }
            </div>
            <div class="active-card-details">
              <div class="active-card-meta">
                <span class="active-card-tag">In Progress</span>
                <span class="active-card-cat">${activePage.category}</span>
              </div>
              <h3 class="active-card-title">${activePage.title}</h3>
              <p class="active-card-info">${savedActions.length > 0 ? `${savedActions.length} color fills applied` : 'Ready to begin'}</p>
            </div>
            <button class="btn-primary-pill" id="home-resume-btn">
              <span>Resume</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </section>

        <!-- Collections Showcase Section -->
        <section class="home-collections-section" id="collections-section">
          <div class="collections-header">
            <div class="collections-title-group">
              <h2 class="collections-heading">Curated Coloring Canvases</h2>
              <p class="collections-subheading">Select any artwork below to launch directly into the coloring studio.</p>
            </div>

            <!-- Category Filter Tabs -->
            <div class="home-filter-tabs">
              ${categories.map(cat => `
                <button class="home-filter-btn ${cat === this.currentFilter ? 'active' : ''}" data-cat="${cat}">
                  ${cat} ${cat === 'All' ? `(${PAGES.length})` : `(${PAGES.filter(p => p.category === cat).length})`}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Canvases Grid -->
          <div class="home-pages-grid">
            ${filteredPages.map(page => `
              <div class="home-page-card" data-page-id="${page.id}">
                <div class="home-card-thumb">
                  ${page.imageUrl 
                    ? `<img src="${page.imageUrl}" alt="${page.title}" loading="lazy" />` 
                    : `<div class="home-svg-wrap">${page.svgContent || ''}</div>`
                  }
                  <div class="home-card-hover-overlay">
                    <span class="overlay-color-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                      Color Now
                    </span>
                  </div>
                </div>
                <div class="home-card-info">
                  <div class="home-card-meta">
                    <span class="home-card-cat">${page.category}</span>
                    <span class="home-card-diff">${page.difficulty}</span>
                  </div>
                  <h4 class="home-card-title">${page.title}</h4>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Zen Philosophy & Features -->
        <section class="home-features-section">
          <div class="feature-pill-card">
            <div class="feature-icon">✨</div>
            <div class="feature-text">
              <h4>Zero-Bleed Scanline Fill</h4>
              <p>Instant pixel-perfect 32-bit flood fill with dual-layer edge isolation.</p>
            </div>
          </div>

          <div class="feature-pill-card">
            <div class="feature-icon">🎨</div>
            <div class="feature-text">
              <h4>24 Harmonic Palettes</h4>
              <p>Curated pastel, jewel, and earth tones for effortless color harmony.</p>
            </div>
          </div>

          <div class="feature-pill-card">
            <div class="feature-icon">↺</div>
            <div class="feature-text">
              <h4>Infinite History</h4>
              <p>Full undo and redo freedom for completely anxiety-free coloring.</p>
            </div>
          </div>

          <div class="feature-pill-card">
            <div class="feature-icon">💾</div>
            <div class="feature-text">
              <h4>Automatic Auto-Save</h4>
              <p>Your work is safely saved in local storage with crisp PNG exports.</p>
            </div>
          </div>
        </section>

        <!-- Minimalist Footer -->
        <footer class="home-footer">
          <div class="footer-brand">
            ${Logo.getBrandLockup({ markSize: 26, showSubtitle: true })}
          </div>
          <p class="footer-copy">Designed for mindfulness, creativity, and inner calm.</p>
        </footer>
      </div>
    `;

    this.bindEvents(activePage);
  }

  private bindEvents(activePage: PageMetadata): void {
    // Nav Open Studio
    const navStudioBtn = this.element.querySelector('#home-nav-studio-btn');
    navStudioBtn?.addEventListener('click', () => {
      this.onStartStudio(activePage);
    });

    // Hero Continue / Start button
    const heroContinueBtn = this.element.querySelector('#hero-continue-btn');
    heroContinueBtn?.addEventListener('click', () => {
      this.onStartStudio(activePage);
    });

    // Hero Resume card button
    const resumeBtn = this.element.querySelector('#home-resume-btn');
    resumeBtn?.addEventListener('click', () => {
      this.onStartStudio(activePage);
    });

    // Active Card click
    const activeCard = this.element.querySelector('#home-active-card');
    activeCard?.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('#home-resume-btn')) return;
      this.onStartStudio(activePage);
    });

    // Hero Browse Canvases button (smooth scroll down)
    const browseBtn = this.element.querySelector('#hero-browse-btn');
    browseBtn?.addEventListener('click', () => {
      const target = this.element.querySelector('#collections-section');
      target?.scrollIntoView({ behavior: 'smooth' });
    });

    // Filter Buttons
    const filterBtns = this.element.querySelectorAll('.home-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cat = (e.currentTarget as HTMLElement).getAttribute('data-cat') || 'All';
        this.currentFilter = cat;
        this.render();
        // Keep scroll position on collections section
        const target = this.element.querySelector('#collections-section');
        target?.scrollIntoView({ behavior: 'instant' });
      });
    });

    // Individual Page Cards
    const pageCards = this.element.querySelectorAll('.home-page-card');
    pageCards.forEach(card => {
      card.addEventListener('click', () => {
        const pageId = card.getAttribute('data-page-id');
        const page = PAGES.find(p => p.id === pageId);
        if (page) {
          this.onStartStudio(page);
        }
      });
    });
  }
}
