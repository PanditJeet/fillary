import { PageMetadata } from '../engine/types.js';

// 6. Little Ballerina Dancer
function generateBallerinaSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <!-- Frame -->
    <rect x="50" y="50" width="924" height="924" rx="28" stroke="#111111" stroke-width="6" fill="none"/>

    <!-- Floating Sparkles & Ribbons -->
    <path d="M 200 300 Q 280 200 340 320 T 420 280" stroke="#111111" stroke-width="4" fill="none"/>
    <path d="M 680 260 Q 740 180 800 280 T 880 240" stroke="#111111" stroke-width="4" fill="none"/>
    
    <!-- Stars -->
    <polygon points="180,180 185,195 200,195 188,205 192,220 180,210 168,220 172,205 160,195 175,195" stroke="#111111" stroke-width="3" fill="none"/>
    <polygon points="840,160 845,175 860,175 848,185 852,200 840,190 828,200 832,185 820,175 835,175" stroke="#111111" stroke-width="3" fill="none"/>

    <!-- Ballerina Bun & Tiara -->
    <circle cx="512" cy="200" r="45" stroke="#111111" stroke-width="4.5" fill="none"/>
    <!-- Tiara -->
    <polygon points="480,240 495,215 512,240 529,215 544,240" stroke="#111111" stroke-width="3.5" fill="none"/>

    <!-- Head & Face -->
    <circle cx="512" cy="320" r="100" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- Hair Frame -->
    <path d="M 415 310 C 440 240, 584 240, 609 310" stroke="#111111" stroke-width="5" fill="none"/>

    <!-- Eyes & Smile -->
    <ellipse cx="475" cy="320" rx="14" ry="18" fill="#111111"/>
    <circle cx="471" cy="314" r="5" fill="#FFFFFF"/>
    <ellipse cx="549" cy="320" rx="14" ry="18" fill="#111111"/>
    <circle cx="545" cy="314" r="5" fill="#FFFFFF"/>
    <path d="M 490 365 Q 512 390 534 365" stroke="#111111" stroke-width="4" fill="none"/>

    <!-- Graceful Raised Arms Forming Oval -->
    <path d="M 450 440 C 360 380, 360 260, 460 220" stroke="#111111" stroke-width="5" fill="none"/>
    <path d="M 574 440 C 664 380, 664 260, 564 220" stroke="#111111" stroke-width="5" fill="none"/>

    <!-- Leotard Bodice -->
    <path d="M 460 420 L 564 420 L 550 560 L 474 560 Z" stroke="#111111" stroke-width="5" fill="none"/>

    <!-- Fluffy Ruffled Tutu Skirt -->
    <path d="M 474 560 C 340 580, 300 660, 380 680 C 450 690, 512 680, 512 680 C 512 680, 574 690, 644 680 C 724 660, 684 580, 550 560 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <path d="M 380 640 Q 512 650 644 640" stroke="#111111" stroke-width="3.5" fill="none"/>

    <!-- Ballet Legs on Pointe -->
    <path d="M 490 680 L 490 850 L 470 890 L 505 890 L 512 850" stroke="#111111" stroke-width="5" fill="none"/>
    <path d="M 534 680 C 560 740, 600 780, 640 820 L 660 810 L 630 760 L 550 680" stroke="#111111" stroke-width="5" fill="none"/>

    <!-- Ballet Slippers & Ribbon Ties -->
    <path d="M 470 850 L 512 870 M 470 870 L 512 850" stroke="#111111" stroke-width="3"/>
  </svg>`;
}

// 7. Little Deep Sea Diver / Snorkeler
function generateScubaKidSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <!-- Frame & Ocean -->
    <rect x="50" y="50" width="924" height="924" rx="28" stroke="#111111" stroke-width="6" fill="none"/>

    <!-- Bubbles -->
    <circle cx="280" cy="220" r="28" stroke="#111111" stroke-width="4" fill="none"/>
    <circle cx="240" cy="160" r="18" stroke="#111111" stroke-width="3.5" fill="none"/>
    <circle cx="320" cy="140" r="14" stroke="#111111" stroke-width="3" fill="none"/>
    <circle cx="760" cy="280" r="24" stroke="#111111" stroke-width="4" fill="none"/>

    <!-- Friendly Little Tropical Fish -->
    <path d="M 720 460 C 760 430, 820 430, 850 460 L 890 430 L 890 490 L 850 460 C 820 490, 760 490, 720 460 Z" stroke="#111111" stroke-width="4.5" fill="none"/>
    <circle cx="760" cy="455" r="5" fill="#111111"/>

    <!-- Diver Body / Wetsuit -->
    <path d="M 440 480 L 584 480 L 594 720 L 430 720 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- Scuba Oxygen Tank on Back -->
    <rect x="360" y="460" width="60" height="180" rx="25" stroke="#111111" stroke-width="5" fill="none"/>
    <path d="M 390 460 L 390 430 L 440 430" stroke="#111111" stroke-width="4.5" fill="none"/>

    <!-- Arms Swimming -->
    <path d="M 440 490 C 370 520, 360 580, 320 600" stroke="#111111" stroke-width="5" fill="none"/>
    <path d="M 584 490 C 650 520, 680 580, 720 600" stroke="#111111" stroke-width="5" fill="none"/>

    <!-- Head & Mask with Snorkel -->
    <circle cx="512" cy="360" r="110" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- Snorkel Mask -->
    <rect x="420" y="320" width="184" height="80" rx="28" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- Eyes inside mask -->
    <ellipse cx="468" cy="360" rx="14" ry="18" fill="#111111"/>
    <circle cx="464" cy="354" r="5" fill="#FFFFFF"/>
    <ellipse cx="556" cy="360" rx="14" ry="18" fill="#111111"/>
    <circle cx="552" cy="354" r="5" fill="#FFFFFF"/>

    <!-- Snorkel Tube -->
    <path d="M 580 390 L 640 400 L 650 200" stroke="#111111" stroke-width="5" fill="none"/>
    
    <!-- Smile below mask -->
    <path d="M 488 430 Q 512 455 536 430" stroke="#111111" stroke-width="4" fill="none"/>

    <!-- Legs & Flippers -->
    <path d="M 440 720 L 430 840 L 360 880 L 470 870 L 480 720 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <path d="M 584 720 L 594 840 L 664 880 L 554 870 L 544 720 Z" stroke="#111111" stroke-width="5" fill="none"/>
  </svg>`;
}

