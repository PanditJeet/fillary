import { ColorPalette } from '../engine/types.js';

export const PALETTES: ColorPalette[] = [
  {
    id: 'rainbow',
    name: 'Rainbow Joy',
    description: 'Vivid, sunny, high-energy joyful bright colors for everyone',
    colors: [
      '#FFD600', // Sunshine Yellow
      '#FF9100', // Tangerine Punch
      '#FF1744', // Poppy Red
      '#F50057', // Bubblegum Pink
      '#D500F9', // Electric Violet
      '#651FFF', // Royal Purple
      '#2979FF', // Ocean Blue
      '#00B0FF', // Vivid Sky Blue
      '#00E5FF', // Caribbean Cyan
      '#00E676', // Bright Emerald Green
      '#76FF03', // Vivid Lime
      '#FFFFFF'  // Pure White
    ]
  },
  {
    id: 'cute-animals',
    name: 'Playful Pets',
    description: 'Golden fur, puppy caramel, strawberry tongue, and grass greens',
    colors: [
      '#F4A261', // Golden Honey Fur
      '#E76F51', // Warm Caramel
      '#B05B3B', // Cinnamon
      '#5C3D2E', // Chocolate Brown
      '#FFF3E0', // Soft Cream Fur
      '#FF8DA1', // Rosy Cheek Pink
      '#FF3366', // Strawberry Tongue
      '#52B788', // Fresh Lawn Green
      '#2D6A4F', // Deep Garden Leaf
      '#4EA8DE', // Sunny Sky Blue
      '#E63946', // Doghouse Cherry Red
      '#FFD166'  // Tennis Ball Gold
    ]
  },
  {
    id: 'candy-pop',
    name: 'Candy Pop',
    description: 'Sweet, bright, whimsical dessert & confectionery pastels',
    colors: [
      '#FF6584', // Watermelon Pop
      '#FF7597', // Strawberry Milk
      '#FFB5E8', // Cotton Candy
      '#B388FF', // Sweet Lavender
      '#8C9EFF', // Periwinkle Pop
      '#80D8FF', // Blue Raspberry
      '#A7FFEB', // Sweet Mint
      '#B9F6CA', // Kiwi Lime
      '#FFE57F', // Lemon Sorbet
      '#FFD180', // Juicy Peach
      '#FFAB91', // Apricot Cream
      '#FFFFFF'  // Sugar Glaze
    ]
  },
  {
    id: 'tropical-neon',
    name: 'Tropical Glow',
    description: 'Dazzling neon lights, fluorescent reef fish, and electric blossoms',
    colors: [
      '#FF007F', // Electric Magenta
      '#FF5722', // Neon Coral
      '#FFFF00', // Laser Yellow
      '#39FF14', // Electric Neon Lime
      '#00FFFF', // High-Voltage Cyan
      '#00B4D8', // Electric Lagoon
      '#BF00FF', // Vivid Purple
      '#FF4081', // Flamingo Pink
      '#00E676', // Neon Mint
      '#1A237E', // Deep Midnight Navy
      '#FFC107', // Amber Sun
      '#FFFFFF'  // Starlight
    ]
  },
  {
    id: 'classic-crayons',
    name: 'Classic Brights',
    description: 'The universally loved classic crayon box favorites',
    colors: [
      '#E53935', // Cherry Red
      '#FB8C00', // Orange Peel
      '#FDD835', // Bright Sunflower
      '#43A047', // Meadow Green
      '#1E88E5', // Brilliant Blue
      '#8E24AA', // Grape Purple
      '#EC407A', // Rose Pink
      '#00ACC1', // Teal Lagoon
      '#6D4C41', // Cocoa Brown
      '#78909C', // Cloud Slate
      '#C0CA33', // Pear Chartreuse
      '#212121'  // Ink Charcoal
    ]
  }
];

export function getPaletteById(id: string): ColorPalette {
  return PALETTES.find(p => p.id === id) || PALETTES[0];
}
