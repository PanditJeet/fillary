# Fillary — Minimalist Relaxation Coloring Book

An ultra-minimalist, premium digital coloring book application engineered for mindful relaxation and fluid performance.

## Key Features

- **High-Performance Scanline Flood Fill:**
  - Fast queue-based scanline algorithm operating directly on `Uint32Array` buffers.
  - Endian-safe pixel packing.
  - Forgiving tap targeting with nearest-fillable pixel search.
  - Dual-layer compositing (color canvas underneath line-art canvas); invisible gap-seal pixels next to lines are colored with the adjacent area, so no white specks remain.
- **Minimalist & Premium Design System:**
  - Deep graphite/slate aesthetic (`#0D0F14`) with glassmorphism docks (`backdrop-filter: blur(28px)`).
  - Floating pill headers and 6 curated palettes (two unlockable via rewarded ad).
  - Tactile color swatches with active halo indicators, custom color picker, and recent colors row.
- **Fluid Canvas Navigation:**
  - Pinch-to-zoom & pan on touch devices / tablets.
  - Smooth mouse wheel zoom anchored to cursor.
  - One-click zoom reset to fit screen.
- **State & Replay History:**
  - Undo / Redo storing only the changed pixels per fill (low memory).
  - Auto-saving in-progress coloring to `localStorage` via compact JSON action replay.
  - 1024×1024 PNG export: saved to the phone gallery (Pictures/Fillary) + share sheet on Android, download/share in browsers.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
