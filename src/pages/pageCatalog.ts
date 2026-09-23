import { PageMetadata } from '../engine/types.js';

// Generator for Sacred Lotus Mandala with perfectly closed concentric petals & rings
function generateLotusMandalaSvg(): string {
  const cx = 512;
  const cy = 512;
  let paths = '';

  // Outer concentric boundary rings
  paths += `<circle cx="${cx}" cy="${cy}" r="480" stroke="#111111" stroke-width="6" fill="none" />`;
  paths += `<circle cx="${cx}" cy="${cy}" r="455" stroke="#111111" stroke-width="3" fill="none" />`;
  paths += `<circle cx="${cx}" cy="${cy}" r="440" stroke="#111111" stroke-width="4" fill="none" />`;

  // Outer ray beads (24 beads)
  for (let i = 0; i < 24; i++) {
    const angle = (i * 360) / 24;
    const rad = (angle * Math.PI) / 180;
    const bx = cx + Math.cos(rad) * 448;
    const by = cy + Math.sin(rad) * 448;
    paths += `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="6" stroke="#111111" stroke-width="3" fill="none" />`;
  }

  // Outer petal tier (16 petals)
  for (let i = 0; i < 16; i++) {
    const a1 = (i * 360) / 16;
    const a2 = ((i + 1) * 360) / 16;
    const aMid = (a1 + a2) / 2;

    const rBase = 320;
    const rTip = 440;

    const x1 = cx + Math.cos((a1 * Math.PI) / 180) * rBase;
    const y1 = cy + Math.sin((a1 * Math.PI) / 180) * rBase;
    const x2 = cx + Math.cos((a2 * Math.PI) / 180) * rBase;
    const y2 = cy + Math.sin((a2 * Math.PI) / 180) * rBase;
    const tipX = cx + Math.cos((aMid * Math.PI) / 180) * rTip;
    const tipY = cy + Math.sin((aMid * Math.PI) / 180) * rTip;

    const ctrl1X = cx + Math.cos(((aMid - 4) * Math.PI) / 180) * (rTip * 0.9);
    const ctrl1Y = cy + Math.sin(((aMid - 4) * Math.PI) / 180) * (rTip * 0.9);
    const ctrl2X = cx + Math.cos(((aMid + 4) * Math.PI) / 180) * (rTip * 0.9);
    const ctrl2Y = cy + Math.sin(((aMid + 4) * Math.PI) / 180) * (rTip * 0.9);

    paths += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${ctrl1X.toFixed(1)} ${ctrl1Y.toFixed(1)} ${tipX.toFixed(1)} ${tipY.toFixed(1)} Q ${ctrl2X.toFixed(1)} ${ctrl2Y.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} Z" stroke="#111111" stroke-width="4" fill="none" />`;
  }

  // Mid ring boundary
  paths += `<circle cx="${cx}" cy="${cy}" r="320" stroke="#111111" stroke-width="4" fill="none" />`;
  paths += `<circle cx="${cx}" cy="${cy}" r="260" stroke="#111111" stroke-width="3" fill="none" />`;

  // Secondary Petal Tier (12 petals)
  for (let i = 0; i < 12; i++) {
    const a1 = (i * 360) / 12;
    const a2 = ((i + 1) * 360) / 12;
    const aMid = (a1 + a2) / 2;

    const rBase = 180;
    const rTip = 260;

    const x1 = cx + Math.cos((a1 * Math.PI) / 180) * rBase;
    const y1 = cy + Math.sin((a1 * Math.PI) / 180) * rBase;
    const x2 = cx + Math.cos((a2 * Math.PI) / 180) * rBase;
    const y2 = cy + Math.sin((a2 * Math.PI) / 180) * rBase;
    const tipX = cx + Math.cos((aMid * Math.PI) / 180) * rTip;
    const tipY = cy + Math.sin((aMid * Math.PI) / 180) * rTip;

    paths += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx} ${cy} ${tipX.toFixed(1)} ${tipY.toFixed(1)} Q ${x2.toFixed(1)} ${y2.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} Z" stroke="#111111" stroke-width="3.5" fill="none" />`;
  }

  // Inner Core Ring
  paths += `<circle cx="${cx}" cy="${cy}" r="180" stroke="#111111" stroke-width="4" fill="none" />`;
  paths += `<circle cx="${cx}" cy="${cy}" r="120" stroke="#111111" stroke-width="3" fill="none" />`;
  paths += `<circle cx="${cx}" cy="${cy}" r="60" stroke="#111111" stroke-width="4" fill="none" />`;

  // Core Flower (8 Petals)
  for (let i = 0; i < 8; i++) {
    const a1 = (i * 360) / 8;
    const a2 = ((i + 1) * 360) / 8;
    const aMid = (a1 + a2) / 2;

    const tipX = cx + Math.cos((aMid * Math.PI) / 180) * 120;
    const tipY = cy + Math.sin((aMid * Math.PI) / 180) * 120;
    const baseX1 = cx + Math.cos((a1 * Math.PI) / 180) * 60;
    const baseY1 = cy + Math.sin((a1 * Math.PI) / 180) * 60;
    const baseX2 = cx + Math.cos((a2 * Math.PI) / 180) * 60;
    const baseY2 = cy + Math.sin((a2 * Math.PI) / 180) * 60;

    paths += `<path d="M ${baseX1.toFixed(1)} ${baseY1.toFixed(1)} Q ${tipX.toFixed(1)} ${tipY.toFixed(1)} ${baseX2.toFixed(1)} ${baseY2.toFixed(1)} Z" stroke="#111111" stroke-width="3.5" fill="none" />`;
  }

  // Very center gem
  paths += `<circle cx="${cx}" cy="${cy}" r="22" stroke="#111111" stroke-width="4" fill="none" />`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <rect width="1024" height="1024" fill="#FFFFFF"/>
    ${paths}
  </svg>`;
}

// Generator for Japanese Zen Bonsai & Moon
function generateBonsaiSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <rect width="1024" height="1024" fill="#FFFFFF"/>
    <!-- Outer Arch Frame -->
    <rect x="60" y="60" width="904" height="904" rx="40" stroke="#111111" stroke-width="6" fill="none"/>
    <rect x="85" y="85" width="854" height="854" rx="28" stroke="#111111" stroke-width="3" fill="none"/>

    <!-- Crescent Sun/Moon in Background -->
    <circle cx="512" cy="340" r="180" stroke="#111111" stroke-width="4" fill="none"/>
    <circle cx="560" cy="320" r="160" stroke="#111111" stroke-width="3" fill="none"/>

    <!-- Mountain Silhouettes -->
    <path d="M 85 750 L 320 540 L 480 670 L 680 490 L 939 720 L 939 939 L 85 939 Z" stroke="#111111" stroke-width="4" fill="none"/>
    <path d="M 220 630 L 320 540 L 400 600" stroke="#111111" stroke-width="3" fill="none"/>
    <path d="M 580 570 L 680 490 L 780 570" stroke="#111111" stroke-width="3" fill="none"/>

    <!-- Bonsai Pot -->
    <path d="M 280 810 L 744 810 L 710 880 L 314 880 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <rect x="250" y="790" width="524" height="20" rx="6" stroke="#111111" stroke-width="4" fill="none"/>
    <rect x="340" y="880" width="40" height="24" rx="4" stroke="#111111" stroke-width="3.5" fill="none"/>
    <rect x="644" y="880" width="40" height="24" rx="4" stroke="#111111" stroke-width="3.5" fill="none"/>

    <!-- Bonsai Trunk & Branches -->
    <path d="M 460 790 C 440 680, 360 620, 380 520 C 390 470, 470 420, 520 400 C 560 380, 600 340, 610 280 C 620 340, 570 400, 530 420 C 480 450, 420 490, 440 560 C 460 630, 540 690, 560 790 Z" stroke="#111111" stroke-width="4.5" fill="none"/>
    
    <!-- Left Branch -->
    <path d="M 390 530 C 320 510, 260 480, 230 450 C 260 460, 320 480, 380 500 Z" stroke="#111111" stroke-width="3.5" fill="none"/>
    <!-- Right Branch -->
    <path d="M 520 410 C 600 420, 680 460, 730 480 C 670 450, 590 430, 510 430 Z" stroke="#111111" stroke-width="3.5" fill="none"/>

    <!-- Foliage Clouds (Curved closed clusters) -->
    <!-- Top Cluster -->
    <path d="M 520 280 C 500 240, 560 210, 620 220 C 670 200, 720 230, 710 270 C 740 290, 720 340, 680 340 C 650 360, 580 360, 550 330 C 520 330, 500 300, 520 280 Z" stroke="#111111" stroke-width="4" fill="none"/>
    <!-- Left Cluster -->
    <path d="M 180 440 C 160 400, 210 370, 270 380 C 320 360, 360 390, 360 430 C 380 450, 360 490, 320 500 C 280 510, 230 500, 200 470 C 180 470, 170 450, 180 440 Z" stroke="#111111" stroke-width="4" fill="none"/>
    <!-- Right Cluster -->
    <path d="M 680 460 C 660 420, 720 390, 780 400 C 830 380, 880 410, 870 450 C 900 470, 880 520, 830 530 C 780 540, 730 530, 700 500 C 680 500, 670 470, 680 460 Z" stroke="#111111" stroke-width="4" fill="none"/>
    <!-- Lower Left Cluster -->
    <path d="M 300 550 C 280 520, 320 490, 370 500 C 410 490, 440 520, 430 550 C 450 570, 430 610, 390 610 C 350 620, 310 600, 310 570 Z" stroke="#111111" stroke-width="4" fill="none"/>
  </svg>`;
}

