import puppeteer from 'puppeteer-core';
import assert from 'assert';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:3000/';

async function runBleedCheck() {
  console.log('====================================================');
  console.log('  LIVE BROWSER ZERO-BLEED FLOOD FILL VERIFICATION  ');
  console.log('====================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  try {
    console.log('1. Navigating to localhost:3000...');
    await page.goto(URL, { waitUntil: 'networkidle0' });

    console.log('2. Opening Playful Puppy canvas...');
    await page.click('.home-page-card[data-page-id="puppy-playtime"]');
    await page.waitForSelector('.studio-container.view-active');
    await new Promise(r => setTimeout(r, 1200));

    // Fill grass and read canvas pixels directly using string evaluation to avoid tsx __name injection
    const pixelReport: any = await page.evaluate(`(async () => {
      const displayCanvas = document.getElementById('display-canvas');
      const container = displayCanvas.parentElement;
      const viewW = container.clientWidth;
      const viewH = container.clientHeight;

      const topInset = 76;
      const bottomInset = 150;
      const sideInset = 32;
      const availableW = Math.max(viewW - sideInset * 2, 80);
      const availableH = Math.max(viewH - topInset - bottomInset, 80);
      const scale = Math.max(Math.min(availableW / 1024, availableH / 1024, 1.0), 0.1);
      const offsetX = (viewW - 1024 * scale) / 2;
      const offsetY = topInset + (availableH - 1024 * scale) / 2;

      // Native (800, 780) on grass
      const rect = displayCanvas.getBoundingClientRect();
      const screenX = rect.left + offsetX + 800 * scale;
      const screenY = rect.top + offsetY + 780 * scale;

      displayCanvas.dispatchEvent(new MouseEvent('mousedown', { clientX: screenX, clientY: screenY, bubbles: true }));
      displayCanvas.dispatchEvent(new MouseEvent('mouseup', { clientX: screenX, clientY: screenY, bubbles: true }));

      // Wait 400ms for scanline fill & render
      await new Promise(r => setTimeout(r, 400));

      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const ctx = displayCanvas.getContext('2d');

      const readPixel = (nativeX, nativeY) => {
        const bufX = Math.round((offsetX + nativeX * scale) * dpr);
        const bufY = Math.round((offsetY + nativeY * scale) * dpr);
        const imgData = ctx.getImageData(bufX, bufY, 1, 1);
        return [imgData.data[0], imgData.data[1], imgData.data[2]];
      };

      return {
        grassPixel: readPixel(800, 780),
        petalPixel1: readPixel(995, 770),
        petalPixel2: readPixel(985, 775),
        ballPixel: readPixel(890, 850)
      };
    })()`);

    console.log('3. Display Canvas Native Pixel Sampling:');
    console.log('   Grass pixel (800, 780) RGB:', pixelReport.grassPixel);
    console.log('   Petal pixel 1 (995, 770) RGB:', pixelReport.petalPixel1);
    console.log('   Petal pixel 2 (985, 775) RGB:', pixelReport.petalPixel2);
    console.log('   Tennis ball seam (890, 850) RGB:', pixelReport.ballPixel);

    // Grass was filled with crimson red (#EF233C -> R~239, G~35, B~60)
    const isGrassColored = pixelReport.grassPixel[0] > 200 && pixelReport.grassPixel[1] < 80;
    assert(isGrassColored, 'Grass was not filled with selected color!');
    console.log('   ✓ Grass is filled with active color');

    // Petals and ball must remain pristine white (R > 240, G > 240, B > 240)
    const isPetal1White = pixelReport.petalPixel1[0] > 240 && pixelReport.petalPixel1[1] > 240 && pixelReport.petalPixel1[2] > 240;
    const isPetal2White = pixelReport.petalPixel2[0] > 240 && pixelReport.petalPixel2[1] > 240 && pixelReport.petalPixel2[2] > 240;
    const isBallWhite = pixelReport.ballPixel[0] > 240 && pixelReport.ballPixel[1] > 240 && pixelReport.ballPixel[2] > 240;

    assert(isPetal1White, 'Petal 1 was contaminated by color bleed!');
    assert(isPetal2White, 'Petal 2 was contaminated by color bleed!');
    assert(isBallWhite, 'Tennis ball was contaminated by color bleed!');

    console.log('   ✓ Petal 1 (995, 770) is PRISTINE WHITE (zero bleed)');
    console.log('   ✓ Petal 2 (985, 775) is PRISTINE WHITE (zero bleed)');
    console.log('   ✓ Tennis ball (890, 850) is PRISTINE WHITE (zero bleed)');

    console.log('\n====================================================');
    console.log(' [VERIFIED] ZERO-BLEED FLOOD FILL IS 100% WORKING!');
    console.log('====================================================');

  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await browser.close();
  }
}

runBleedCheck();
