# Project Spec: Coloring Book App (General Audience)

## 1. Concept
A relaxation-focused digital coloring book for a general/all-ages audience (positioned as adult/all-ages relaxation content, not marketed as a kids app — avoids Families Program / Kids Category restrictions on both stores). Tap-to-fill or drag-to-paint coloring pages across multiple categories (mandalas, nature, patterns, animals, abstract).

## 2. Core Mechanics
- **Fill method:** flood-fill (tap a region, it fills with selected color) — simpler to implement well and performs better than freehand drag-paint on lower-end devices.
- **Palette:** scrollable color picker, recently-used colors row, at least one gradient/pattern fill option as a premium differentiator.
- **Canvas controls:** pinch-to-zoom, pan, undo/redo (last ~10 actions).
- **Save/Export:** export finished image to device gallery, share sheet (native OS share, not a custom social feature).
- **Progress:** auto-save in-progress coloring per page, resume where left off.

## 3. Content Structure
- Launch categories: Animals, Original Characters (cartoon/anime-style original designs — no licensed/existing characters, e.g. no Pokémon, Disney, or other trademarked IP; style can be inspired by those visual genres, but every character must be an original design to avoid copyright/trademark infringement), Mandalas, Nature, Patterns, Abstract.
- ~10-15 pages per category (60-90 total pages for v1 — content is illustration work, scope this realistically against your actual art pipeline/budget).
- Pages delivered as line-art SVG or PNG with defined fillable regions (flood-fill needs closed regions — flag this to whoever produces the art: open/unclosed linework will leak fill color across boundaries).
- Categorize some pages as "Free" and some as "Premium" (see monetization).

## 4. Monetization
- **Ads (standard, non-restricted):** AdMob banner on the gallery/category screens, rewarded video to unlock a premium page or a bonus color/pattern. Standard SDK, no Families certification needed for a general-audience app.
- **One-time purchase / IAP:** "Remove Ads" purchase, and/or a premium content pack unlock (one-time or small subscription). Don't rely on ads alone — same reasoning as before: hybrid model reduces revenue risk versus ads-only.
- **Consent flow:** still required regardless of audience — implement Apple's App Tracking Transparency (ATT) prompt for iOS and a Google-approved consent management platform (UMP SDK or equivalent) for GDPR/CCPA regions before showing personalized ads. This is standard practice for any ad-supported app, not a kids-specific requirement.

## 5. Tech Stack
- **Core rendering:** HTML5 Canvas (same flood-fill/rendering approach as your existing game work), vanilla JS or TypeScript.
- **App packaging:** Capacitor (wraps the web app into real iOS/Android builds, single codebase, access to native APIs — camera-roll export, share sheet, IAP plugins, AdMob plugin).
- **Flood-fill implementation:** scanline flood-fill algorithm operating on canvas ImageData — performant even on mobile if pages aren't excessively high-res (target working resolution ~1024x1024 per page, not full print-res).
- **IAP:** Capacitor IAP plugin (or platform-specific: StoreKit for iOS, Google Play Billing for Android) — implement receipt validation, don't trust client-side purchase state alone.
- **Ads:** Capacitor AdMob plugin (community or official), standard integration.
- **Local storage:** save in-progress coloring state (which regions filled with which color) as JSON per page, not full bitmap, to keep storage light — reconstruct via replay on load.

## 6. Folder Structure
```
/src
  /engine      -> flood-fill algorithm, canvas rendering, zoom/pan
  /pages       -> page metadata (category, premium flag, asset path)
  /ui          -> palette, gallery grid, category screens
  /monetization -> ads wrapper, IAP wrapper
  /storage     -> save/load progress state
/assets
  /pages       -> line-art source files per category
capacitor.config.json
```

## 7. Milestones
1. Core flood-fill engine working on one test page (validate performance on a real mid-tier phone early — this is the actual technical risk, same lesson as Glitch Gauntlet's shadowBlur issue: measure on real hardware before scaling content)
2. Palette + zoom/pan + undo/redo
3. Gallery/category browsing UI + save/resume progress
4. Export to gallery + native share
5. AdMob integration (banner + rewarded) + consent flow (ATT/UMP)
6. IAP integration (remove ads + premium pack) with receipt validation
7. Populate full content set (60-90 pages), QA each page's line-art for closed regions (flood-fill leak testing)
8. Capacitor build + store listing prep (screenshots, description — keep general-audience framing consistent per the positioning note above)

## 8. Explicitly Not Doing (v1)
- Freehand drag-paint (flood-fill only for v1 — simpler, better performance)
- Social features (sharing to in-app feed, comments, following)
- User-uploaded custom line-art
- Daily/streak gamification systems
