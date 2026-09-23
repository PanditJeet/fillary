import { PageMetadata } from '../engine/types.js';

// 1. Superhero Kid
function generateSuperheroKidSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <!-- Frame & Sky -->
    <rect x="50" y="50" width="924" height="924" rx="28" stroke="#111111" stroke-width="6" fill="none"/>
    
    <!-- Cartoon Sun & Clouds -->
    <circle cx="200" cy="200" r="80" stroke="#111111" stroke-width="4.5" fill="none"/>
    <circle cx="175" cy="190" r="8" fill="#111111"/>
    <circle cx="225" cy="190" r="8" fill="#111111"/>
    <path d="M 185 220 Q 200 240 215 220" stroke="#111111" stroke-width="4" fill="none"/>
    
    <!-- Floating Clouds -->
    <path d="M 680 200 C 650 170, 710 130, 760 140 C 800 120, 850 140, 860 180 C 890 190, 900 240, 860 250 C 840 270, 780 270, 750 250 C 720 260, 680 240, 680 200 Z" stroke="#111111" stroke-width="4.5" fill="none"/>
    <path d="M 120 400 C 90 380, 130 340, 170 350 C 200 330, 240 350, 250 380 C 270 390, 280 430, 250 440 C 230 460, 180 460, 160 440 C 140 450, 110 430, 120 400 Z" stroke="#111111" stroke-width="4" fill="none"/>

    <!-- Cape Flowing Behind -->
    <path d="M 430 460 C 320 480, 260 620, 240 820 C 360 810, 410 740, 450 680 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <path d="M 590 460 C 700 480, 760 620, 780 820 C 660 810, 610 740, 570 680 Z" stroke="#111111" stroke-width="5" fill="none"/>

    <!-- Superhero Body / Suit -->
    <path d="M 450 460 L 574 460 L 590 640 L 434 640 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- Star Emblem on Chest -->
    <polygon points="512,500 522,530 552,530 528,548 538,578 512,560 486,578 496,548 472,530 502,530" stroke="#111111" stroke-width="4" fill="none"/>
    
    <!-- Belt with Buckle -->
    <rect x="430" y="640" width="164" height="34" rx="6" stroke="#111111" stroke-width="4.5" fill="none"/>
    <circle cx="512" cy="657" r="14" stroke="#111111" stroke-width="4" fill="none"/>

    <!-- Legs & Boots -->
    <path d="M 440 674 L 440 830 L 400 830 C 390 830, 390 880, 440 880 L 490 880 L 490 674 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <path d="M 584 674 L 584 830 L 624 830 C 634 830, 634 880, 584 880 L 534 880 L 534 674 Z" stroke="#111111" stroke-width="5" fill="none"/>

    <!-- Arms on Hips (Proud Pose) -->
    <path d="M 450 470 C 370 490, 350 560, 420 620 L 440 600" stroke="#111111" stroke-width="5" fill="none"/>
    <path d="M 574 470 C 654 490, 674 560, 604 620 L 584 600" stroke="#111111" stroke-width="5" fill="none"/>

    <!-- Head & Face -->
    <circle cx="512" cy="360" r="115" stroke="#111111" stroke-width="5" fill="none"/>
    
    <!-- Hair Spikes -->
    <path d="M 400 340 C 390 240, 470 210, 512 210 C 560 210, 630 240, 624 340 C 610 270, 570 250, 512 250 C 460 250, 420 270, 400 340 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <path d="M 460 230 L 500 170 L 520 230" stroke="#111111" stroke-width="4.5" fill="none"/>
    <path d="M 510 220 L 550 160 L 565 225" stroke="#111111" stroke-width="4.5" fill="none"/>

    <!-- Superhero Eye Mask -->
    <path d="M 430 340 C 450 310, 500 320, 512 340 C 524 320, 574 310, 594 340 C 584 380, 524 380, 512 360 C 500 380, 440 380, 430 340 Z" stroke="#111111" stroke-width="4.5" fill="none"/>
    
    <!-- Big Sparkling Eyes inside Mask -->
    <ellipse cx="465" cy="345" rx="14" ry="18" fill="#111111"/>
    <circle cx="461" cy="339" r="5" fill="#FFFFFF"/>
    <ellipse cx="559" cy="345" rx="14" ry="18" fill="#111111"/>
    <circle cx="555" cy="339" r="5" fill="#FFFFFF"/>

    <!-- Happy Smile -->
    <path d="M 485 410 Q 512 445 539 410 Z" stroke="#111111" stroke-width="4" fill="none"/>
  </svg>`;
}

// 2. Little Gardener Girl
function generateLittleGardenerSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <!-- Frame & Ground -->
    <rect x="50" y="50" width="924" height="924" rx="28" stroke="#111111" stroke-width="6" fill="none"/>
    <path d="M 50 820 Q 512 790 974 820" stroke="#111111" stroke-width="5" fill="none"/>

    <!-- Wooden Picket Fence -->
    <path d="M 100 680 L 100 820 M 160 680 L 160 820 M 220 680 L 220 820" stroke="#111111" stroke-width="4.5"/>
    <path d="M 80 720 L 250 720 M 80 780 L 250 780" stroke="#111111" stroke-width="4"/>

    <!-- Sunflowers in Background -->
    <circle cx="160" cy="560" r="45" stroke="#111111" stroke-width="4" fill="none"/>
    <circle cx="160" cy="560" r="22" stroke="#111111" stroke-width="3.5" fill="none"/>
    <path d="M 160 605 L 160 720" stroke="#111111" stroke-width="5" fill="none"/>

    <!-- Potted Plant in Front -->
    <path d="M 760 740 L 860 740 L 840 840 L 780 840 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <path d="M 810 740 Q 770 680 760 630 Q 800 650 810 740" stroke="#111111" stroke-width="4" fill="none"/>
    <path d="M 810 740 Q 850 680 860 630 Q 820 650 810 740" stroke="#111111" stroke-width="4" fill="none"/>

    <!-- Gardener Overalls & Body -->
    <path d="M 450 540 L 574 540 L 600 780 L 424 780 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- Overall Straps -->
    <path d="M 460 480 L 475 560" stroke="#111111" stroke-width="5" fill="none"/>
    <path d="M 564 480 L 549 560" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- Overall Pocket -->
    <path d="M 480 600 L 544 600 L 534 660 L 490 660 Z" stroke="#111111" stroke-width="4" fill="none"/>

    <!-- Boots -->
    <path d="M 440 780 L 440 850 C 430 850, 400 850, 400 880 L 490 880 L 490 780 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <path d="M 584 780 L 584 850 C 594 850, 624 850, 624 880 L 534 880 L 534 780 Z" stroke="#111111" stroke-width="5" fill="none"/>

    <!-- Watering Can in Left Hand -->
    <path d="M 330 650 L 400 650 L 410 740 L 320 740 Z" stroke="#111111" stroke-width="4.5" fill="none"/>
    <path d="M 320 670 L 260 630 L 260 650" stroke="#111111" stroke-width="4" fill="none"/>
    <path d="M 365 650 C 365 600, 420 600, 420 650" stroke="#111111" stroke-width="4" fill="none"/>
    <path d="M 450 510 C 390 530, 380 610, 410 650" stroke="#111111" stroke-width="5" fill="none"/>

    <!-- Right Arm Holding Flower Blossom -->
    <path d="M 574 510 C 640 540, 660 620, 680 640" stroke="#111111" stroke-width="5" fill="none"/>
    <circle cx="700" cy="640" r="16" stroke="#111111" stroke-width="4" fill="none"/>

    <!-- Head & Face -->
    <circle cx="512" cy="380" r="110" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- Pigtails -->
    <path d="M 405 380 C 340 370, 330 460, 370 480 C 400 460, 410 420, 405 380 Z" stroke="#111111" stroke-width="4.5" fill="none"/>
    <path d="M 619 380 C 684 370, 694 460, 654 480 C 624 460, 614 420, 619 380 Z" stroke="#111111" stroke-width="4.5" fill="none"/>

    <!-- Sun Hat -->
    <path d="M 340 320 C 380 200, 644 200, 684 320 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <ellipse cx="512" cy="320" rx="190" ry="32" stroke="#111111" stroke-width="5" fill="none"/>

    <!-- Eyes & Rosy Cheeks -->
    <ellipse cx="470" cy="380" rx="14" ry="18" fill="#111111"/>
    <circle cx="466" cy="374" r="5" fill="#FFFFFF"/>
    <ellipse cx="554" cy="380" rx="14" ry="18" fill="#111111"/>
    <circle cx="550" cy="374" r="5" fill="#FFFFFF"/>
    <circle cx="440" cy="405" r="12" stroke="#111111" stroke-width="2.5" stroke-dasharray="3 3" fill="none"/>
    <circle cx="584" cy="405" r="12" stroke="#111111" stroke-width="2.5" stroke-dasharray="3 3" fill="none"/>
    <path d="M 488 420 Q 512 445 536 420" stroke="#111111" stroke-width="4" fill="none"/>
  </svg>`;
}

