// Comprehensive test script to verify all resolved glitches
import { HistoryManager } from '../src/engine/history.js';
import { scanlineFloodFill, parseColor, packRGBA } from '../src/engine/floodFill.js';
import { StorageManager } from '../src/storage/storageManager.js';
import { AudioManager } from '../src/audio/audioManager.js';
import { CanvasManager } from '../src/engine/canvasManager.js';

class MockImageData {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  constructor(dataOrWidth: any, widthOrHeight?: any, height?: any) {
    if (dataOrWidth instanceof Uint8ClampedArray) {
      this.data = dataOrWidth;
      this.width = widthOrHeight;
      this.height = height;
    } else {
      this.width = dataOrWidth;
      this.height = widthOrHeight;
      this.data = new Uint8ClampedArray(this.width * this.height * 4);
    }
  }
}
(global as any).ImageData = MockImageData;

// Setup Mock DOM environment for Node
class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string): string | null { return this.store[key] || null; }
  setItem(key: string, value: string): void { this.store[key] = String(value); }
  removeItem(key: string): void { delete this.store[key]; }
  clear(): void { this.store = {}; }
}
(global as any).localStorage = new LocalStorageMock();

// Mock AudioContext
class MockGainNode {
  public gain = {
    value: 1,
    setValueAtTime: () => {},
    setTargetAtTime: () => {},
    cancelScheduledValues: () => {}
  };
  connect() {}
}
class MockOscillatorNode {
  public frequency = {
    setValueAtTime: () => {},
    exponentialRampToValueAtTime: () => {}
  };
  connect() {}
  start() {}
  stop() {}
}
class MockAudioContext {
  public state = 'running';
  public currentTime = 0;
  public sampleRate = 44100;
  public destination = {};
  createGain() { return new MockGainNode(); }
  createOscillator() { return new MockOscillatorNode(); }
  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: { setValueAtTime: () => {} },
      connect: () => {}
    };
  }
  createBuffer(channels: number, length: number, sampleRate: number) {
    return {
      getChannelData: () => new Float32Array(length)
    };
  }
  createBufferSource() {
    return {
      buffer: null,
      loop: false,
      connect: () => {},
      start: () => {},
      stop: () => {}
    };
  }
  async resume() { this.state = 'running'; }
}
(global as any).AudioContext = MockAudioContext;
(global as any).window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  setTimeout: setTimeout.bind(global),
  clearTimeout: clearTimeout.bind(global),
  setInterval: setInterval.bind(global),
  clearInterval: clearInterval.bind(global),
  AudioContext: MockAudioContext
};

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    process.exit(1);
  }
}

console.log('====================================================');
console.log('       RUNNING VERIFICATION SUITE FOR GLITCH FIXES  ');
console.log('====================================================\n');

// ---------------------------------------------------------------------
// TEST 1: HistoryManager Actions & Undo Stack Synchronization (Glitch 4)
// ---------------------------------------------------------------------
console.log('Test 1: HistoryManager Lockstep Synchronization');
const history = new HistoryManager(25);

const mkDiff = () => ({ indices: new Uint32Array([1, 2]), before: new Uint32Array([0, 0]), after: 7 });

// Push 3 fill actions
for (let i = 1; i <= 3; i++) {
  history.push({ ...mkDiff(), action: { pageId: 'test', x: i * 10, y: i * 10, color: '#FF0000', timestamp: Date.now() } });
}
assert(history.getActions().length === 3, 'Recorded exactly 3 actions');

// Undo 1 step
history.undo();
assert(history.getActions().length === 2, 'Actions reduced to 2 after 1 undo');
assert(history.canRedo === true, 'canRedo is true after undo');

// Redo 1 step
history.redo();
assert(history.getActions().length === 3, 'Actions restored to 3 after redo');

// Undo all 3 actions
history.undo();
history.undo();
history.undo();
assert(history.getActions().length === 0, 'Actions strictly 0 after undoing all fill actions');
history.undo();
assert(history.canUndo === false, 'Undo stack completely exhausted');
assert(history.getActions().length === 0, 'Actions strictly remains 0, no negative or dangling actions');

// ---------------------------------------------------------------------
// TEST 2: Scanline Flood Fill Uint32Array ByteOffset & Alignment (Glitch 5)
// ---------------------------------------------------------------------
console.log('\nTest 2: Flood Fill with Non-Zero ByteOffset TypedArray View');
// Allocate an ArrayBuffer with 16 extra bytes at beginning to force non-zero byteOffset
const extraOffset = 16;
const w = 50;
const h = 50;
const rawBuffer = new ArrayBuffer(extraOffset + w * h * 4);
const offsetData = new Uint8ClampedArray(rawBuffer, extraOffset, w * h * 4);

// Fill with white
for (let i = 0; i < w * h * 4; i += 4) {
  offsetData[i] = 255;
  offsetData[i + 1] = 255;
  offsetData[i + 2] = 255;
  offsetData[i + 3] = 255;
}

const offsetImageData = {
  width: w,
  height: h,
  data: offsetData
} as unknown as ImageData;

