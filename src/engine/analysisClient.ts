import { analyzeLineArt, thresholdLineArt, LineArtAnalysis } from './regionAnalysis.js';
import { TinyRegion } from './floodFill.js';

export interface PreparedLineArt {
  /** Line-art pixels (RGBA) ready to draw. */
  rgba: Uint8ClampedArray;
  analysis: LineArtAnalysis;
}

let worker: Worker | null = null;
let workerBroken = false;
let nextId = 1;
const pending = new Map<number, { resolve: (r: PreparedLineArt) => void; reject: (e: Error) => void }>();

function getWorker(): Worker | null {
  if (workerBroken || typeof Worker === 'undefined') return null;
  if (worker) return worker;
  try {
    worker = new Worker(new URL('./analysisWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent) => {
      const d = e.data;
      const job = pending.get(d.id);
      if (!job) return;
      pending.delete(d.id);
      if (!d.ok) { job.reject(new Error(d.error)); return; }
      const tinyRegions: TinyRegion[] = [];
      for (let i = 0; i < d.anchors.length; i++) {
        tinyRegions.push({ anchor: d.anchors[i], pixels: d.pixels.subarray(d.offsets[i], d.offsets[i + 1]) });
      }
      job.resolve({ rgba: d.rgba, analysis: { lineArtMask: d.lineArtMask, gapMask: d.gapMask, tinyRegions } });
    };
    worker.onerror = () => {
      // Worker unavailable (e.g. very old WebView): fail pending jobs over to the main thread
      workerBroken = true;
      worker = null;
      for (const [, job] of pending) job.reject(new Error('worker failed'));
      pending.clear();
    };
    return worker;
  } catch {
    workerBroken = true;
    return null;
  }
}

function prepareOnMainThread(rgba: Uint8ClampedArray, size: number, threshold: boolean): PreparedLineArt {
  if (threshold) thresholdLineArt(rgba);
  return { rgba, analysis: analyzeLineArt(rgba, size) };
}

/**
 * Converts a decoded picture to line art (optional) and analyses its fill areas,
 * in a background thread when possible so the UI never freezes.
 * Falls back to the main thread if workers aren't supported.
 */
export async function prepareLineArt(rgba: Uint8ClampedArray, size: number, threshold: boolean): Promise<PreparedLineArt> {
  const w = getWorker();
  if (w) {
    // Keep a copy in case the worker fails mid-way (the original buffer is transferred)
    const backup = rgba.slice();
    try {
      return await new Promise<PreparedLineArt>((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject });
        w.postMessage({ id, rgba, size, threshold }, [rgba.buffer]);
      });
    } catch {
      return prepareOnMainThread(backup, size, threshold);
    }
  }
  return prepareOnMainThread(rgba, size, threshold);
}
