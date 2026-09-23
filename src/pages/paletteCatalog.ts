import { ColorPalette } from '../engine/types.js';

export const PALETTES: ColorPalette[] = [
  {
    id: 'zen',
    name: 'Zen Stone & Clay',
    description: 'Earthy clays, tranquil sages, and warm natural alabasters',
    colors: [
      '#E07A5F', // Warm Terracotta
      '#F4F1DE', // Warm Sand Linen
      '#81B29A', // Sage Meadow
      '#3D405B', // Deep Slate Indigo
      '#F2CC8F', // Golden Clay
      '#B5838D', // Dusty Mauve
      '#6B705C', // Olive Bark
      '#A5A58D', // Lichen Taupe
      '#DDBEA9', // Warm Shell
      '#CB997E'  // Cinnamon Sand
    ]
  },
  {
    id: 'kyoto',
    name: 'Kyoto Blossom',
    description: 'Blushing petals, matcha mist, and rich lacquered plum',
    colors: [
      '#F7CAD0', // Sakura Petal
      '#FFB3C6', // Soft Blossom
      '#FF8FAB', // Radiant Camellia
      '#FB6F92', // Deep Peony
      '#84A98C', // Matcha Mist
      '#52796F', // Deep Cedar
      '#354F52', // Dark Slate Pine
      '#2F3E46', // Charcoal Indigo
      '#FFE5D9', // Porcelain Blush
      '#9D8189'  // Wisteria Dust
    ]
  },
  {
    id: 'nordic',
    name: 'Nordic Forest',
    description: 'Pine needles, alpine glaciers, and misty granite peaks',
    colors: [
      '#264653', // Deep Atlantic
      '#2A9D8F', // Glacial Pine
      '#E9C46A', // Arctic Sunrise
      '#F4A261', // Amber Cloud
      '#E76F51', // Rowan Berry
      '#457B9D', // Fjord Blue
      '#1D3557', // Midnight Trench
      '#A8DADC', // Ice Fog
      '#F1FAEE', // Pure Frost
      '#6C757D'  // Granite Rock
    ]
  },
  {
    id: 'twilight',
    name: 'Velvet Twilight',
    description: 'Luminous starlight, cosmic indigo, and dusty amethyst',
    colors: [
      '#4A4E69', // Dusk Slate
      '#22223B', // Midnight Shadow
      '#9A8C98', // Lavender Haze
      '#C9ADA7', // Pale Quartz
      '#F2E9E4', // Starlight Silk
      '#7209B7', // Royal Amethyst
      '#3F37C9', // Electric Indigo
      '#4895EF', // Celestial Azure
      '#4CC9F0', // Luminescent Sky
      '#F72585'  // Neon Sunset
    ]
  },
  {
    id: 'solstice',
    name: 'Desert Solstice',
    description: 'Sun-drenched canyon sands, terracotta warmth, and agave green',
    colors: [
      '#D97706', // Warm Amber
      '#B45309', // Desert Ochre
      '#9A3412', // Canyon Rust
      '#78350F', // Dark Umber
      '#059669', // Desert Agave
      '#0D9488', // Turquoise Mineral
      '#FDE68A', // Sunlit Dunes
      '#FCD34D', // Topaz Glow
      '#FEF3C7', // Bleached Ivory
      '#475569'  // Slate Shadow
    ]
  }
];

export function getPaletteById(id: string): ColorPalette {
  return PALETTES.find(p => p.id === id) || PALETTES[0];
}