// Generator for Zen Origami Crane & Water
function generateOrigamiCraneSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <rect width="1024" height="1024" fill="#FFFFFF"/>
    <!-- Frame -->
    <rect x="60" y="60" width="904" height="904" rx="20" stroke="#111111" stroke-width="6" fill="none"/>

    <!-- Water Ripple Bands -->
    <path d="M 60 780 Q 280 720 512 780 T 964 780" stroke="#111111" stroke-width="4" fill="none"/>
    <path d="M 60 840 Q 280 800 512 840 T 964 840" stroke="#111111" stroke-width="4" fill="none"/>
    <path d="M 60 900 Q 280 870 512 900 T 964 900" stroke="#111111" stroke-width="4" fill="none"/>

    <!-- Water Lily Pad 1 -->
    <path d="M 120 820 C 120 770, 280 770, 320 810 L 250 825 L 320 840 C 280 880, 120 880, 120 820 Z" stroke="#111111" stroke-width="4" fill="none"/>
    <!-- Water Lily Pad 2 -->
    <path d="M 720 850 C 720 810, 880 810, 910 845 L 850 855 L 910 865 C 880 905, 720 905, 720 850 Z" stroke="#111111" stroke-width="4" fill="none"/>

    <!-- Geometric Origami Crane Facets -->
    <!-- Body Center -->
    <polygon points="512,500 440,650 512,700 584,650" stroke="#111111" stroke-width="4" fill="none"/>
    <!-- Breast -->
    <polygon points="512,500 440,650 410,540" stroke="#111111" stroke-width="4" fill="none"/>
    <!-- Tail Left -->
    <polygon points="512,700 440,650 360,760" stroke="#111111" stroke-width="4" fill="none"/>
    <polygon points="512,700 360,760 380,800 450,750" stroke="#111111" stroke-width="4" fill="none"/>

    <!-- Left Wing Raised -->
    <polygon points="512,500 410,540 240,240" stroke="#111111" stroke-width="4.5" fill="none"/>
    <polygon points="410,540 440,650 240,240" stroke="#111111" stroke-width="4" fill="none"/>
    <polygon points="240,240 180,290 410,540" stroke="#111111" stroke-width="4" fill="none"/>

    <!-- Right Wing Spread -->
    <polygon points="512,500 584,650 780,260" stroke="#111111" stroke-width="4.5" fill="none"/>
    <polygon points="512,500 780,260 840,320 584,650" stroke="#111111" stroke-width="4" fill="none"/>
    <polygon points="840,320 880,390 584,650" stroke="#111111" stroke-width="4" fill="none"/>

    <!-- Neck and Head -->
    <polygon points="410,540 512,500 620,380" stroke="#111111" stroke-width="4" fill="none"/>
    <polygon points="620,380 660,340 640,410" stroke="#111111" stroke-width="4" fill="none"/>
    <polygon points="660,340 730,350 670,370" stroke="#111111" stroke-width="4" fill="none"/>

    <!-- Sun Halo Behind Crane -->
    <circle cx="512" cy="420" r="300" stroke="#111111" stroke-width="4" fill="none"/>
    <circle cx="512" cy="420" r="340" stroke="#111111" stroke-width="3" fill="none"/>
  </svg>`;
}

// Generator for Lush Monstera & Tropical Botanical Flora
function generateBotanicalSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <rect width="1024" height="1024" fill="#FFFFFF"/>
    <!-- Outer Elegant Rounded Border -->
    <rect x="70" y="70" width="884" height="884" rx="40" stroke="#111111" stroke-width="6" fill="none"/>

    <!-- Central Monstera Stem -->
    <path d="M 512 954 C 500 750, 510 500, 520 180" stroke="#111111" stroke-width="7" fill="none"/>

    <!-- Left Segments (Monstera Leaf Ribs) -->
    <path d="M 512 250 C 430 200, 310 190, 220 250 C 270 290, 360 290, 512 330 Z" stroke="#111111" stroke-width="4.5" fill="none"/>
    <path d="M 512 360 C 380 320, 260 340, 170 420 C 220 460, 340 440, 512 450 Z" stroke="#111111" stroke-width="4.5" fill="none"/>
    <path d="M 512 480 C 370 450, 230 490, 160 590 C 220 620, 350 580, 512 570 Z" stroke="#111111" stroke-width="4.5" fill="none"/>
    <path d="M 512 600 C 380 590, 250 650, 210 750 C 280 770, 380 710, 512 690 Z" stroke="#111111" stroke-width="4.5" fill="none"/>
    <path d="M 512 720 C 410 730, 320 800, 290 870 C 360 880, 440 820, 512 800 Z" stroke="#111111" stroke-width="4.5" fill="none"/>

    <!-- Right Segments (Monstera Leaf Ribs) -->
    <path d="M 512 220 C 600 170, 720 170, 800 230 C 750 280, 650 280, 512 300 Z" stroke="#111111" stroke-width="4.5" fill="none"/>
    <path d="M 512 330 C 640 300, 760 320, 850 390 C 800 440, 680 430, 512 420 Z" stroke="#111111" stroke-width="4.5" fill="none"/>
    <path d="M 512 450 C 660 430, 790 470, 860 560 C 800 600, 680 570, 512 540 Z" stroke="#111111" stroke-width="4.5" fill="none"/>
    <path d="M 512 570 C 650 570, 770 630, 820 720 C 750 750, 650 700, 512 660 Z" stroke="#111111" stroke-width="4.5" fill="none"/>
    <path d="M 512 690 C 620 710, 710 780, 740 850 C 680 870, 590 820, 512 780 Z" stroke="#111111" stroke-width="4.5" fill="none"/>

    <!-- Top Leaf Apex -->
    <path d="M 520 180 C 490 120, 512 90, 512 90 C 512 90, 540 120, 520 180 Z" stroke="#111111" stroke-width="4.5" fill="none"/>

    <!-- Decorative Perforations (Fenestrations) inside leaf -->
    <ellipse cx="440" cy="380" rx="16" ry="38" transform="rotate(-20 440 380)" stroke="#111111" stroke-width="4" fill="none"/>
    <ellipse cx="580" cy="360" rx="16" ry="36" transform="rotate(20 580 360)" stroke="#111111" stroke-width="4" fill="none"/>
    <ellipse cx="420" cy="500" rx="18" ry="45" transform="rotate(-25 420 500)" stroke="#111111" stroke-width="4" fill="none"/>
    <ellipse cx="600" cy="480" rx="18" ry="42" transform="rotate(25 600 480)" stroke="#111111" stroke-width="4" fill="none"/>
    <ellipse cx="430" cy="620" rx="16" ry="35" transform="rotate(-20 430 620)" stroke="#111111" stroke-width="4" fill="none"/>
    <ellipse cx="590" cy="600" rx="16" ry="35" transform="rotate(20 590 600)" stroke="#111111" stroke-width="4" fill="none"/>
  </svg>`;
}