// 8. Little Wizard Apprentice
function generateWizardKidSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <!-- Frame -->
    <rect x="50" y="50" width="924" height="924" rx="28" stroke="#111111" stroke-width="6" fill="none"/>

    <!-- Wizard Robe -->
    <path d="M 450 480 L 574 480 L 660 840 L 364 840 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- Robe Stars -->
    <polygon points="420,680 425,695 440,695 428,705 432,720 420,710 408,720 412,705 400,695 415,695" stroke="#111111" stroke-width="3" fill="none"/>
    <polygon points="600,720 605,735 620,735 608,745 612,760 600,750 588,760 592,745 580,735 595,735" stroke="#111111" stroke-width="3" fill="none"/>

    <!-- Magic Wand in Right Hand with Sparkle Burst -->
    <path d="M 574 500 C 650 520, 690 560, 720 600" stroke="#111111" stroke-width="5" fill="none"/>
    <line x1="720" y1="600" x2="820" y2="480" stroke="#111111" stroke-width="6"/>
    <!-- Magic Star Tip -->
    <polygon points="820,480 828,498 848,498 832,510 838,528 820,516 802,528 808,510 792,498 812,498" stroke="#111111" stroke-width="4.5" fill="none"/>

    <!-- Open Spellbook in Left Arm -->
    <path d="M 340 600 L 440 600 L 450 700 L 350 700 Z" stroke="#111111" stroke-width="4.5" fill="none"/>
    <path d="M 395 600 L 395 700" stroke="#111111" stroke-width="4"/>

    <!-- Head & Wizard Glasses -->
    <circle cx="512" cy="360" r="110" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- Round Wizard Glasses -->
    <circle cx="465" cy="360" r="30" stroke="#111111" stroke-width="4.5" fill="none"/>
    <circle cx="559" cy="360" r="30" stroke="#111111" stroke-width="4.5" fill="none"/>
    <line x1="495" y1="360" x2="529" y2="360" stroke="#111111" stroke-width="4"/>

    <!-- Eyes inside glasses -->
    <ellipse cx="465" cy="360" rx="12" ry="15" fill="#111111"/>
    <circle cx="461" cy="355" r="4" fill="#FFFFFF"/>
    <ellipse cx="559" cy="360" rx="12" ry="15" fill="#111111"/>
    <circle cx="555" cy="355" r="4" fill="#FFFFFF"/>

    <!-- Pointed Wizard Hat -->
    <path d="M 360 280 C 400 100, 520 80, 560 120 C 580 140, 570 190, 664 280 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <ellipse cx="512" cy="280" rx="170" ry="28" stroke="#111111" stroke-width="5" fill="none"/>

    <!-- Happy Smile -->
    <path d="M 488 420 Q 512 445 536 420" stroke="#111111" stroke-width="4" fill="none"/>
  </svg>`;
}

// 9. Little Scientist Kid
function generateScientistKidSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <!-- Frame -->
    <rect x="50" y="50" width="924" height="924" rx="28" stroke="#111111" stroke-width="6" fill="none"/>

    <!-- Floating Atom Model in Background -->
    <ellipse cx="220" cy="220" rx="70" ry="25" transform="rotate(30 220 220)" stroke="#111111" stroke-width="3.5" fill="none"/>
    <ellipse cx="220" cy="220" rx="70" ry="25" transform="rotate(-30 220 220)" stroke="#111111" stroke-width="3.5" fill="none"/>
    <circle cx="220" cy="220" r="14" stroke="#111111" stroke-width="3" fill="none"/>

    <!-- Lab Table -->
    <line x1="50" y1="780" x2="974" y2="780" stroke="#111111" stroke-width="5"/>

    <!-- Bubbling Erlenmeyer Flask on Table -->
    <path d="M 760 620 L 780 620 L 780 660 L 830 760 C 840 780, 710 780, 720 760 L 760 660 Z" stroke="#111111" stroke-width="4.5" fill="none"/>
    <circle cx="770" cy="580" r="12" stroke="#111111" stroke-width="3" fill="none"/>
    <circle cx="785" cy="540" r="16" stroke="#111111" stroke-width="3.5" fill="none"/>

    <!-- Scientist Kid in Lab Coat -->
    <path d="M 440 480 L 584 480 L 600 760 L 424 760 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- Lab Coat Collar & Buttons -->
    <path d="M 512 480 L 512 760" stroke="#111111" stroke-width="4"/>
    <circle cx="512" cy="550" r="6" stroke="#111111" stroke-width="3" fill="none"/>
    <circle cx="512" cy="620" r="6" stroke="#111111" stroke-width="3" fill="none"/>

    <!-- Holding Test Tube in Hand -->
    <path d="M 440 500 C 370 540, 360 620, 380 670" stroke="#111111" stroke-width="5" fill="none"/>
    <rect x="360" y="580" width="22" height="90" rx="10" stroke="#111111" stroke-width="4" fill="none"/>
    <circle cx="371" cy="550" r="10" stroke="#111111" stroke-width="3" fill="none"/>

    <!-- Head & Science Safety Goggles on Forehead -->
    <circle cx="512" cy="360" r="110" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- Safety Goggles -->
    <rect x="420" y="270" width="80" height="50" rx="14" stroke="#111111" stroke-width="4.5" fill="none"/>
    <rect x="524" y="270" width="80" height="50" rx="14" stroke="#111111" stroke-width="4.5" fill="none"/>
    <line x1="500" y1="295" x2="524" y2="295" stroke="#111111" stroke-width="4"/>

    <!-- Wild Albert Einstein-style Spiky Hair -->
    <path d="M 402 360 C 360 220, 440 180, 512 180 C 584 180, 664 220, 622 360" stroke="#111111" stroke-width="5" fill="none"/>

    <!-- Eyes & Excited Open Smile -->
    <ellipse cx="468" cy="370" rx="14" ry="18" fill="#111111"/>
    <circle cx="464" cy="364" r="5" fill="#FFFFFF"/>
    <ellipse cx="556" cy="370" rx="14" ry="18" fill="#111111"/>
    <circle cx="552" cy="364" r="5" fill="#FFFFFF"/>
    <path d="M 485 415 Q 512 455 539 415 Z" stroke="#111111" stroke-width="4.5" fill="none"/>
  </svg>`;
}

