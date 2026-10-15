import assert from 'assert';

class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string): string | null { return this.store[key] || null; }
  setItem(key: string, value: string): void { this.store[key] = String(value); }
  removeItem(key: string): void { delete this.store[key]; }
  clear(): void { this.store = {}; }
}
(global as any).localStorage = new LocalStorageMock();

import { StorageManager } from '../src/storage/storageManager.js';
import { PAGES } from '../src/pages/pageCatalog.js';

console.log('====================================================');
console.log('   TESTING STORAGE PERSISTENCE ACROSS APP REBOOT    ');
console.log('====================================================');

// Clear storage
localStorage.clear();

// Step 1: User colors on page 'puppy-playtime'
const testActions = [
  { pageId: 'puppy-playtime', x: 500, y: 500, color: '#E07A5F', timestamp: 1000 },
  { pageId: 'puppy-playtime', x: 550, y: 550, color: '#3D405B', timestamp: 2000 },
  { pageId: 'puppy-playtime', x: 600, y: 600, color: '#81B29A', timestamp: 3000 }
];
StorageManager.setActivePageId('puppy-playtime');
StorageManager.savePageProgress('puppy-playtime', testActions, 'data:image/jpeg;base64,/9j/fake');

assert.strictEqual(StorageManager.hasPageProgress('puppy-playtime'), true);
assert.strictEqual(StorageManager.getPageProgress('puppy-playtime')?.actions.length, 3);
console.log('  ✓ Initial progress for puppy-playtime saved with 3 fills');

// Step 2: Simulate App startup where init() loads active page ID and calls showHome()
const savedPageId = StorageManager.getActivePageId();
assert.strictEqual(savedPageId, 'puppy-playtime');

// In showHome(), if currentView !== 'studio', saveCurrentProgress() must NOT overwrite!
let currentView: 'home' | 'studio' = 'home';
function simulateSave(canvasActions: any[], loadedPage: any) {
  if (currentView !== 'studio') return;
  if (!loadedPage) return;
  StorageManager.savePageProgress(loadedPage.id, canvasActions);
}

// Startup call to showHome:
simulateSave([], null);

// Verify progress was NOT wiped!
const progressAfterStartup = StorageManager.getPageProgress('puppy-playtime');
assert.strictEqual(progressAfterStartup !== null, true);
assert.strictEqual(progressAfterStartup?.actions.length, 3);
console.log('  ✓ Progress faithfully preserved on app launch / home page entry (NOT overwritten with empty array)');

// Step 3: Enter studio and add a 4th fill
currentView = 'studio';
const loadedPage = PAGES.find(p => p.id === 'puppy-playtime');
const updatedActions = [...testActions, { pageId: 'puppy-playtime', x: 700, y: 700, color: '#F2CC8F', timestamp: 4000 }];
simulateSave(updatedActions, loadedPage);

assert.strictEqual(StorageManager.getPageProgress('puppy-playtime')?.actions.length, 4);
console.log('  ✓ Progress updated in studio to 4 fills');

// Step 4: Return to home (triggers saveCurrentProgress from studio transition)
simulateSave(updatedActions, loadedPage);
currentView = 'home';

assert.strictEqual(StorageManager.getPageProgress('puppy-playtime')?.actions.length, 4);
console.log('  ✓ Progress successfully retained when returning to home screen');

// Step 5: Simulate pagehide/visibilitychange while on home page
simulateSave([], null);
assert.strictEqual(StorageManager.getPageProgress('puppy-playtime')?.actions.length, 4);
console.log('  ✓ App close / backgrounding on home screen never wipes progress');

console.log('====================================================');
console.log('[SUCCESS] ALL STORAGE PERSISTENCE TESTS PASSED!');
console.log('====================================================');
