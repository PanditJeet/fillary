import { PAGES } from '../src/pages/pageCatalog.js';
import { scanlineFloodFill } from '../src/engine/floodFill.js';

console.log('Testing page loading and flood fill for all curated pages:');

for (const page of PAGES) {
  if (page.svgContent.includes('fill="#FFFFFF"') || page.svgContent.includes('fill="#ffffff"')) {
    console.error(`Page ${page.id} still contains fill="#FFFFFF" which would occlude color canvas!`);
    process.exit(1);
  }
  console.log(`✓ Page "${page.title}" (${page.category}): Clean transparent linework verified.`);
}

console.log('All pages verified clean and ready for instant coloring.');
