# Fillary — Minimalist Relaxation Coloring Book

An ultra-minimalist, premium digital coloring book application engineered for mindful relaxation and fluid performance.

## Key Features

- **High-Performance Scanline Flood Fill:**
  - Fast queue-based scanline algorithm operating directly on `Uint32Array` buffers.
  - Endian-safe pixel packing.
  - Forgiving tap targeting with nearest-fillable pixel search.
  - Dual-layer compositing (color canvas underneath line-art canvas), completely eliminating anti-aliasing white halos and fringing.
- **Minimalist & Premium Design System:**
  - Deep graphite/slate aesthetic (`#0D0F14`) with glassmorphism docks (`backdrop-filter: blur(28px)`).
  - Floating pill headers and curated harmonic palettes (Zen Stone & Clay, Kyoto Blossom, Nordic Forest, Velvet Twilight, Desert Solstice).
  - Tactile color swatches with active halo indicators, custom color picker, and recent colors row.
- **Fluid Canvas Navigation:**
  - Pinch-to-zoom & pan on touch devices / tablets.
  - Smooth mouse wheel zoom anchored to cursor.
  - One-click zoom reset to fit screen.
- **State & Replay History:**
  - Undo / Redo with instant snapshot stack.
  - Auto-saving in-progress coloring to `localStorage` via compact JSON action replay.
  - 1024×1024 high-resolution artwork export to PNG.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
