/// <reference lib="webworker" />
import { analyzeLineArt, thresholdLineArt } from './regionAnalysis.js';

/**
 * Runs the CPU-heavy picture preparation off the main thread (line-art conversion
 * + fill-area analysis) so the app stays responsive while a picture opens.
 */
self.onmessage = (e: MessageEvent<{ id: number; rgba: Uint8ClampedArray; size: number; threshold: boolean }>) => {
  const { id, rgba, size, threshold } = e.data;
  try {
    if (threshold) thresholdLineArt(rgba);
    const r = analyzeLineArt(rgba, size);
    const k = r.tinyRegions.length;
    const anchors = new Int32Array(k);
    const offsets = new Int32Array(k + 1);
    let total = 0;
    for (let i = 0; i < k; i++) { anchors[i] = r.tinyRegions[i].anchor; offsets[i] = total; total += r.tinyRegions[i].pixels.length; }
    offsets[k] = total;
    const pixels = new Uint32Array(total);
    for (let i = 0; i < k; i++) pixels.set(r.tinyRegions[i].pixels, offsets[i]);
    (self as unknown as Worker).postMessage(
      { id, ok: true, rgba, lineArtMask: r.lineArtMask, gapMask: r.gapMask, anchors, offsets, pixels },
      [rgba.buffer, r.lineArtMask.buffer, r.gapMask.buffer, anchors.buffer, offsets.buffer, pixels.buffer]
    );
  } catch (err) {
    (self as unknown as Worker).postMessage({ id, ok: false, error: String(err) });
  }
};