// Generator for Celestial Cosmic Sun & Moon
function generateCelestialSvg(): string {
  const cx = 512;
  const cy = 512;
  let rays = '';

  // 16 Radiating Celestial Sunbeams
  for (let i = 0; i < 16; i++) {
    const a1 = (i * 360) / 16;
    const a2 = ((i + 1) * 360) / 16;
    const aMid = (a1 + a2) / 2;

    const rInner = 280;
    const rOuter = (i % 2 === 0) ? 460 : 400;

    const x1 = cx + Math.cos((a1 * Math.PI) / 180) * rInner;
    const y1 = cy + Math.sin((a1 * Math.PI) / 180) * rInner;
    const x2 = cx + Math.cos((a2 * Math.PI) / 180) * rInner;
    const y2 = cy + Math.sin((a2 * Math.PI) / 180) * rInner;
    const tipX = cx + Math.cos((aMid * Math.PI) / 180) * rOuter;
    const tipY = cy + Math.sin((aMid * Math.PI) / 180) * rOuter;

    rays += `<polygon points="${x1.toFixed(1)},${y1.toFixed(1)} ${tipX.toFixed(1)},${tipY.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" stroke="#111111" stroke-width="4" fill="none" />`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <rect width="1024" height="1024" fill="#FFFFFF"/>
    <!-- Outer Frame -->
    <circle cx="512" cy="512" r="480" stroke="#111111" stroke-width="6" fill="none"/>
    <circle cx="512" cy="512" r="460" stroke="#111111" stroke-width="3" fill="none"/>

    <!-- Sun Rays -->
    ${rays}

    <!-- Central Ring Base -->
    <circle cx="512" cy="512" r="280" stroke="#111111" stroke-width="5" fill="none"/>
    <circle cx="512" cy="512" r="255" stroke="#111111" stroke-width="3" fill="none"/>

    <!-- Crescent Moon Silhouette on Left -->
    <path d="M 512 255 C 370 255, 255 370, 255 512 C 255 654, 370 769, 512 769 C 430 710, 380 620, 380 512 C 380 404, 430 314, 512 255 Z" stroke="#111111" stroke-width="5" fill="none"/>

    <!-- Sun Sleeping Face Profile / Stylized Features -->
    <path d="M 512 255 C 654 255, 769 370, 769 512 C 769 654, 654 769, 512 769" stroke="#111111" stroke-width="5" fill="none"/>
    <path d="M 520 420 Q 560 410 600 430" stroke="#111111" stroke-width="4" fill="none"/>
    <path d="M 520 440 Q 560 470 600 440" stroke="#111111" stroke-width="3" fill="none"/>
    <path d="M 580 490 Q 610 520 570 540" stroke="#111111" stroke-width="4" fill="none"/>
    <path d="M 530 600 Q 570 630 620 590" stroke="#111111" stroke-width="4" fill="none"/>

    <!-- Moon Eye Profile -->
    <path d="M 320 450 Q 350 430 380 450" stroke="#111111" stroke-width="4" fill="none"/>
    <path d="M 330 465 Q 350 480 370 465" stroke="#111111" stroke-width="3" fill="none"/>
  </svg>`;
}

export const PAGES: PageMetadata[] = [
  {
    id: 'lotus-mandala',
    title: 'Sacred Lotus Mandala',
    category: 'Mandalas',
    difficulty: 'Harmonic',
    description: 'A serene concentric meditation mandala with radiating lotus petals and gem facets.',
    svgContent: generateLotusMandalaSvg()
  },
  {
    id: 'bonsai-mountain',
    title: 'Zen Bonsai & Peaks',
    category: 'Nature',
    difficulty: 'Gentle',
    description: 'A miniature curved pine bonsai framed by mountain horizons and tranquil twilight.',
    svgContent: generateBonsaiSvg()
  },
  {
    id: 'origami-crane',
    title: 'Origami Crane & Ripples',
    category: 'Animals',
    difficulty: 'Harmonic',
    description: 'Clean geometric origami crane gliding gracefully over calm water lily ripples.',
    svgContent: generateOrigamiCraneSvg()
  },
  {
    id: 'tropical-monstera',
    title: 'Monstera Deliciosa',
    category: 'Nature',
    difficulty: 'Gentle',
    description: 'Lush tropical botanical foliage with architectural leaf ribs and fenestrations.',
    svgContent: generateBotanicalSvg()
  },
  {
    id: 'celestial-sun-moon',
    title: 'Celestial Sun & Moon',
    category: 'Abstract',
    difficulty: 'Intricate',
    description: 'Harmonious cosmic union between the radiant sunbeams and peaceful crescent moon.',
    svgContent: generateCelestialSvg()
  }
];

export function getPageById(id: string): PageMetadata {
  return PAGES.find(p => p.id === id) || PAGES[0];
}
