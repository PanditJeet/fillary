import { PAGES } from '../src/pages/pageCatalog.js';
import fs from 'fs';
import path from 'path';

console.log('Testing page loading and verification for all curated pages:');

for (const page of PAGES) {
  if (page.imageUrl) {
    const publicPath = path.join(process.cwd(), 'public', page.imageUrl);
    if (!fs.existsSync(publicPath)) {
      console.error(`Missing image file for page ${page.id}: ${publicPath}`);
      process.exit(1);
    }
    const stats = fs.statSync(publicPath);
    console.log(`✓ Image Page "${page.title}" (${page.category}): File exists (${(stats.size / 1024).toFixed(1)} KB) at ${page.imageUrl}`);
  } else if (page.svgContent) {
    // Check that there is no background rect covering the whole canvas with solid white
    if (page.svgContent.includes('<rect width="1024" height="1024" fill="#FFFFFF"') || 
        page.svgContent.includes('<rect width="1024" height="1024" fill="#ffffff"')) {
      console.error(`Page ${page.id} contains full white rect which would occlude color canvas!`);
      process.exit(1);
    }
    console.log(`✓ Vector Page "${page.title}" (${page.category}): Clean transparent linework verified.`);
  }
}

console.log(`\nAll ${PAGES.length} pages verified successfully across all collections!`);
