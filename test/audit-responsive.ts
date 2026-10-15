import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:3000/';
const OUT_DIR = 'C:\\Users\\Jeet Pandit\\.gemini\\antigravity\\brain\\aca81aaa-01cd-4331-a658-0453841c5d1f\\scratch\\responsive-audit';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'mobile_portrait_iphone', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: 'mobile_portrait_small', width: 360, height: 740, isMobile: true, hasTouch: true },
  { name: 'mobile_landscape', width: 844, height: 390, isMobile: true, hasTouch: true },
  { name: 'tablet_portrait', width: 768, height: 1024, isMobile: true, hasTouch: true },
  { name: 'desktop', width: 1280, height: 800, isMobile: false, hasTouch: false }
];

async function auditResponsive() {
  console.log('Auditing responsiveness across device viewports...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const vp of VIEWPORTS) {
    console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile, hasTouch: vp.hasTouch });

    // 1. Home Page
    await page.goto(URL, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}_01_home.png`) });

    // Check horizontal scroll on body/html/container (overflow glitch)
    const homeOverflow = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const bodyW = document.body.scrollWidth;
      return { docW, winW, bodyW, hasHScroll: docW > winW || bodyW > winW };
    });
    console.log(`  Home horizontal overflow:`, homeOverflow);

    // 2. Open Studio
    await page.click('.home-page-card[data-page-id="puppy-playtime"]');
    await page.waitForSelector('.studio-container.view-active', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}_02_studio.png`) });

    // Check studio layout: header overlap, palette overlap, canvas visibility
    const studioMetrics = await page.evaluate(() => {
      const header = document.querySelector('.floating-header') as HTMLElement;
      const palette = document.querySelector('.palette-dock') as HTMLElement;
      const canvas = document.getElementById('display-canvas') as HTMLCanvasElement;
      const headerRect = header ? header.getBoundingClientRect() : null;
      const paletteRect = palette ? palette.getBoundingClientRect() : null;
      const canvasRect = canvas ? canvas.getBoundingClientRect() : null;

      // Check if header elements overflow screen width
      const headerOverflow = headerRect ? headerRect.right > window.innerWidth : false;
      // Check if palette overflows screen width
      const paletteOverflow = paletteRect ? paletteRect.right > window.innerWidth || paletteRect.left < 0 : false;

      // Check header children layout
      const headerBtns = Array.from(document.querySelectorAll('.floating-header button')).map(b => {
        const r = b.getBoundingClientRect();
        return { tag: b.id || b.className, r: r.right, l: r.left, w: r.width, h: r.height };
      });

      return {
        headerRect,
        paletteRect,
        canvasRect,
        headerOverflow,
        paletteOverflow,
        headerBtns
      };
    });
    console.log(`  Studio layout metrics:`, {
      headerOverflow: studioMetrics.headerOverflow,
      paletteOverflow: studioMetrics.paletteOverflow,
      headerRect: studioMetrics.headerRect,
      paletteRect: studioMetrics.paletteRect
    });

    // 3. Open Gallery Modal
    await page.click('#btn-gallery');
    await page.waitForSelector('.modal-overlay.open', { timeout: 3000 });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}_03_gallery.png`) });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));

    // 4. Open Audio Modal
    await page.click('#btn-audio');
    await page.waitForSelector('.audio-modal-overlay.modal-active', { timeout: 3000 });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}_04_audio.png`) });
    await page.keyboard.press('Escape');

    await page.close();
  }

  await browser.close();
  console.log('\nResponsive audit finished. Screenshots saved to:', OUT_DIR);
}

auditResponsive();
