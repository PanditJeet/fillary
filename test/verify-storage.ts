// Mock localStorage for Node environment
class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

(global as any).localStorage = new LocalStorageMock();

import { StorageManager } from '../src/storage/storageManager.js';

console.log('Testing StorageManager auto-save functionality:');

// 1. Initial empty state
const testPageId = 'test-page-1';
if (StorageManager.hasPageProgress(testPageId)) {
  console.error('FAIL: Expected no progress initially');
  process.exit(1);
}
console.log('✓ Initial empty state verified.');

// 2. Save progress with dataUrl & actions
const mockActions = [
  { pageId: testPageId, x: 100, y: 150, color: '#FF5722', timestamp: Date.now() },
  { pageId: testPageId, x: 200, y: 250, color: '#4CAF50', timestamp: Date.now() }
];
const mockDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

StorageManager.savePageProgress(testPageId, mockActions, mockDataUrl);

if (!StorageManager.hasPageProgress(testPageId)) {
  console.error('FAIL: Expected hasPageProgress to be true');
  process.exit(1);
}
console.log('✓ hasPageProgress verified after save.');

// 3. Load progress
const loaded = StorageManager.getPageProgress(testPageId);
if (!loaded || loaded.actions.length !== 2 || loaded.dataUrl !== mockDataUrl) {
  console.error('FAIL: Loaded progress does not match saved state', loaded);
  process.exit(1);
}
console.log('✓ getPageProgress restored pixel snapshot and actions faithfully.');

// 4. Legacy format fallback
localStorage.setItem('fillary_page_legacy', JSON.stringify(mockActions));
const legacyLoaded = StorageManager.getPageProgress('legacy');
if (!legacyLoaded || legacyLoaded.actions.length !== 2) {
  console.error('FAIL: Legacy array format not parsed correctly');
  process.exit(1);
}
console.log('✓ Legacy format backwards-compatibility verified.');

// 5. Clear page progress
StorageManager.clearPageProgress(testPageId);
if (StorageManager.hasPageProgress(testPageId)) {
  console.error('FAIL: Expected progress to be removed after clearPageProgress');
  process.exit(1);
}
console.log('✓ clearPageProgress verified.');

console.log('\nAll storage auto-save tests passed successfully!');
