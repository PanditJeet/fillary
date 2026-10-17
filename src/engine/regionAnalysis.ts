import { TinyRegion } from './floodFill.js';

/**
 * Result of analysing a page's line art once when it is opened.
 */
export interface LineArtAnalysis {
  /** Pixels that block the fill (visible lines + invisible gap seals). */
  lineArtMask: Uint8Array;
  /** Invisible gap-seal pixels: block the fill but get colored alongside the adjacent area. */
  gapMask: Uint8Array;
  /** Orphan pixels (gap seals, tiny pockets) grouped by the large area they get colored with. */
  tinyRegions: TinyRegion[];
  /** Fill-area id of every pixel (0 = line / gap seal). Used to restore saved coloring fast. */
  labels: Uint32Array;
}

const TINY_MAX_AREA = 80;
const ORPHAN_MAX_LINE = 6;
const PAD = 3;

/**
 * Turns a decoded picture into line art in place: light pixels become transparent
 * (so colors show through), everything else solid dark line.
 */
export function thresholdLineArt(d: Uint8ClampedArray): void {
  for (let i = 0; i < d.length; i += 4) {
    if (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2] > 225) {
      d[i] = 0; d[i + 1] = 0; d[i + 2] = 0; d[i + 3] = 0;
    } else {
      d[i] = 18; d[i + 1] = 18; d[i + 2] = 18; d[i + 3] = 255;
    }
  }
}

/**
 * Analyses line art (RGBA, line pixels dark & opaque) into fill masks.
 * Pure and allocation-light so it runs fast on low-end phones.
 */
export function analyzeLineArt(rgba: Uint8ClampedArray, size: number): LineArtAnalysis {
  const W = size;
  const N = W * W;

  // 1. Visible line pixels (opaque & dark), into a zero-padded buffer so the
  //    neighbourhood checks below need no bounds tests.
  const PW = W + PAD * 2;
  const padded = new Uint8Array(PW * PW);
  const rawMask = new Uint8Array(N);
  for (let y = 0; y < W; y++) {
    const rowIn = y * W;
    const rowPad = (y + PAD) * PW + PAD;
    for (let x = 0; x < W; x++) {
      const i = (rowIn + x) << 2;
      if (rgba[i + 3] > 50 && (0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2]) <= 225) {
        rawMask[rowIn + x] = 1;
        padded[rowPad + x] = 1;
      }
    }
  }

  // 2. Gap seals: bridge 1-3px gaps and diagonal steps so fills never leak between objects.
  const lineArtMask = new Uint8Array(N);
  const gapMask = new Uint8Array(N);
  const P = padded;
  const U1 = PW, U2 = PW * 2, U3 = PW * 3;
  for (let y = 0; y < W; y++) {
    const rowIn = y * W;
    let q = (y + PAD) * PW + PAD;
    for (let x = 0; x < W; x++, q++) {
      const i = rowIn + x;
      if (P[q]) { lineArtMask[i] = 1; continue; }
      const l1 = P[q - 1], r1 = P[q + 1], u1 = P[q - U1], d1 = P[q + U1];
      if (!(l1 | r1 | u1 | d1 | P[q - 2] | P[q + 2] | P[q - U2] | P[q + U2] |
            P[q - U1 - 1] | P[q - U1 + 1] | P[q + U1 - 1] | P[q + U1 + 1])) {
        continue; // nothing nearby: fast path for open areas
      }
      const l2 = P[q - 2], r2 = P[q + 2], u2 = P[q - U2], d2 = P[q + U2];
      const l3 = P[q - 3], r3 = P[q + 3], u3 = P[q - U3], d3 = P[q + U3];
      const sealed =
        (l1 & r1) | (u1 & d1) |
        (l1 & u1) | (r1 & u1) | (l1 & d1) | (r1 & d1) |
        (P[q - U1 - 1] & P[q + U1 + 1]) | (P[q - U1 + 1] & P[q + U1 - 1]) |
        (l1 & r2) | (l2 & r1) | (u1 & d2) | (u2 & d1) |
        (l1 & r3) | (l2 & r2) | (l3 & r1) | (u1 & d3) | (u2 & d2) | (u3 & d1);
      if (sealed) {
        lineArtMask[i] = 1;
        gapMask[i] = 1;
      }
    }
  }

  const labels = new Uint32Array(N);
  const tinyRegions = computeTinyRegions(lineArtMask, rawMask, W, labels);
  return { lineArtMask, gapMask, tinyRegions, labels };
}

