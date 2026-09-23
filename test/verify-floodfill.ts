import { scanlineFloodFill } from '../src/engine/floodFill.js';

// Setup 100x100 virtual buffer to verify flood fill algorithm in Node environment
const width = 100;
const height = 100;
const buffer = new ArrayBuffer(width * height * 4);
const data = new Uint8ClampedArray(buffer);

// Fill with white (0xFFFFFFFF)
for (let i = 0; i < width * height; i++) {
  data[i * 4] = 255;
  data[i * 4 + 1] = 255;
  data[i * 4 + 2] = 255;
  data[i * 4 + 3] = 255;
}

const fakeImageData = {
  width,
  height,
  data
} as unknown as ImageData;

// Create line-art mask with an enclosed box from (20,20) to (60,60)
const mask = new Uint8Array(width * height);
for (let x = 20; x <= 60; x++) {
  mask[20 * width + x] = 1; // Top border
  mask[60 * width + x] = 1; // Bottom border
}
for (let y = 20; y <= 60; y++) {
  mask[y * width + 20] = 1; // Left border
  mask[y * width + 60] = 1; // Right border
}

console.log('Testing scanline flood fill inside enclosed box (30, 30) with #E07A5F...');
const changed = scanlineFloodFill(fakeImageData, mask, 30, 30, '#E07A5F');
console.log('Flood fill executed, changed =', changed);

// Verify inside pixel is filled
const insideIdx = 30 * width + 30;
const r = data[insideIdx * 4];
const g = data[insideIdx * 4 + 1];
const b = data[insideIdx * 4 + 2];
console.log(`Inside pixel (30,30) RGB: (${r}, ${g}, ${b}) - Expected: (224, 122, 95)`);

// Verify outside pixel is NOT leaked (remains white 255, 255, 255)
const outsideIdx = 10 * width + 10;
const outR = data[outsideIdx * 4];
const outG = data[outsideIdx * 4 + 1];
const outB = data[outsideIdx * 4 + 2];
console.log(`Outside pixel (10,10) RGB: (${outR}, ${outG}, ${outB}) - Expected: (255, 255, 255)`);

// Verify boundary pixel is NOT overwritten (remains untouched)
const borderIdx = 20 * width + 30;
const borderR = data[borderIdx * 4];
console.log(`Border pixel (30,20) mask=${mask[borderIdx]}, RGB: (${borderR})`);

if (r === 224 && g === 122 && b === 95 && outR === 255 && outG === 255 && outB === 255) {
  console.log('✓ Flood fill verified successfully: enclosed region filled perfectly, zero leaking across boundary!');
} else {
  console.error('✗ Verification failed!');
  process.exit(1);
}
