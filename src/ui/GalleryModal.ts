import { PAGES, ANIMAL_PAGES, MYSTICAL_PAGES } from '../pages/pageCatalog.js';
import { HUMAN_CARTOON_PAGES } from '../pages/humanCartoons.js';
import { PageMetadata } from '../engine/types.js';

export class GalleryModal {
  private overlay: HTMLElement;
  private onSelectPage: (page: PageMetadata) => void;
  private activeCategory: string = 'All';

  constructor(onSelectPage: (page: PageMetadata) => void) {
    this.onSelectPage = onSelectPage;
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.render();
    this.setupListeners();
  }

  public getActiveCategory(): string {
    return this.activeCategory;
  }

  public getElement(): HTMLElement {
    return this.overlay;
  }

  public open(): void {
    this.overlay.classList.add('open');
  }

  public close(): void {
    this.overlay.classList.remove('open');
  }

  private render(): void {
    this.overlay.innerHTML = `
      <div class="gallery-modal">
        <div class="gallery-modal-header">
          <div class="gallery-title-group">
            <h2>Art Gallery</h2>
            <p>Select a hand-crafted relaxing line-art canvas</p>
          </div>
          <button class="btn-icon" id="btn-close-gallery" title="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Collection Category Filter Tabs -->
        <div class="gallery-filter-tabs">
          <button class="gallery-filter-btn active" data-cat="All">All (${PAGES.length})</button>
          <button class="gallery-filter-btn" data-cat="Animals">Animals (${ANIMAL_PAGES.length})</button>
          <button class="gallery-filter-btn" data-cat="Human Cartoons">Human Cartoons (${HUMAN_CARTOON_PAGES.length})</button>
          <button class="gallery-filter-btn" data-cat="Mystical">Mystical (${MYSTICAL_PAGES.length})</button>
        </div>

        <div class="gallery-grid" id="gallery-grid-cards">
          ${PAGES.map(page => `
            <div class="gallery-card" data-page-id="${page.id}" data-category="${page.category}">
              <div class="gallery-thumb-container">
                ${page.imageUrl ? `<img src="${page.imageUrl}" alt="${page.title}" class="gallery-thumb-img" />` : (page.svgContent || '')}
              </div>
              <div class="gallery-card-info">
                <div class="gallery-card-meta">
                  <span class="gallery-card-cat">${page.category}</span>
                  <span class="gallery-card-diff">${page.difficulty}</span>
                </div>
                <h3 class="gallery-card-title">${page.title}</h3>
              </div>
            </div>
          `).join('')}

          <!-- Coming Soon Teaser Card -->
          <div class="gallery-coming-soon-card">
            <div class="coming-soon-badge">✨ Coming Soon</div>
            <h3 class="coming-soon-title">More Pages Added Weekly</h3>
            <p class="coming-soon-desc">We're illustrating new cute animals, fun human cartoon adventures, and magical wonders. Stay tuned for updates!</p>
          </div>
        </div>
      </div>
    `;
  }

  private filterCards(category: string): void {
    this.activeCategory = category;
    const cards = this.overlay.querySelectorAll<HTMLElement>('.gallery-card');
    cards.forEach(card => {
      const cardCat = card.getAttribute('data-category');
      if (category === 'All' || cardCat === category) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });

    const filterBtns = this.overlay.querySelectorAll('.gallery-filter-btn');
    filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-cat') === category);
    });
  }

  private setupListeners(): void {
    this.overlay.querySelector('#btn-close-gallery')?.addEventListener('click', () => {
      this.close();
    });

    // Close on clicking backdrop outside modal
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Category Filter Clicks
    this.overlay.querySelector('.gallery-filter-tabs')?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.gallery-filter-btn');
      if (!btn) return;
      const cat = btn.getAttribute('data-cat');
      if (cat) {
        this.filterCards(cat);
      }
    });

    // Page selection
    this.overlay.querySelector('#gallery-grid-cards')?.addEventListener('click', (e) => {
      const card = (e.target as HTMLElement).closest('.gallery-card');
      if (!card) return;

      const pageId = card.getAttribute('data-page-id');
      const page = PAGES.find(p => p.id === pageId);
      if (page) {
        this.onSelectPage(page);
        this.close();
      }
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay.classList.contains('open')) {
        this.close();
      }
    });
  }
}
