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
    if (page.svgContent.includes('fill="#FFFFFF"') || page.svgContent.includes('fill="#ffffff"')) {
      console.error(`Page ${page.id} still contains fill="#FFFFFF" which would occlude color canvas!`);
      process.exit(1);
    }
    console.log(`✓ Vector Page "${page.title}" (${page.category}): Clean transparent linework verified.`);
  }
}

console.log('All pages verified successfully!');
