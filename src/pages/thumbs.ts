/**
 * Small (320 px) previews of each picture for the home screen and gallery grids.
 * The full-size pictures are only loaded when a page is opened for coloring.
 */
export function thumbUrl(imageUrl: string): string {
  const m = /^(.*\/pages\/)([^/]+\.png)$/.exec(imageUrl);
  return m ? `${m[1]}thumbs/${m[2]}` : imageUrl;
}