// 10. Cozy Storybook Reader Kid
function generateCozyReaderSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <!-- Frame -->
    <rect x="50" y="50" width="924" height="924" rx="28" stroke="#111111" stroke-width="6" fill="none"/>

    <!-- Cozy Reading Lamp in Background -->
    <path d="M 780 280 L 880 280 L 850 360 L 810 360 Z" stroke="#111111" stroke-width="4.5" fill="none"/>
    <line x1="830" y1="360" x2="830" y2="780" stroke="#111111" stroke-width="5"/>
    <ellipse cx="830" cy="780" rx="40" ry="14" stroke="#111111" stroke-width="4" fill="none"/>

    <!-- Steaming Mug of Hot Cocoa with Marshmallows on Small Stool -->
    <rect x="180" y="660" width="70" height="60" rx="8" stroke="#111111" stroke-width="4" fill="none"/>
    <path d="M 250 675 C 270 675, 270 705, 250 705" stroke="#111111" stroke-width="3.5" fill="none"/>
    <path d="M 205 640 Q 215 620 205 600" stroke="#111111" stroke-width="3" fill="none"/>

    <!-- Giant Puffy Beanbag Chair -->
    <path d="M 320 620 C 260 700, 320 840, 512 840 C 704 840, 764 700, 704 620 C 650 560, 380 560, 320 620 Z" stroke="#111111" stroke-width="5" fill="none"/>

    <!-- Child in Cozy Star Pajamas -->
    <path d="M 440 500 L 584 500 L 600 700 L 424 700 Z" stroke="#111111" stroke-width="5" fill="none"/>

    <!-- Big Open Storybook in Lap -->
    <path d="M 380 620 L 512 650 L 644 620 L 634 720 L 512 740 L 390 720 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <line x1="512" y1="650" x2="512" y2="740" stroke="#111111" stroke-width="4"/>

    <!-- Head & Nightcap / Beanie -->
    <circle cx="512" cy="370" r="110" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- Sleeping Cap with Pompom -->
    <path d="M 405 330 C 440 180, 604 180, 619 330 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <path d="M 619 300 C 680 290, 700 360, 680 400" stroke="#111111" stroke-width="4.5" fill="none"/>
    <circle cx="680" cy="405" r="18" stroke="#111111" stroke-width="4" fill="none"/>

    <!-- Peaceful Content Smiling Eyes -->
    <ellipse cx="468" cy="370" rx="14" ry="18" fill="#111111"/>
    <circle cx="464" cy="364" r="5" fill="#FFFFFF"/>
    <ellipse cx="556" cy="370" rx="14" ry="18" fill="#111111"/>
    <circle cx="552" cy="364" r="5" fill="#FFFFFF"/>
    <path d="M 488 420 Q 512 445 536 420" stroke="#111111" stroke-width="4.5" fill="none"/>
  </svg>`;
}

export const HUMAN_CARTOON_PAGES: PageMetadata[] = [
  {
    id: 'human-astronaut',
    title: 'Space Astronaut Kid',
    category: 'Human Cartoons',
    difficulty: 'Gentle',
    description: 'A cute little astronaut floating happily in space with smiling planets and a rocket ship.',
    imageUrl: '/pages/human-astronaut.jpg'
  },
  {
    id: 'human-chef',
    title: 'Little Master Chef',
    category: 'Human Cartoons',
    difficulty: 'Gentle',
    description: 'A cheerful kid chef with a tall chef hat and giant cupcake with frosting and a cherry.',
    imageUrl: '/pages/human-chef.jpg'
  },
  {
    id: 'human-superhero',
    title: 'Brave Superhero Kid',
    category: 'Human Cartoons',
    difficulty: 'Gentle',
    description: 'A confident superhero kid with a flowing cape and star emblem overlooking the city.',
    imageUrl: '/pages/superhero-kid.jpg'
  },
  {
    id: 'human-gardener',
    title: 'Little Flower Gardener',
    category: 'Human Cartoons',
    difficulty: 'Gentle',
    description: 'A cheerful little gardener planting seedlings with a friendly kitten and flowers.',
    imageUrl: '/pages/gardener-boy.jpg'
  },
  {
    id: 'human-musician',
    title: 'Happy Ukulele Player',
    category: 'Human Cartoons',
    difficulty: 'Gentle',
    description: 'A joyful kid playing a cheerful tune on an acoustic ukulele with a happy puppy.',
    imageUrl: '/pages/ukulele-player.jpg'
  },
  {
    id: 'human-artist',
    title: 'Little Canvas Painter',
    category: 'Human Cartoons',
    difficulty: 'Gentle',
    description: 'A happy little painter in a beret painting mountains on an easel with a sleeping kitty.',
    imageUrl: '/pages/canvas-painter.jpg'
  },
  {
    id: 'human-knight',
    title: 'Brave Little Knight',
    category: 'Human Cartoons',
    difficulty: 'Gentle',
    description: 'A brave little knight holding a sword and lion shield alongside a cute baby dragon.',
    imageUrl: '/pages/brave-knight.jpg'
  },
  {
    id: 'human-ballerina',
    title: 'Graceful Ballerina Girl',
    category: 'Human Cartoons',
    difficulty: 'Gentle',
    description: 'A smiling ballerina girl in a fluffy tutu doing a graceful dance on pointe.',
    svgContent: generateBallerinaSvg()
  },
  {
    id: 'human-scuba',
    title: 'Ocean Scuba Explorer',
    category: 'Human Cartoons',
    difficulty: 'Gentle',
    description: 'A little deep-sea snorkeler swimming with bubbles and friendly tropical fish.',
    svgContent: generateScubaKidSvg()
  },
  {
    id: 'human-wizard',
    title: 'Little Wizard Apprentice',
    category: 'Human Cartoons',
    difficulty: 'Gentle',
    description: 'A cute young wizard in starry robes casting sparkles from a magic wand.',
    svgContent: generateWizardKidSvg()
  },
  {
    id: 'human-scientist',
    title: 'Curious Junior Scientist',
    category: 'Human Cartoons',
    difficulty: 'Gentle',
    description: 'A bright young scientist with safety goggles observing bubbling colorful test tubes.',
    svgContent: generateScientistKidSvg()
  },
  {
    id: 'human-reader',
    title: 'Cozy Storybook Reader',
    category: 'Human Cartoons',
    difficulty: 'Gentle',
    description: 'A cozy kid in pajamas reading an exciting storybook with a warm mug of cocoa.',
    svgContent: generateCozyReaderSvg()
  }
];
