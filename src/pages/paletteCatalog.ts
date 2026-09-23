import { ColorPalette } from '../engine/types.js';

export const PALETTES: ColorPalette[] = [
  {
    id: 'rainbow-spectrum',
    name: 'Rainbow Spectrum',
    description: '24 bright, vibrant, high-energy colors covering the entire rainbow spectrum',
    colors: [
      '#EF233C', // Crimson Red
      '#FF1744', // Poppy Scarlet
      '#FF4D6D', // Coral Pink
      '#F72585', // Electric Rose
      '#FF5400', // Bright Blaze Orange
      '#FF8500', // Tangerine Punch
      '#FF9E00', // Amber Orange
      '#FFD000', // Warm Sunlight
      '#FFEA00', // Lemon Zest
      '#70E000', // Spring Lime
      '#38B000', // Vivid Grass Green
      '#00F5D4', // Tropical Mint
      '#00BBF9', // Sky Blue
      '#0096C7', // Ocean Azure
      '#0077B6', // Deep Marine
      '#023E8A', // Royal Navy
      '#7209B7', // Deep Violet
      '#9D4EDD', // Electric Purple
      '#C77DFF', // Bright Lilac
      '#FF70A6', // Bubblegum Pink
      '#DDB892', // Warm Sand
      '#582F0E', // Earth Brown
      '#FFFFFF', // Pure Snow White
      '#212529'  // Jet Ink
    ]
  },
  {
    id: 'mystic-magic',
    name: 'Mystic Magic',
    description: 'Enchanted cosmic purples, starlight auroras, fairy dust, and glowing potions',
    colors: [
      '#7B2CBF', // Wizard Purple
      '#9D4EDD', // Mystic Violet
      '#C77DFF', // Starlight Amethyst
      '#E0AAFF', // Fairy Lavender
      '#3A0CA3', // Galaxy Midnight
      '#4361EE', // Arcane Blue
      '#4CC9F0', // Celestial Cyan
      '#70FFD6', // Aurora Mint
      '#06D6A0', // Potion Emerald
      '#118AB2', // Deep Lagoon
      '#FFD670', // Star Gold
      '#FF9770', // Magic Amber
      '#FF70A6', // Pixie Pink
      '#F15BB5', // Unicorn Magic
      '#FEE440', // Golden Rune
      '#D8BBFF', // Dreamy Mauve
      '#B8C0FF', // Nebula Blue
      '#E8AEB7', // Soft Crystal
      '#F7EDE2', // Moonlight Cream
      '#2A0845', // Cosmic Shadow
      '#FFFFFF', // Pure Stardust
      '#00F5D4'  // Magic Glow
    ]
  },
  {
    id: 'cute-animals',
    name: 'Playful Pets & Fur',
    description: 'Fluffy puppy caramel, honey fur, rosy blush, strawberry tongues, and lawn greens',
    colors: [
      '#F4A261', // Golden Honey Fur
      '#E76F51', // Warm Caramel
      '#B08968', // Light Chestnut
      '#7F4F24', // Cinnamon Fur
      '#582F0E', // Dark Chocolate
      '#936639', // Teddy Bear Brown
      '#DDB892', // Warm Sand Fur
      '#EDE0D4', // Soft Almond
      '#FFF3E0', // Cream Puppy Fur
      '#FF4D6D', // Strawberry Tongue
      '#FF8DA1', // Rosy Cheek Pink
      '#FFB3C1', // Soft Ear Pink
      '#52B788', // Fresh Lawn Green
      '#40916C', // Garden Clover
      '#2D6A4F', // Forest Leaf
      '#4EA8DE', // Sunny Sky Blue
      '#0077B6', // Deep Pond Blue
      '#E63946', // Doghouse Cherry
      '#FFD166', // Tennis Ball Gold
      '#F2CC8F', // Biscuit Gold
      '#FFFFFF', // Bone White
      '#2B2D42'  // Charcoal Paw
    ]
  },
  {
    id: 'candy-pop',
    name: 'Candy Pop & Pastels',
    description: 'Sweet, whimsical confectioneries: strawberry milk, cotton candy, and mint sorbet',
    colors: [
      '#FF6F91', // Watermelon Chew
      '#FF8C94', // Strawberry Glaze
      '#FF9AA2', // Cotton Candy
      '#FFB7B2', // Peach Cream
      '#FFDAC1', // Vanilla Butter
      '#FFE57F', // Lemon Drop
      '#F9F871', // Banana Taffy
      '#E2F0CB', // Sweet Pistachio
      '#B5EAD7', // Fresh Spearmint
      '#A0E7E5', // Icy Blue Mint
      '#B4F8C8', // Key Lime
      '#C7CEEA', // Blue Raspberry
      '#80D8FF', // Frosty Berry
      '#B388FF', // Lavender Swirl
      '#F3C4FB', // Sugar Plum
      '#E5B3FE', // Grape Macaron
      '#D65DB1', // Bright Bubblegum
      '#FFAAA6', // Coral Macaron
      '#FBE7C6', // Marshmallow
      '#FFFFFF', // Royal Icing
      '#FFB5E8', // Sweet Blossom
      '#845EC2'  // Deep Berry
    ]
  },
  {
    id: 'tropical-neon',
    name: 'Tropical Neon Glow',
    description: 'High-voltage electric vivids: neon pink, laser lime, fluorescent cyan, and solar yellow',
    colors: [
      '#FF007F', // Hot Electric Pink
      '#FF0055', // Neon Cherry
      '#FF5722', // High-Voltage Coral
      '#FF9100', // Neon Tangerine
      '#FFFF00', // Laser Yellow
      '#76FF03', // Acid Lime
      '#39FF14', // Radioactive Neon Green
      '#00FFCC', // Electric Mint
      '#00FFFF', // High-Voltage Cyan
      '#00B0FF', // Vivid Electric Blue
      '#2979FF', // Royal Laser Blue
      '#651FFF', // Deep Ultraviolet
      '#BF00FF', // Neon Purple
      '#D500F9', // Fluorescent Magenta
      '#F50057', // Neon Berry
      '#00E676', // Neon Emerald
      '#FFC107', // Solar Flare
      '#7C4DFF', // Neon Twilight
      '#00E5FF', // Bright Lagoon
      '#1DE9B6', // Neon Turquoise
      '#FFFFFF', // Pure Laser Light
      '#0D0221'  // Void Black
    ]
  },
  {
    id: 'jewel-crystals',
    name: 'Jewel & Crystal Treasures',
    description: 'Precious sparkling gemstone tones: glowing ruby, royal sapphire, and emerald',
    colors: [
      '#9B111E', // Royal Ruby
      '#C41E3A', // Cardinal Red
      '#D62828', // Scarlet Gem
      '#6A0DAD', // Imperial Amethyst
      '#8A2BE2', // Bright Purple Gem
      '#9370DB', // Medium Orchid
      '#0F52BA', // Royal Sapphire
      '#00356B', // Deep Lapis
      '#4169E1', // Brilliant Azure
      '#50C878', // Radiant Emerald
      '#097969', // Deep Forest Jade
      '#2E8B57', // Sea Glass Emerald
      '#00CED1', // Turquoise Crystal
      '#7FFFD4', // Aquamarine Gem
      '#FFBF00', // Golden Amber
      '#FFD700', // Pure Citrine Gold
      '#FFA500', // Fire Topaz
      '#E0AAFF', // Lilac Crystal
      '#FDE2E4', // Rose Quartz
      '#FFFDD0', // Lustrous Pearl
      '#FFFFFF', // Diamond Brilliance
      '#14213D'  // Black Onyx
    ]
  }
];

export function getPaletteById(id: string): ColorPalette {
  return PALETTES.find(p => p.id === id) || PALETTES[0];
}
