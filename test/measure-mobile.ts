import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function checkLayout() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  
  // Test iPhone (390x844)
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  const homeMetrics = await page.evaluate(() => {
    const nav = document.querySelector('.home-nav')?.getBoundingClientRect();
    const hero = document.querySelector('.home-hero')?.getBoundingClientRect();
    const activeCard = document.querySelector('.home-active-card')?.getBoundingClientRect();
    const grid = document.querySelector('.home-pages-grid')?.getBoundingClientRect();
    const cards = Array.from(document.querySelectorAll('.home-page-card')).slice(0, 4).map(c => c.getBoundingClientRect());
    const filterTabs = document.querySelector('.home-filter-tabs')?.getBoundingClientRect();
    const brand = document.querySelector('.home-nav-brand')?.getBoundingClientRect();
    const actions = document.querySelector('.home-nav-actions')?.getBoundingClientRect();

    return {
      nav: { w: nav?.width, h: nav?.height },
      brand: { w: brand?.width, right: brand?.right },
      actions: { w: actions?.width, left: actions?.left },
      hero: { h: hero?.height },
      activeCard: { w: activeCard?.width, h: activeCard?.height },
      grid: { w: grid?.width },
      cards: cards.map(c => ({ w: c.width, h: c.height, l: c.left, r: c.right })),
      filterTabs: { w: filterTabs?.width }
    };
  });

  console.log('--- IPHONE 14 (390x844) HOME METRICS ---');
  console.log(JSON.stringify(homeMetrics, null, 2));

  // Now click puppy card to enter studio
  await page.click('.home-page-card[data-page-id="puppy-playtime"]');
  await page.waitForSelector('.studio-container.view-active');
  await new Promise(r => setTimeout(r, 600));

  const mobileStudio = await page.evaluate(() => {
    const header = document.querySelector('.floating-header')!;
    const headerRect = header.getBoundingClientRect();
    const palette = document.querySelector('.palette-dock')?.getBoundingClientRect();
    const canvas = document.querySelector('#display-canvas')?.getBoundingClientRect();

    // Check individual buttons in header
    const btns = Array.from(document.querySelectorAll('.floating-header button, .floating-header span')).map(el => {
      const r = el.getBoundingClientRect();
      return { id: el.id || el.className, w: r.width, h: r.height, l: r.left, r: r.right };
    });

    return {
      window: { w: window.innerWidth, h: window.innerHeight },
      header: { top: headerRect.top, bottom: headerRect.bottom, width: headerRect.width },
      palette: { top: palette?.top, bottom: palette?.bottom, height: palette?.height, width: palette?.width },
      canvas: { top: canvas?.top, bottom: canvas?.bottom, height: canvas?.height, width: canvas?.width },
      btns
    };
  });

  console.log('\n--- IPHONE 14 (390x844) STUDIO METRICS ---');
  console.log(JSON.stringify(mobileStudio, null, 2));

  await browser.close();
}

checkLayout();
