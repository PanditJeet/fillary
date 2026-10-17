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
    const num = parseInt(hex.slice(0, 6), 16);
    if (!isNaN(num)) {
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
        a: 255
      };
    }
  }

  // Fallback default
  return { r: 0, g: 0, b: 0, a: 255 };
}

/**
 * Packs RGBA into a single 32-bit unsigned integer matching system endianness.
 */
export function packRGBA(r: number, g: number, b: number, a = 255): number {
  if (isLittleEndian) {
    return (((a & 0xff) << 24) | ((b & 0xff) << 16) | ((g & 0xff) << 8) | (r & 0xff)) >>> 0;
  } else {
    return (((r & 0xff) << 24) | ((g & 0xff) << 16) | ((b & 0xff) << 8) | (a & 0xff)) >>> 0;
  }
}

export function hexToPacked(hex: string): number {
  const c = parseColor(hex);
  return packRGBA(c.r, c.g, c.b, c.a);
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
  maxRadius = 8
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
 * Exact record of the pixels a fill changed, used for compact undo/redo.
 */
export interface FillDiff {
  indices: Uint32Array;
  before: Uint32Array;
  after: number;
}

// Reusable scratch buffers (avoid allocating megabytes on every tap)
let scratchIdx = new Uint32Array(0);
let scratchBefore = new Uint32Array(0);
let scratchTouched = new Uint8Array(0);

function ensureScratch(len: number): void {
  if (scratchIdx.length < len) {
    scratchIdx = new Uint32Array(len);
    scratchBefore = new Uint32Array(len);
    scratchTouched = new Uint8Array(len);
  }
}

/** Number of pixel rings to extend a fill into invisible "gap seal" pixels next to lines. */
const GAP_BLEED_PASSES = 3;

/**
 * A tiny enclosed pocket (e.g. the sliver where two thin strokes meet) that is too small
 * to tap. It is colored together with the larger area it borders (`anchor` is a pixel
 * in that area).
 */
export interface TinyRegion {
  anchor: number;
  pixels: Uint32Array;
}

/**
 * Scanline flood fill on a packed 32-bit color buffer, respecting the line-art mask.
 *
 * `gapMask` marks pixels that block the fill (to seal tiny gaps in the line art)
 * but are NOT drawn as visible lines. After the main fill, those pixels are colored
 * if they touch the filled area, so no white specks remain beside the lines.
 *
 * Returns the exact pixel diff, or null if nothing changed.
 */
export function floodFillDiff(
  color32: Uint32Array,
  width: number,
  height: number,
  lineArtMask: Uint8Array,
  startX: number,
  startY: number,
  fillColor: number,
  gapMask?: Uint8Array,
  tinyRegions?: TinyRegion[]
): FillDiff | null {
  const validPoint = findNearestFillablePixel(startX, startY, width, height, lineArtMask, 5);
  if (!validPoint) return null;

  const targetX = validPoint.x;
  const targetY = validPoint.y;
  const startIndex = targetY * width + targetX;
  const targetColor = color32[startIndex];

  if (targetColor === fillColor) {
    return null; // Already the selected color
  }

  ensureScratch(width * height);
  const idxBuf = scratchIdx;
  const beforeBuf = scratchBefore;
  const touched = scratchTouched;
  let n = 0;

  let minX = targetX, maxX = targetX, minY = targetY, maxY = targetY;

  const stack: number[] = [targetX, targetY];

  while (stack.length > 0) {
    const y = stack.pop()!;
    const x = stack.pop()!;

    const lineOffset = y * width;
    const idx = lineOffset + x;

    if (color32[idx] !== targetColor || lineArtMask[idx] === 1) {
      continue;
    }

    let x1 = x;
    while (x1 > 0 && lineArtMask[lineOffset + x1 - 1] === 0 && color32[lineOffset + x1 - 1] === targetColor) {
      x1--;
    }

    let x2 = x;
    while (x2 < width - 1 && lineArtMask[lineOffset + x2 + 1] === 0 && color32[lineOffset + x2 + 1] === targetColor) {
      x2++;
    }

    for (let fillX = x1; fillX <= x2; fillX++) {
      const i = lineOffset + fillX;
      idxBuf[n] = i;
      beforeBuf[n] = color32[i];
      n++;
      color32[i] = fillColor;
      touched[i] = 1;
    }

    if (x1 < minX) minX = x1;
    if (x2 > maxX) maxX = x2;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;

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

  // Color tiny pockets that belong to the area just filled
  if (tinyRegions && n > 0) {
    for (const t of tinyRegions) {
      if (touched[t.anchor] !== 1) continue;
      const px = t.pixels;
      for (let k = 0; k < px.length; k++) {
        const i = px[k];
        if (touched[i] === 1) continue;
        idxBuf[n] = i;
        beforeBuf[n] = color32[i];
        n++;
        color32[i] = fillColor;
        touched[i] = 1;
        const x = i % width, y = (i / width) | 0;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Extend color into invisible gap-seal pixels adjacent to the filled area (max 3px deep)
  if (gapMask && n > 0) {
    const pending: number[] = [];
    for (let pass = 1; pass <= GAP_BLEED_PASSES; pass++) {
      const y0 = Math.max(0, minY - pass);
      const y1 = Math.min(height - 1, maxY + pass);
      const xa = Math.max(0, minX - pass);
      const xb = Math.min(width - 1, maxX + pass);
      pending.length = 0;
      for (let y = y0; y <= y1; y++) {
        const off = y * width;
        for (let x = xa; x <= xb; x++) {
          const i = off + x;
          if (gapMask[i] !== 1 || touched[i] === 1) continue;
          if (
            (x > 0 && touched[i - 1] === 1) ||
            (x < width - 1 && touched[i + 1] === 1) ||
            (y > 0 && touched[i - width] === 1) ||
            (y < height - 1 && touched[i + width] === 1)
          ) {
            pending.push(i);
          }
        }
      }
      if (pending.length === 0) break;
      for (const i of pending) {
        idxBuf[n] = i;
        beforeBuf[n] = color32[i];
        n++;
        color32[i] = fillColor;
        touched[i] = 1;
      }
    }
  }

  // Reset scratch "touched" flags for next fill
  for (let k = 0; k < n; k++) touched[idxBuf[k]] = 0;

  if (n === 0) return null;

  return {
    indices: idxBuf.slice(0, n),
    before: beforeBuf.slice(0, n),
    after: fillColor
  };
}

/**
 * Convenience wrapper operating on ImageData with a hex color.
 * @returns boolean indicating if any pixels were modified.
 */
export function scanlineFloodFill(
  colorImageData: ImageData,
  lineArtMask: Uint8Array,
  startX: number,
  startY: number,
  newColorHex: string,
  gapMask?: Uint8Array,
  tinyRegions?: TinyRegion[]
): boolean {
  const color32 = new Uint32Array(
    colorImageData.data.buffer,
    colorImageData.data.byteOffset,
    colorImageData.data.byteLength >> 2
  );
  return floodFillDiff(
    color32,
    colorImageData.width,
    colorImageData.height,
    lineArtMask,
    startX,
    startY,
    hexToPacked(newColorHex),
    gapMask,
    tinyRegions
  ) !== null;
}
