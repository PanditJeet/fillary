export interface Point {
  x: number;
  y: number;
}

export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FillAction {
  pageId: string;
  x: number;
  y: number;
  color: string;
  timestamp: number;
}

export interface PageMetadata {
  id: string;
  title: string;
  category: 'Animals' | 'Human Cartoons' | 'Mystical';
  difficulty: 'Gentle' | 'Harmonic' | 'Intricate';
  description: string;
  svgContent?: string;
  imageUrl?: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  colors: string[];
}

export interface ViewportTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}
