import { RGBAColor } from './types.js';

// Determine host platform endianness for Uint32Array color packing
const isLittleEndian = (() => {
  const buffer = new ArrayBuffer(4);
  const uint8 = new Uint8Array(buffer);
  const uint32 = new Uint32Array(buffer);
  uint32[0] = 0x12345678;
  return uint8[0] === 0x78;
})();

/**
 * Converts a hex string or CSS color to an RGBA object.
 */
export function parseColor(colorStr: string): RGBAColor {
  if (colorStr.startsWith('#')) {
    let hex = colorStr.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
      a: 255
    };
  }

  // Fallback default
  return { r: 0, g: 0, b: 0, a: 255 };
}

/**
 * Packs RGBA into a single 32-bit integer matching system endianness.
 */
export function packRGBA(r: number, g: number, b: number, a = 255): number {
  if (isLittleEndian) {
    return ((a & 0xff) << 24) | ((b & 0xff) << 16) | ((g & 0xff) << 8) | (r & 0xff);
  } else {
    return ((r & 0xff) << 24) | ((g & 0xff) << 16) | ((b & 0xff) << 8) | (a & 0xff);
  }
}

/**
 * Finds the closest non-boundary pixel within a small radius
 * to make touch/tap forgiving if user taps slightly on line-art edge.
 */
export function findNearestFillablePixel(
  startX: number,
  startY: number,
  width: number,
  height: number,
  lineArtMask: Uint8Array,
  maxRadius = 4
): { x: number; y: number } | null {
  const index = startY * width + startX;
  if (lineArtMask[index] === 0) {
    return { x: startX, y: startY };
  }

  // Search expanding ring
  for (let r = 1; r <= maxRadius; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        const nx = startX + dx;
        const ny = startY + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = ny * width + nx;
          if (lineArtMask[nIdx] === 0) {
            return { x: nx, y: ny };
          }
        }
      }
    }
  }

  return null;
}

/**
 * Scanline Flood Fill implementation.
 * Operates on color ImageData buffer, respecting precomputed lineArtMask boundaries.
 * 
 * @returns boolean indicating if any pixels were modified.
 */
export function scanlineFloodFill(
  colorImageData: ImageData,
  lineArtMask: Uint8Array,
  startX: number,
  startY: number,
  newColorHex: string
): boolean {
  const width = colorImageData.width;
  const height = colorImageData.height;

  // Forgiving tap target resolution
  const validPoint = findNearestFillablePixel(startX, startY, width, height, lineArtMask, 5);
  if (!validPoint) return false;

  const targetX = validPoint.x;
  const targetY = validPoint.y;

  const color32 = new Uint32Array(colorImageData.data.buffer);
  const startIndex = targetY * width + targetX;

  const targetColor = color32[startIndex];
  const rgba = parseColor(newColorHex);
  const fillColor = packRGBA(rgba.r, rgba.g, rgba.b, rgba.a);

  if (targetColor === fillColor) {
    return false; // Already the selected color
  }

  // Stack of [x, y] coordinates
  const stack: number[] = [targetX, targetY];

  while (stack.length > 0) {
    const y = stack.pop()!;
    const x = stack.pop()!;

    let lineOffset = y * width;
    let idx = lineOffset + x;

    // Skip if pixel no longer matches or is blocked
    if (color32[idx] !== targetColor || lineArtMask[idx] === 1) {
      continue;
    }

    // Find leftmost boundary of continuous span
    let x1 = x;
    while (x1 > 0 && lineArtMask[lineOffset + x1 - 1] === 0 && color32[lineOffset + x1 - 1] === targetColor) {
      x1--;
    }

    // Find rightmost boundary of continuous span
    let x2 = x;
    while (x2 < width - 1 && lineArtMask[lineOffset + x2 + 1] === 0 && color32[lineOffset + x2 + 1] === targetColor) {
      x2++;
    }

    // Fill current span
    for (let fillX = x1; fillX <= x2; fillX++) {
      color32[lineOffset + fillX] = fillColor;
    }

    // Check row above (y - 1)
    if (y > 0) {
      const prevLineOffset = (y - 1) * width;
      let inSpan = false;
      for (let checkX = x1; checkX <= x2; checkX++) {
        const checkIdx = prevLineOffset + checkX;
        const matches = lineArtMask[checkIdx] === 0 && color32[checkIdx] === targetColor;
        if (!inSpan && matches) {
          stack.push(checkX, y - 1);
          inSpan = true;
        } else if (inSpan && !matches) {
          inSpan = false;
        }
      }
    }

    // Check row below (y + 1)
    if (y < height - 1) {
      const nextLineOffset = (y + 1) * width;
      let inSpan = false;
      for (let checkX = x1; checkX <= x2; checkX++) {
        const checkIdx = nextLineOffset + checkX;
        const matches = lineArtMask[checkIdx] === 0 && color32[checkIdx] === targetColor;
        if (!inSpan && matches) {
          stack.push(checkX, y + 1);
          inSpan = true;
        } else if (inSpan && !matches) {
          inSpan = false;
        }
      }
    }
  }

  return true;
}
