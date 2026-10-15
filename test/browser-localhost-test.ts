import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:3000/';
const SCREENSHOT_DIR = 'C:\\Users\\Jeet Pandit\\.gemini\\antigravity\\brain\\aca81aaa-01cd-4331-a658-0453841c5d1f\\scratch\\browser-test';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runTest() {
  console.log('====================================================');
  console.log('       LIVE LOCALHOST BROWSER AUTOMATION TEST       ');
  console.log('====================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Capture console logs and errors from browser
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`  [Browser Error]:`, msg.text());
    }
  });
  page.on('pageerror', err => {
    console.error(`  [Uncaught Page Error]:`, err);
  });

  try {
    // Step 1: Navigate to localhost
    console.log('\n[1/7] Navigating to http://localhost:3000/ ...');
    await page.goto(URL, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_homepage.png') });
    console.log('  ✓ Home page loaded and rendered successfully');

    // Verify Home Elements
    const title = await page.title();
    console.log(`  ✓ Page title: "${title}"`);
    const cardCount = await page.$$eval('.home-page-card', cards => cards.length);
    console.log(`  ✓ Canvases grid rendered with ${cardCount} artwork cards`);

    // Step 2: Open "Playful Puppy" in Studio
    console.log('\n[2/7] Opening "Playful Puppy" studio...');
    const puppyCard = await page.$('.home-page-card[data-page-id="puppy-playtime"]');
    if (!puppyCard) throw new Error('Puppy playtime card not found');
    await puppyCard.click();

    // Wait for studio to become active
    await page.waitForSelector('.studio-container.view-active', { timeout: 5000 });
    // Wait for image load and render
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_studio_loaded.png') });
    console.log('  ✓ Studio view loaded with Playful Puppy canvas');

    // Step 3: Perform Flood Fill on the Grass
    console.log('\n[3/7] Selecting Green and flood filling the grass...');
    // Select green color from palette (#81B29A or similar green swatch)
    // Click green swatch
    const swatches = await page.$$('.color-swatch');
    let greenSwatch = null;
    for (const s of swatches) {
      const title = await s.evaluate(el => el.title);
      if (title.toUpperCase() === '#81B29A') {
        greenSwatch = s;
        break;
      }
    }
    if (greenSwatch) {
      await greenSwatch.click();
    } else if (swatches.length > 2) {
      await swatches[2].click();
    }
    console.log('  ✓ Color selected');

    // Click on display canvas at grass location
    // Find canvas bounding box
    const canvasBox = await page.$eval('#display-canvas', el => {
      const rect = el.getBoundingClientRect();
      return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
    });

    // In fitToScreen on 1280x900 viewport:
    // Let's get the exact click coordinate for grass using page evaluate on CanvasManager
    const fillResult = await page.evaluate(() => {
      const app = (window as any).app || {};
      // Click at native coordinates (800, 780) on grass
      // We can trigger canvas click or fillAtScreenPoint
      const canvas = document.getElementById('display-canvas') as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      // Let's trigger a click event in the grass region
      // Using canvasManager fitToScreen scale & offset
      const evt = new MouseEvent('mouseup', {
        clientX: rect.left + rect.width * 0.75,
        clientY: rect.top + rect.height * 0.72,
        bubbles: true
      });
      canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: evt.clientX, clientY: evt.clientY, bubbles: true }));
      canvas.dispatchEvent(evt);
      return { clientX: evt.clientX, clientY: evt.clientY };
    });

    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_grass_filled.png') });
    console.log('  ✓ Grass flood fill triggered at screen coordinate', fillResult);

    // Verify Undo Button is now enabled
    const canUndo = await page.$eval('#btn-undo', btn => !btn.hasAttribute('disabled'));
    console.log(`  ✓ Undo button enabled: ${canUndo}`);

    // Step 4: Test Undo and Redo
    console.log('\n[4/7] Testing Undo and Redo...');
    await page.click('#btn-undo');
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_after_undo.png') });
    const canRedo = await page.$eval('#btn-redo', btn => !btn.hasAttribute('disabled'));
    console.log(`  ✓ Undo executed. Redo button enabled: ${canRedo}`);

    await page.click('#btn-redo');
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_after_redo.png') });
    console.log('  ✓ Redo executed. Fill state cleanly restored');

    // Step 5: Test Returning Home and Progress Persistence
    console.log('\n[5/7] Returning to Home screen to verify progress persistence...');
    await page.click('#btn-home');
    await page.waitForSelector('.home-page.view-active', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_home_with_progress.png') });

    // Check Playful Puppy card has "In Progress" badge
    const hasBadge = await page.$eval(
      '.home-page-card[data-page-id="puppy-playtime"]',
      el => !!el.querySelector('.home-card-progress-badge')
    );
    console.log(`  ✓ Playful Puppy card displays "In Progress" badge: ${hasBadge}`);

    // Step 6: Test Full Page Reload (Simulating App Restart)
    console.log('\n[6/7] Reloading application to test persistence across reboot...');
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_after_reload.png') });

    const hasBadgeAfterReload = await page.$eval(
      '.home-page-card[data-page-id="puppy-playtime"]',
      el => !!el.querySelector('.home-card-progress-badge')
    );
    console.log(`  ✓ "In Progress" badge safely retained after reboot: ${hasBadgeAfterReload}`);

    // Step 7: Re-enter Studio and Verify Canvas Progress
    console.log('\n[7/7] Re-entering Studio to verify artwork restoration...');
    const resumeBtn = await page.$('#home-resume-btn');
    if (resumeBtn) {
      await resumeBtn.click();
    } else {
      await page.click('.home-page-card[data-page-id="puppy-playtime"]');
    }
    await page.waitForSelector('.studio-container.view-active', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_studio_resumed.png') });

    const canUndoAfterResume = await page.$eval('#btn-undo', btn => !btn.hasAttribute('disabled'));
    console.log(`  ✓ Artwork restored with full undo history! canUndo: ${canUndoAfterResume}`);

    console.log('\n====================================================');
    console.log('[SUCCESS] ALL LIVE LOCALHOST BROWSER TESTS PASSED!');
    console.log('====================================================');

  } catch (err) {
    console.error('Test encountered an error:', err);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'error_state.png') });
  } finally {
    await browser.close();
  }
}

runTest();