// 3. Little Musician with Ukulele / Guitar
function generateMusicianKidSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <!-- Frame -->
    <rect x="50" y="50" width="924" height="924" rx="28" stroke="#111111" stroke-width="6" fill="none"/>
    
    <!-- Floating Musical Notes -->
    <path d="M 220 220 L 220 160 L 280 180 L 280 240 M 220 220 A 18 18 0 1 1 184 220 A 18 18 0 1 1 220 220 M 280 240 A 18 18 0 1 1 244 240 A 18 18 0 1 1 280 240" stroke="#111111" stroke-width="4.5" fill="none"/>
    <path d="M 760 240 L 760 170 C 790 160, 810 190, 810 200 M 760 240 A 18 18 0 1 1 724 240 A 18 18 0 1 1 760 240" stroke="#111111" stroke-width="4.5" fill="none"/>
    <path d="M 830 380 L 830 310 C 860 300, 880 330, 880 340 M 830 380 A 16 16 0 1 1 798 380 A 16 16 0 1 1 830 380" stroke="#111111" stroke-width="4" fill="none"/>

    <!-- Head & Headphones -->
    <circle cx="512" cy="370" r="115" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- Headphone Band -->
    <path d="M 380 370 C 380 220, 644 220, 644 370" stroke="#111111" stroke-width="6" fill="none"/>
    <rect x="360" y="340" width="30" height="60" rx="14" stroke="#111111" stroke-width="4.5" fill="none"/>
    <rect x="634" y="340" width="30" height="60" rx="14" stroke="#111111" stroke-width="4.5" fill="none"/>

    <!-- Backward Baseball Cap -->
    <path d="M 405 320 C 420 230, 604 230, 619 320 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <path d="M 619 320 Q 690 310 680 335 Q 619 340 619 320" stroke="#111111" stroke-width="4.5" fill="none"/>

    <!-- Eyes & Singing Open Mouth -->
    <ellipse cx="468" cy="370" rx="14" ry="18" fill="#111111"/>
    <circle cx="464" cy="364" r="5" fill="#FFFFFF"/>
    <ellipse cx="556" cy="370" rx="14" ry="18" fill="#111111"/>
    <circle cx="552" cy="364" r="5" fill="#FFFFFF"/>
    <path d="M 485 410 Q 512 455 539 410 Z" stroke="#111111" stroke-width="4.5" fill="none"/>

    <!-- Body / T-Shirt -->
    <path d="M 440 480 L 584 480 L 600 700 L 424 700 Z" stroke="#111111" stroke-width="5" fill="none"/>

    <!-- Ukulele Body -->
    <ellipse cx="512" cy="650" rx="90" ry="70" stroke="#111111" stroke-width="5" fill="none"/>
    <circle cx="512" cy="650" r="24" stroke="#111111" stroke-width="4" fill="none"/>
    <!-- Ukulele Neck & Headstock -->
    <rect x="330" y="580" width="120" height="28" rx="6" transform="rotate(-30 330 580)" stroke="#111111" stroke-width="4.5" fill="none"/>

    <!-- Hands Playing Instrument -->
    <!-- Left Hand Fretting -->
    <circle cx="340" cy="560" r="22" stroke="#111111" stroke-width="4.5" fill="none"/>
    <path d="M 440 490 C 370 510, 340 530, 340 560" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- Right Hand Strumming -->
    <circle cx="530" cy="620" r="22" stroke="#111111" stroke-width="4.5" fill="none"/>
    <path d="M 584 490 C 620 540, 580 600, 530 620" stroke="#111111" stroke-width="5" fill="none"/>

    <!-- Legs & Sneakers (Cross-legged sitting) -->
    <path d="M 424 700 C 360 740, 360 840, 480 840 L 512 840" stroke="#111111" stroke-width="5" fill="none"/>
    <path d="M 600 700 C 664 740, 664 840, 544 840 L 512 840" stroke="#111111" stroke-width="5" fill="none"/>
  </svg>`;
}

// 4. Little Artist Painter Girl
function generateArtistKidSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <!-- Frame -->
    <rect x="50" y="50" width="924" height="924" rx="28" stroke="#111111" stroke-width="6" fill="none"/>

    <!-- Wooden Easel on Left with Canvas -->
    <polygon points="180,300 380,300 380,540 180,540" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- Mini Rainbow on Canvas -->
    <path d="M 210 500 A 70 70 0 0 1 350 500" stroke="#111111" stroke-width="4" fill="none"/>
    <path d="M 230 500 A 50 50 0 0 1 330 500" stroke="#111111" stroke-width="4" fill="none"/>
    <path d="M 250 500 A 30 30 0 0 1 310 500" stroke="#111111" stroke-width="4" fill="none"/>
    <!-- Easel Legs -->
    <line x1="280" y1="240" x2="280" y2="300" stroke="#111111" stroke-width="6"/>
    <line x1="220" y1="540" x2="160" y2="840" stroke="#111111" stroke-width="6"/>
    <line x1="340" y1="540" x2="400" y2="840" stroke="#111111" stroke-width="6"/>

    <!-- Artist Body & Apron -->
    <path d="M 520 480 L 640 480 L 660 740 L 500 740 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <rect x="530" y="520" width="80" height="90" rx="10" stroke="#111111" stroke-width="4" fill="none"/>

    <!-- Artist Wooden Palette in Left Hand -->
    <path d="M 450 640 C 410 600, 440 550, 490 560 C 530 570, 540 620, 520 660 C 500 700, 460 680, 450 640 Z" stroke="#111111" stroke-width="4.5" fill="none"/>
    <circle cx="475" cy="590" r="7" stroke="#111111" stroke-width="3" fill="none"/>
    <circle cx="505" cy="600" r="7" stroke="#111111" stroke-width="3" fill="none"/>
    <circle cx="510" cy="630" r="7" stroke="#111111" stroke-width="3" fill="none"/>
    <circle cx="465" cy="650" r="10" stroke="#111111" stroke-width="3.5" fill="none"/> <!-- Thumb hole -->

    <!-- Right Arm Holding Paintbrush towards Easel -->
    <path d="M 640 500 C 670 540, 560 520, 420 480" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- Paintbrush -->
    <line x1="420" y1="480" x2="360" y2="460" stroke="#111111" stroke-width="5"/>
    <path d="M 360 460 C 350 455, 340 455, 345 465 C 350 470, 360 465, 360 460 Z" stroke="#111111" stroke-width="3.5" fill="none"/>

    <!-- Head & Artist Beret -->
    <circle cx="580" cy="360" r="110" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- French Beret -->
    <path d="M 460 320 C 470 200, 700 200, 710 320 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <path d="M 580 200 L 580 180" stroke="#111111" stroke-width="4"/>

    <!-- Hair Bob Cut -->
    <path d="M 480 340 C 470 420, 500 460, 520 460 C 510 420, 510 370, 530 360" stroke="#111111" stroke-width="4.5" fill="none"/>
    <path d="M 680 340 C 690 420, 660 460, 640 460 C 650 420, 650 370, 630 360" stroke="#111111" stroke-width="4.5" fill="none"/>

    <!-- Eyes & Smile -->
    <ellipse cx="545" cy="360" rx="14" ry="18" fill="#111111"/>
    <circle cx="541" cy="354" r="5" fill="#FFFFFF"/>
    <ellipse cx="625" cy="360" rx="14" ry="18" fill="#111111"/>
    <circle cx="621" cy="354" r="5" fill="#FFFFFF"/>
    <path d="M 565 405 Q 585 430 605 405" stroke="#111111" stroke-width="4" fill="none"/>

    <!-- Shoes -->
    <path d="M 530 740 L 530 830 L 480 830 C 470 830, 470 870, 530 870 L 560 870 L 560 740 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <path d="M 630 740 L 630 830 L 680 830 C 690 830, 690 870, 630 870 L 600 870 L 600 740 Z" stroke="#111111" stroke-width="5" fill="none"/>
  </svg>`;
}