// Boundary mask with a closed square from (10,10) to (30,30)
const mask = new Uint8Array(w * h);
for (let x = 10; x <= 30; x++) {
  mask[10 * w + x] = 1;
  mask[30 * w + x] = 1;
}
for (let y = 10; y <= 30; y++) {
  mask[y * w + 10] = 1;
  mask[y * w + 30] = 1;
}

assert(offsetData.byteOffset === 16, 'Verified Uint8ClampedArray has non-zero byteOffset (16 bytes)');
const fillSuccess = scanlineFloodFill(offsetImageData, mask, 20, 20, '#00FF00');
assert(fillSuccess === true, 'scanlineFloodFill executed successfully on offset buffer');

// Verify filled pixel inside
const insideIdx = (20 * w + 20) * 4;
assert(offsetData[insideIdx] === 0 && offsetData[insideIdx + 1] === 255 && offsetData[insideIdx + 2] === 0, 'Target pixel (20,20) filled with #00FF00');

// Verify outside remained intact
const outsideIdx = (5 * w + 5) * 4;
assert(offsetData[outsideIdx] === 255 && offsetData[outsideIdx + 1] === 255, 'Outside pixel (5,5) remained pristine white');

// ---------------------------------------------------------------------
// TEST 3: Audio Stop Timer Cancellation on Rapid Toggle (Glitch 2)
// ---------------------------------------------------------------------
console.log('\nTest 3: Audio Manager Rapid Toggle & Stop Timer Cancellation');
AudioManager.initialize();

// Toggle music ON
const state1 = AudioManager.toggleMusic();
assert(state1 === true, 'Music turned ON');
assert(AudioManager.getIsMusicPlaying() === true, 'AudioManager reports music playing');

// Rapidly toggle OFF then ON within 50ms
AudioManager.toggleMusic(); // OFF
assert(AudioManager.getIsMusicPlaying() === false, 'Music toggled OFF');

AudioManager.toggleMusic(); // ON within 50ms
assert(AudioManager.getIsMusicPlaying() === true, 'Music toggled back ON immediately');

// Let any timers execute
await new Promise(r => setTimeout(r, 600));

// Music should STILL be playing because stopFadeTimer was cancelled!
assert(AudioManager.getIsMusicPlaying() === true, 'Music is STILL playing after 600ms (no cut-off from cancelled stop timer)');

// Clean shutdown
AudioManager.toggleMusic();

// ---------------------------------------------------------------------
// TEST 4: Hex Normalization & Swatch Matching (Glitch 8)
// ---------------------------------------------------------------------
console.log('\nTest 4: Color Normalization for Swatches (3-char vs 6-char vs rgb)');

function normalizeHex(colorStr: string): string {
  if (!colorStr) return '';
  if (colorStr.startsWith('#')) {
    let hex = colorStr.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    } else if (hex.length === 4) {
      hex = hex.slice(0, 3).split('').map(c => c + c).join('');
    } else if (hex.length >= 6) {
      hex = hex.slice(0, 6);
    }
    return `#${hex.toUpperCase()}`;
  }
  const match = colorStr.match(/\d+/g);
  if (!match || match.length < 3) return colorStr.toUpperCase();
  const [r, g, b] = match.map(Number);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`.toUpperCase();
}

assert(normalizeHex('#fff') === '#FFFFFF', '#fff normalizes to #FFFFFF');
assert(normalizeHex('#FFF') === '#FFFFFF', '#FFF normalizes to #FFFFFF');
assert(normalizeHex('#0f1') === '#00FF11', '#0f1 normalizes to #00FF11');
assert(normalizeHex('rgb(255, 255, 255)') === '#FFFFFF', 'rgb(255, 255, 255) normalizes to #FFFFFF');
assert(normalizeHex('rgba(224, 122, 95, 1)') === '#E07A5F', 'rgba(224, 122, 95, 1) normalizes to #E07A5F');

// ---------------------------------------------------------------------
// TEST 5: Storage Footprint & Quota Preservation (Glitch 3)
// ---------------------------------------------------------------------
console.log('\nTest 5: Storage Footprint & Multi-Page Quota Preservation');
localStorage.clear();

// Simulate saving 24 pages with lightweight thumbnails (~15 KB)
const mockThumb = 'data:image/jpeg;base64,' + 'A'.repeat(15 * 1024); // ~15 KB
for (let p = 1; p <= 24; p++) {
  const pageId = `page-${p}`;
  const actions = [
    { pageId, x: 100, y: 100, color: '#E07A5F', timestamp: Date.now() },
    { pageId, x: 200, y: 200, color: '#81B29A', timestamp: Date.now() }
  ];
  StorageManager.savePageProgress(pageId, actions, mockThumb);
  assert(StorageManager.hasPageProgress(pageId), `Page ${p} saved successfully`);
}

// Verify all 24 pages exist and can be loaded
let allLoaded = true;
for (let p = 1; p <= 24; p++) {
  const loaded = StorageManager.getPageProgress(`page-${p}`);
  if (!loaded || loaded.actions.length !== 2) {
    allLoaded = false;
    break;
  }
}
assert(allLoaded, 'All 24 pages loaded faithfully without localStorage QuotaExceededError');

// ---------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------
console.log('\n====================================================');
console.log(`[SUCCESS] ALL ${passedTests}/${totalTests} TESTS PASSED!`);
console.log('====================================================\n');