/**
 * Links every "orphan" pixel to the real colorable area it belongs to, so it gets
 * colored together with that area:
 *  - gap-seal pixels (narrow strips between close lines), and
 *  - tiny enclosed pockets (≤ TINY_MAX_AREA px), e.g. slivers where strokes meet.
 * Small but round shapes (e.g. flower petals) stay independently tappable, and pockets
 * behind thick outlines (e.g. eye shines) are left alone.
 *
 * Works on a grid with a 1px wall border (G = W + 2) so neighbour lookups need no
 * bounds checks or divisions — this is the hot path when a page opens.
 */
function computeTinyRegions(mask: Uint8Array, rawMask: Uint8Array, W: number, labelsOut: Uint32Array): TinyRegion[] {
  const G = W + 2;
  const NG = G * G;

  // Padded copies: border = wall (mask & visible line)
  const m = new Uint8Array(NG).fill(1);
  const raw = new Uint8Array(NG).fill(1);
  for (let y = 0; y < W; y++) {
    const src = y * W;
    const dst = (y + 1) * G + 1;
    m.set(mask.subarray(src, src + W), dst);
    raw.set(rawMask.subarray(src, src + W), dst);
  }

  // 1. Label fillable regions (4-connected scanline fill: one stack entry per run)
  const labels = new Int32Array(NG);
  const stack = new Int32Array(NG); // BFS queue / group stack (each pixel enters at most once)
  const runs: number[] = [];        // scanline seeds (a pixel may be queued twice; skipped once labeled)
  let count = 0;
  for (let i = G + 1; i < NG - G - 1; i++) {
    if (m[i] || labels[i]) continue;
    count++;
    runs.push(i);
    while (runs.length > 0) {
      const p = runs.pop()!;
      if (labels[p]) continue;
      let l = p, r = p;
      while (!m[l - 1] && !labels[l - 1]) l--;
      while (!m[r + 1] && !labels[r + 1]) r++;
      let upIn = false, dnIn = false;
      for (let k = l; k <= r; k++) {
        labels[k] = count;
        const up = k - G, dn = k + G;
        if (!m[up] && !labels[up]) { if (!upIn) { runs.push(up); upIn = true; } } else upIn = false;
        if (!m[dn] && !labels[dn]) { if (!dnIn) { runs.push(dn); dnIn = true; } } else dnIn = false;
      }
    }
  }
  const L = count + 1;
  const areas = new Int32Array(L);
  for (let i = 0; i < NG; i++) areas[labels[i]]++;
  const big = new Uint8Array(L);
  for (let l = 1; l < L; l++) big[l] = areas[l] > TINY_MAX_AREA ? 1 : 0;

  // 2. Small but round regions (contain a full 5x5 block) stay their own tappable areas
  const round = new Uint8Array(L);
  for (let y = 3; y <= W - 2; y++) {
    const row0 = y * G;
    for (let x = 3; x <= W - 2; x++) {
      const i = row0 + x;
      const l = labels[i];
      if (!l || big[l] || round[l]) continue;
      let full = true;
      for (let dy = -2; dy <= 2 && full; dy++) {
        const row = i + dy * G;
        for (let dx = -2; dx <= 2; dx++) {
          if (labels[row + dx] !== l) { full = false; break; }
        }
      }
      if (full) round[l] = 1;
    }
  }

  // 3. Orphan flags: gap pixels and tiny non-round pockets (border is raw -> never orphan)
  const orphan = new Uint8Array(NG);
  for (let i = 0; i < NG; i++) {
    if (raw[i]) continue;
    const l = labels[i];
    if (!big[l] && !round[l]) orphan[i] = 1;
  }

  // 4. Multi-source BFS from big regions into orphan pixels, never crossing visible lines
  const owner = new Int32Array(NG);
  const queue = stack; // reuse buffer
  let qh = 0, qt = 0;
  for (let i = G + 1; i < NG - G - 1; i++) {
    const l = labels[i];
    if (!big[l]) continue;
    if (orphan[i - 1] || orphan[i + 1] || orphan[i - G] || orphan[i + G]) {
      owner[i] = l;
      queue[qt++] = i;
    }
  }
  while (qh < qt) {
    const p = queue[qh++];
    const l = owner[p];
    let q = p - 1;
    if (orphan[q] && !owner[q]) { owner[q] = l; queue[qt++] = q; }
    q = p + 1;
    if (orphan[q] && !owner[q]) { owner[q] = l; queue[qt++] = q; }
    q = p - G;
    if (orphan[q] && !owner[q]) { owner[q] = l; queue[qt++] = q; }
    q = p + G;
    if (orphan[q] && !owner[q]) { owner[q] = l; queue[qt++] = q; }
  }

  // 5. Orphan groups still unassigned are enclosed by visible line: look across thin lines
  const seen = new Uint32Array(NG);
  let stamp = 0;
  const OFFS = [-1, 1, -G, G];
  const inside = (q: number) => {
    const x = q % G, y = (q / G) | 0;
    return x >= 1 && x <= W && y >= 1 && y <= W;
  };
  for (let i = G + 1; i < NG - G - 1; i++) {
    if (owner[i] || !orphan[i]) continue;
    const group: number[] = [];
    let sp = 0;
    stack[sp++] = i;
    owner[i] = -1;
    while (sp > 0) {
      const p = stack[--sp];
      group.push(p);
      for (let k = 0; k < 4; k++) {
        const q = p + OFFS[k];
        if (owner[q] || !orphan[q]) continue;
        owner[q] = -1;
        stack[sp++] = q;
      }
    }
    if (group.length > TINY_MAX_AREA * 4) continue; // large enclosed areas stay independent
    stamp++;
    let frontier: number[] = [];
    for (const p of group) { seen[p] = stamp; frontier.push(p); }
    const votes = new Map<number, number>();
    for (let depth = 0; depth <= ORPHAN_MAX_LINE && votes.size === 0 && frontier.length; depth++) {
      const next: number[] = [];
      for (const p of frontier) {
        for (let k = 0; k < 4; k++) {
          const q = p + OFFS[k];
          if (seen[q] === stamp || !inside(q)) continue;
          seen[q] = stamp;
          const o = owner[q] > 0 ? owner[q] : (big[labels[q]] ? labels[q] : 0);
          if (o) votes.set(o, (votes.get(o) || 0) + 1);
          else if (raw[q]) next.push(q); // walk through the line
        }
      }
      frontier = next;
    }
    if (votes.size === 0) continue;
    let best = 0, bestN = -1;
    for (const [l, n] of votes) if (n > bestN) { best = l; bestN = n; }
    for (const p of group) owner[p] = best;
  }

  // 6. Group orphan pixels per region, mapped back to unpadded indices
  const counts = new Int32Array(L);
  const anchor = new Int32Array(L).fill(-1);
  for (let y = 1; y <= W; y++) {
    const row = y * G;
    const outRow = (y - 1) * W - 1;
    for (let x = 1; x <= W; x++) {
      const i = row + x;
      const l = labels[i];
      labelsOut[outRow + x] = l;
      if (big[l] && anchor[l] < 0) anchor[l] = outRow + x;
      const o = owner[i];
      if (o > 0 && l !== o) counts[o]++;
    }
  }
  const lists: Uint32Array[] = new Array(L);
  for (let l = 1; l < L; l++) if (counts[l] > 0) lists[l] = new Uint32Array(counts[l]);
  const fillPos = new Int32Array(L);
  for (let y = 1; y <= W; y++) {
    const row = y * G;
    const outRow = (y - 1) * W - 1;
    for (let x = 1; x <= W; x++) {
      const i = row + x;
      const o = owner[i];
      if (o > 0 && labels[i] !== o) lists[o][fillPos[o]++] = outRow + x;
    }
  }
  const result: TinyRegion[] = [];
  for (let l = 1; l < L; l++) {
    if (counts[l] > 0 && anchor[l] >= 0) result.push({ anchor: anchor[l], pixels: lists[l] });
  }
  return result;
}