// 5. Brave Little Knight
function generateBraveKnightSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <!-- Frame & Castle Background -->
    <rect x="50" y="50" width="924" height="924" rx="28" stroke="#111111" stroke-width="6" fill="none"/>
    <!-- Castle Turret -->
    <path d="M 700 400 L 700 820 M 860 400 L 860 820" stroke="#111111" stroke-width="5"/>
    <path d="M 680 400 L 720 400 L 720 370 L 750 370 L 750 400 L 780 400 L 780 370 L 810 370 L 810 400 L 840 400 L 840 370 L 870 370 L 870 400 L 880 400" stroke="#111111" stroke-width="4.5" fill="none"/>

    <!-- Knight Armor Body -->
    <path d="M 440 500 L 584 500 L 594 720 L 430 720 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- Armor Plate Lines -->
    <path d="M 440 580 L 584 580 M 435 650 L 589 650" stroke="#111111" stroke-width="4"/>

    <!-- Wooden Shield in Left Hand -->
    <path d="M 320 540 L 440 540 C 440 680, 380 750, 380 770 C 380 750, 320 680, 320 540 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- Shield Crest Cross / Star -->
    <path d="M 380 570 L 380 710 M 340 620 L 420 620" stroke="#111111" stroke-width="4.5"/>

    <!-- Wooden Toy Sword in Right Hand -->
    <path d="M 584 520 C 650 540, 680 580, 670 630" stroke="#111111" stroke-width="5" fill="none"/>
    <rect x="660" y="440" width="24" height="180" rx="4" stroke="#111111" stroke-width="4.5" fill="none"/>
    <rect x="640" y="600" width="64" height="16" rx="4" stroke="#111111" stroke-width="4" fill="none"/>

    <!-- Head & Knight Helmet with Visor -->
    <circle cx="512" cy="370" r="115" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- Helmet Dome -->
    <path d="M 397 370 C 397 220, 627 220, 627 370 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <!-- Plume Feather on Top -->
    <path d="M 512 230 C 512 150, 580 140, 600 170 C 600 210, 540 220, 512 230 Z" stroke="#111111" stroke-width="4.5" fill="none"/>

    <!-- Helmet Visor Slot showing Cheerful Eyes -->
    <rect x="420" y="330" width="184" height="60" rx="12" stroke="#111111" stroke-width="4.5" fill="none"/>
    <ellipse cx="468" cy="360" rx="14" ry="18" fill="#111111"/>
    <circle cx="464" cy="354" r="5" fill="#FFFFFF"/>
    <ellipse cx="556" cy="360" rx="14" ry="18" fill="#111111"/>
    <circle cx="552" cy="354" r="5" fill="#FFFFFF"/>

    <!-- Big Happy Smile Below Helmet -->
    <path d="M 488 425 Q 512 455 536 425" stroke="#111111" stroke-width="4.5" fill="none"/>

    <!-- Greaves / Boots -->
    <path d="M 450 720 L 450 840 L 400 840 C 390 840, 390 880, 450 880 L 490 880 L 490 720 Z" stroke="#111111" stroke-width="5" fill="none"/>
    <path d="M 574 720 L 574 840 L 624 840 C 634 840, 634 880, 574 880 L 534 880 L 534 720 Z" stroke="#111111" stroke-width="5" fill="none"/>
  </svg>`;
}

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
    <path d="M 488 420 Q 512 445 536 420" stroke="#111111" stroke-width="4" fill="none"/>
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
    description: 'A confident little superhero kid with a flowing cape, eye mask, and star emblem.',
    svgContent: generateSuperheroKidSvg()
  },
  {
    id: 'human-gardener',
    title: 'Little Flower Gardener',
    category: 'Human Cartoons',
    difficulty: 'Gentle',
    description: 'A sweet gardener girl in overalls and sunhat watering bright sunflowers.',
    svgContent: generateLittleGardenerSvg()
  },
  {
    id: 'human-musician',
    title: 'Happy Ukulele Player',
    category: 'Human Cartoons',
    difficulty: 'Gentle',
    description: 'A joyful kid with headphones playing a cheerful tune on an acoustic ukulele.',
    svgContent: generateMusicianKidSvg()
  },
  {
    id: 'human-artist',
    title: 'Little Canvas Painter',
    category: 'Human Cartoons',
    difficulty: 'Gentle',
    description: 'An adorable painter girl in a French beret with palette, brush, and rainbow easel.',
    svgContent: generateArtistKidSvg()
  },
  {
    id: 'human-knight',
    title: 'Brave Little Knight',
    category: 'Human Cartoons',
    difficulty: 'Gentle',
    description: 'A courageous little knight in armor with shield and toy sword by the castle turret.',
    svgContent: generateBraveKnightSvg()
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
