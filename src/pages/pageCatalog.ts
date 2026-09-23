import { PageMetadata } from '../engine/types.js';

export const PAGES: PageMetadata[] = [
  {
    id: 'puppy-playtime',
    title: 'Playful Puppy',
    category: 'Animals',
    difficulty: 'Gentle',
    description: 'A cheerful, adorable puppy with big sparkling eyes, tennis ball, and cute doghouse in the garden.',
    imageUrl: '/pages/puppy-playtime.jpg'
  },
  {
    id: 'kitten-yarn',
    title: 'Kitten & Butterfly',
    category: 'Animals',
    difficulty: 'Gentle',
    description: 'An adorable fluffy kitten playing with a ball of yarn among garden tulips and fluttery butterflies.',
    imageUrl: '/pages/kitten-yarn.jpg'
  },
  {
    id: 'bunny-carrot',
    title: 'Fluffy Bunny & Carrot',
    category: 'Animals',
    difficulty: 'Gentle',
    description: 'A happy, sweet bunny rabbit hugging a giant crunchy carrot surrounded by smiling sunflowers.',
    imageUrl: '/pages/bunny-carrot.jpg'
  },
  {
    id: 'baby-panda',
    title: 'Cheerful Baby Panda',
    category: 'Animals',
    difficulty: 'Gentle',
    description: 'A joyful baby panda happily holding sweet bamboo stalks in a flowering blossom grove.',
    imageUrl: '/pages/baby-panda.jpg'
  },
  {
    id: 'fox-autumn',
    title: 'Woodland Little Fox',
    category: 'Animals',
    difficulty: 'Gentle',
    description: 'A friendly little fox with a big fluffy tail sitting in an autumn forest with acorns and mushrooms.',
    imageUrl: '/pages/fox-autumn.jpg'
  },
  {
    id: 'lion-cub',
    title: 'Savanna Lion Cub',
    category: 'Animals',
    difficulty: 'Gentle',
    description: 'A playful baby lion cub batting happily at a butterfly under the warm African sunshine.',
    imageUrl: '/pages/lion-cub.jpg'
  },
  {
    id: 'baby-dragon',
    title: 'Starry Baby Dragon',
    category: 'Cartoons',
    difficulty: 'Gentle',
    description: 'A lovable baby dragon with tiny wings sitting on a soft cloud with twinkling stars and moon.',
    imageUrl: '/pages/baby-dragon.jpg'
  },
  {
    id: 'hamster-snack',
    title: 'Chubby Little Hamster',
    category: 'Animals',
    difficulty: 'Gentle',
    description: 'A super cute chubby hamster munching a giant sunflower seed among berries and blooming flowers.',
    imageUrl: '/pages/hamster-snack.jpg'
  },
  {
    id: 'dolphin-ocean',
    title: 'Dolphin & Sea Turtle',
    category: 'Animals',
    difficulty: 'Gentle',
    description: 'A leaping ocean dolphin and smiling baby sea turtle swimming through bubbly waves with starfish.',
    imageUrl: '/pages/dolphin-ocean.jpg'
  }
];

export function getPageById(id: string): PageMetadata {
  return PAGES.find(p => p.id === id) || PAGES[0];
}
