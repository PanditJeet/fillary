import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:3000/';
const SCREENSHOT_PATH = 'C:\\Users\\Jeet Pandit\\.gemini\\antigravity\\brain\\aca81aaa-01cd-4331-a658-0453841c5d1f\\scratch\\audio_modal_chimes_only.png';

async function verifyAudioModal() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Browser error:', msg.text());
    }
  });

  await page.goto(URL, { waitUntil: 'networkidle0' });
  
  // Click audio button on home page to open modal
  await page.waitForSelector('#home-audio-btn');
  await page.click('#home-audio-btn');
  await page.waitForSelector('.audio-modal-overlay.modal-active');
  await new Promise(r => setTimeout(r, 400));

  // Check tracks in DOM
  const tracks = await page.$$eval('.audio-track-card', cards =>
    cards.map(c => ({
      track: c.getAttribute('data-track'),
      text: c.textContent?.trim()
    }))
  );

  console.log('Tracks present in Audio Modal:', tracks);

  const hasRain = tracks.some(t => t.track === 'rain' || t.text?.includes('Cozy Rain'));
  const hasZen = tracks.some(t => t.track === 'zen' || t.text?.includes('Zen Sanctuary'));
  const hasChimes = tracks.some(t => t.track === 'chimes' || t.text?.includes('Celestial Chimes'));

  console.log('Has Cozy Rain:', hasRain);
  console.log('Has Zen Sanctuary:', hasZen);
  console.log('Has Celestial Chimes:', hasChimes);

  if (hasRain) {
    throw new Error('Cozy Rain should NOT be in the modal!');
  }
  if (hasZen) {
    throw new Error('Zen Sanctuary should NOT be in the modal!');
  }
  if (!hasChimes) {
    throw new Error('Celestial Chimes MUST be in the modal!');
  }

  // Toggle music on
  await page.click('#toggle-music-btn');
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: SCREENSHOT_PATH });
  console.log('Screenshot saved to:', SCREENSHOT_PATH);

  await browser.close();
  console.log('AUDIO MODAL VERIFICATION PASSED!');
}

verifyAudioModal().catch(err => {
  console.error(err);
  process.exit(1);
});
