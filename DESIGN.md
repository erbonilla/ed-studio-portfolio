---
name: Edgar Bonilla G. — Portfolio
description: A cinematic, type-led portfolio that resolves from obstruction to clarity.
colors:
  kinetic-orange: "#ff4f18"
  ink: "#050505"
  white: "#ffffff"
  muted: "#a3a3a3"
  hairline: "rgba(255, 255, 255, 0.24)"
  paper: "#f2efe8"
  graphite: "#111516"
  slate: "#42494a"
  stone: "#434a4b"
  ember-deep: "#9d3d21"
  brand-lift: "#ff6334"
  work-frame-ground: "#d1c1ba"
  atlan-accent: "#ef5a2f"
  atlan-deep: "#0c3542"
  osteoplus-accent: "#d95e35"
  osteoplus-deep: "#183e43"
typography:
  display:
    fontFamily: "'Syne Variable', 'Syne Fallback', 'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "clamp(64px, 9.6vw, 164px)"
    fontWeight: 700
    lineHeight: 0.84
    letterSpacing: "-0.065em"
  headline:
    fontFamily: "'Syne Variable', 'Syne Fallback', 'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "clamp(48px, 5.7vw, 100px)"
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: "-0.055em"
  title:
    fontFamily: "'Syne Variable', 'Syne Fallback', 'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "clamp(25px, 2.45vw, 40px)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  body:
    fontFamily: "'Inter Variable', 'Inter Fallback', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "clamp(16px, 1.25vw, 20px)"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "'Inter Variable', 'Inter Fallback', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "clamp(12px, 1vw, 15px)"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "0.12em"
rounded:
  none: "0"
  chip: "5px"
  chip-compact: "13px"
  media-inset: "18px"
  media: "28px"
  media-compact: "20px"
  menu-sheet: "22px"
  panel: "clamp(26px, 3vw, 48px)"
  pill: "999px"
  circle: "50%"
shadows:
  print-lift: "0 26px 60px rgba(4, 14, 18, 0.3)"
  media-scrim-soft: "rgba(4, 14, 18, 0.48)"
  media-scrim-deep: "rgba(4, 14, 18, 0.74)"
  accent-glow: "0 0 24px rgba(255, 79, 24, 0.4)"
spacing:
  xs: "4px"
  sm: "14px"
  md: "26px"
  lg: "clamp(26px, 3.3vw, 62px)"
  xl: "clamp(104px, 12vw, 188px)"
  xxl: "clamp(140px, 15vw, 240px)"
components:
  button-primary:
    backgroundColor: "{colors.kinetic-orange}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 17px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.white}"
    textColor: "{colors.kinetic-orange}"
  button-secondary:
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 17px"
    height: "48px"
  button-secondary-hover:
    textColor: "{colors.kinetic-orange}"
  button-arrow:
    backgroundColor: "{colors.kinetic-orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  button-arrow-dark:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.white}"
    rounded: "{rounded.none}"
  chip-proof:
    textColor: "{colors.stone}"
    rounded: "{rounded.pill}"
    padding: "9px 12px"
  media-frame:
    backgroundColor: "{colors.graphite}"
    rounded: "{rounded.media}"
---

# Design System: Edgar Bonilla G. — Portfolio

## Overview

**Creative North Star: "The Aperture"**

Every surface behaves like an optical instrument resolving focus. The site opens as a solid orange field that splits along a horizontal seam like a shutter; the hero scrubs a 195-frame portrait sequence from obstruction into clarity; the About portrait reveals its monochrome layer through a liquid aperture that follows the pointer. Nothing here is decoration borrowed from a template — the entire visual argument is *a lens finding its subject*, and the subject is the designer's own judgment.

The system is dark, dense, and type-led. Near-black is the ground state, oversized uppercase display type is the structure, and a single kinetic orange carries every moment of movement and intent. Interactive surfaces are square-cornered and flat; depth arrives through tonal layering, film grain, blur, and real photography rather than through drop shadows. The result reads as a screening room rather than a product page: quiet material, loud typography, and motion that means something.

The system runs in **two registers**. The *dark register* (intro, hero, About, Contact) is the default: near-black ground, hard edges, orange accent, atmospheric depth. The *light register* (the Work chapter) inverts to warm paper with graphite ink, and is the one place where rounded media frames and real drop shadows are sanctioned — the case studies present as physical prints laid on a table. Treat the switch as a deliberate chapter break, not as drift.

**Key Characteristics:**

- Near-black ground (`#050505`) with a single accent — no secondary or tertiary palette
- Oversized uppercase display type with hard negative tracking (down to `-0.065em`)
- Square corners on everything interactive; radius is reserved for media and metadata
- Scroll is the primary interaction verb; motion is choreographed, never ambient
- Film grain and tonal layering instead of elevation
- Every animated surface ships a genuine reduced-motion path

## Colors

A monochrome field interrupted by one accent — the palette's discipline is that there is no second accent to reach for.

### Primary

- **Kinetic Orange** (`#ff4f18`): The color of momentum, drawn from "built for people in motion." It carries the intro field, every primary action, active navigation states, accent words inside display headlines, index numerals, and link underlines. In the About chapter it also runs atmospherically as an amber ribbon field and inset glow — this is the one sanctioned decorative use, because the ribbons *are* the imagery, not a wash over content.

### Neutral

- **Ink** (`#050505`): The ground state. Page background, dark-register surfaces, and the text color used on orange.
- **White** (`#ffffff`): Primary text on the dark register. Also the hover background for primary actions, where it swaps places with the orange.
- **Muted** (`#a3a3a3`): Secondary metadata on dark — role labels, location, supporting lines.
- **Hairline** (`rgba(255, 255, 255, 0.24)`): The only divider treatment on the dark register. Borders are hairlines, never filled strokes.

### Light Register

- **Paper** (`#f2efe8`): The Work chapter ground — a warm off-white, never pure white, carrying a radial orange bloom at 78% 5% and a 5%-opacity grain overlay.
- **Graphite** (`#111516`): Ink on paper. Also the dark button variant.
- **Slate** (`#42494a`): Body copy on paper.
- **Stone** (`#434a4b`): Proof-chip text and tertiary metadata on paper.
- **Ember Deep** (`#9d3d21`): The second half of the Work kicker — a burnt orange that reads on light ground where `#ff4f18` would vibrate.

### Per-Project Accents

Each case study carries a scoped accent pair, set on `.project-story` and overridden per project. These theme the story block only and must never leak into the global system.

- **Atlan** — accent `#ef5a2f`, deep `#0c3542`
- **Osteóplus** — accent `#d95e35`, deep `#183e43`

### Named Rules

**The One Accent Rule.** There is exactly one accent in this system. When a new state needs distinction, reach for weight, scale, case, or tonal value — never for a second hue. Per-project accents are scoped to their story block and are not exceptions to this.

**The Vibration Rule.** `#ff4f18` on `#f2efe8` vibrates at body sizes. On the light register, orange is permitted for large display type and fills, but running text uses Ember Deep (`#9d3d21`) instead.

## Typography

**Display Font:** Syne Variable (400–800), self-hosted via `@fontsource-variable/syne`
**Fallback:** `Syne Fallback` — a metric-adjusted `@font-face` over Arial Black (`size-adjust: 86%`) so the swap does not reflow display type
**Body Font:** Inter Variable (100–900), self-hosted via `@fontsource-variable/inter`
**Fallback:** `Inter Fallback` — metric-adjusted over Helvetica Neue (`size-adjust: 99%`)

**Character:** Syne's geometric, slightly eccentric capitals set at aggressive negative tracking give the display voice its authority — it reads as designed rather than typeset. Inter underneath keeps the reading experience neutral and legible so the display type carries all the personality. The pairing is the whole brand: expressive at scale, invisible at reading size.

Both faces are self-hosted from `@fontsource-variable/*` and imported at the top of `app/globals.css`; `unicode-range` gating means only the latin and latin-ext subsets are ever downloaded. The two `*-Fallback` families exist solely to hold layout steady during the swap and carry no design intent of their own — they are not a second typeface in the system. (The earlier defect where `--font-syne` resolved to Arial Black is fixed; tracking and size values below are now tuned against the real faces.)

### Hierarchy

- **Display** (700, `clamp(64px, 9.6vw, 164px)`, line-height 0.84, tracking `-0.065em`, uppercase): The hero `h1` and chapter openers. Set tight enough that lines nearly touch — the block reads as a mass, not as sentences.
- **Headline** (600, `clamp(48px, 5.7vw, 100px)`, line-height 0.9, tracking `-0.055em`, uppercase): Section titles and the About lead. The Work heading runs larger still at `clamp(56px, 7.6vw, 144px)`.
- **Title** (600, `clamp(25px, 2.45vw, 40px)`, line-height 1.1): Project titles and expertise area names.
- **Body** (400, `clamp(16px, 1.25vw, 20px)`, line-height 1.55, max 36ch–65ch): Narrative paragraphs and project descriptions. Measure is capped tightly — the Work intro holds at `36ch`.
- **Label** (700, `clamp(12px, 1vw, 15px)`, tracking `0.12em`, uppercase): Metadata keys, navigation, status lines, button text. This is the system's connective tissue and appears more often than any other role.

**The 11px Floor.** No functional text renders below `11px` at any breakpoint. The system previously ran label type down to 8px on mobile controls; that is now the hard minimum, including inside buttons.

### Named Rules

**The Single H1 Rule.** The portfolio hero owns the page's only `h1`. Every chapter below opens at `h2`. This is an accessibility invariant, not a preference.

**The Tracking Inversion Rule.** Display type tracks negative (`-0.045em` to `-0.065em`); label type tracks positive (`0.1em` to `0.15em`). The two never meet in the middle — a heading at neutral tracking is a defect in this system.

**The Uppercase Structure Rule.** Uppercase carries structure (display, labels, navigation, buttons). Sentence case carries reading (body paragraphs). Never uppercase a paragraph and never sentence-case a label.

## Layout

A single continuous route (`app/page.tsx`) composed of full-bleed chapters, each owning its own scroll behavior rather than sitting in a shared container.

**Chapter sequence:** fixed intro overlay (100svh) → persistent three-part header → pinned hero (500svh scroll length, 100svh sticky stage; 440svh on mobile) → full-bleed About chapter → Work marquee → Work stories → Contact.

**Containers:** The Work chapter caps at `1800px` and centers; other chapters run full-bleed. Section padding is `clamp(104px, 12vw, 188px)` block, `clamp(20px, 3.4vw, 56px)` inline.

**Grid:** Project stories use an asymmetric three-column grid — `46px` rail, then `7fr` and `4fr` (minimum `340px`) — with the two columns swapped for the second project so the chapter alternates direction. Gutter is `clamp(26px, 3.3vw, 62px)`; stories are separated by `clamp(140px, 15vw, 240px)`.

**Header:** Strict left/center/right — wordmark, Menu trigger, orange collaboration action. The menu overlay is a near-black full-viewport editorial layer: oversized links first, metadata and a contextual 4:5 portrait (capped `452px`) second. On narrow screens the visual and meta content collapses below the links and the portrait returns to a compact landscape ratio.

**Breakpoints:** `620px` and `900px` are the primary hinges (with `901px` for desktop-only rules); `520px`, `680px`, `720px`, `820px`, and `950px` handle local adjustments; `1800px` caps the Work container.

**Responsive behavior:** Desktop runs a three-column hero composition with copy left/center and portrait mass right. Tablet collapses to single-column copy with role metadata anchored low. Mobile compresses the hero sequence, simplifies metadata, and *increases* proportional type size — display type gets relatively larger as the viewport narrows (`clamp(48px, 16vw, 76px)` patterns), never smaller.

### Named Rules

**The Anchored Action Rule.** Hero destination actions sit outside the copy-beat timeline. They stay anchored and interactive for the full pinned sequence — the visitor can act at any scroll position without waiting for a beat to finish.

**The Scan Path Rule.** Identity, role, domains, and location remain readable without interaction at every breakpoint. No motion, hover, or scroll state may be the only way to reach them.

## Elevation & Depth

**Flat by default.** Interactive surfaces sit directly on their ground with no shadow and no elevation metaphor. Depth is built from tonal layering (stacked near-blacks from `#050505` through `#0b0b0b` to `#111516`), a 5%-opacity fractal-noise grain overlay, blur, and real photographic mass.

The sanctioned exceptions are documented rather than treated as drift:

### Shadow Vocabulary

- **Print lift** (`box-shadow: 0 26px 60px rgba(4, 14, 18, 0.3)`): The inset detail frame in the light Work register only. Sells the case-study media as a physical print on paper.
- **Accent glow** (`box-shadow: 0 0 24px rgba(255, 79, 24, 0.4)`): Scroll-progress and active-state indicators. Emissive, not elevational.
- **Interior atmosphere** (`box-shadow: inset 0 0 64px rgba(255, 79, 24, 0.07)`, `inset 0 0 60px rgba(255, 196, 167, 0.16)`): Inset warmth inside the About ribbon field. Reads as light in a room, not as a raised surface.
- **Focus ring** (`box-shadow: 0 0 0 5px rgba(255, 79, 24, 0.11)`, `0 0 0 6px #111516`): Rings and separators, never ambient shadow.

### Named Rules

**The Flat-Interactive Rule.** Buttons, links, chips, and navigation never carry a drop shadow in either register. If an element needs to feel raised, it is the wrong element.

**The Light-Register Exception.** Drop shadows exist only in the Work chapter, only on media frames, and only to sell physicality. Introducing one in the dark register is drift.

## Shapes

**Square by default.** Every interactive element is `border-radius: 0` — buttons, the arrow button, links, the menu overlay. The hard corner is the system's form signature and the most visible carrier of its discipline.

Radius is reserved for two jobs:

- **Media frames** (`28px` primary, `18px` inset detail, `20px`/`13px` on mobile, `clamp(26px, 3vw, 48px)` on the Contact panel): Photography and video only, in the light register.
- **Metadata objects** (`999px` proof chips, `50%` avatars and status dots, `5px` small indicators): Small, non-interactive, informational.

Borders are hairlines — `1px solid rgba(255, 255, 255, 0.24)` on dark, `1px solid rgba(17, 21, 22, 0.2)` on paper. There is no heavy stroke anywhere in the system.

### Named Rules

**The Zero-Radius Rule.** If it can be clicked, its corners are square. A rounded button is not this system.

**The Radius Is Content Rule.** Radius marks something as either an image or a piece of metadata. It never marks something as an action.

## Components

### Buttons

- **Shape:** Square (`0` radius), minimum height `48px`, `0 17px` padding, uppercase label type at `10px`/`0.09em`.
- **Primary:** Orange fill, ink text (`#ff4f18` on text `#050505`), minimum width `152px`.
- **Secondary:** Transparent with a `1px` bottom hairline at `rgba(255, 255, 255, 0.72)`, minimum width `172px`.
- **Hover:** Both lift `translateY(-2px)` over `220ms ease`. Primary inverts to white ground with orange text; secondary shifts text and border to orange. The lift is the same for both — only the color logic differs.
- **Arrow button (`button04`):** The signature action. Square, uppercase, weight 750, tracking `0.075em`, with a masked northeast-arrow glyph that swaps on hover over `320ms cubic-bezier(0.76, 0, 0.24, 1)`. Variants: `brand` (orange/ink), `light` (white/ink → orange on active), `dark` (graphite/white → orange on active).

### Chips

- **Proof chips:** Pill (`999px`), `9px 12px` padding, `1px` hairline at `rgba(17, 21, 22, 0.2)`, stone text. Light register only. Non-interactive — they are evidence labels, not filters.

### Cards / Containers

The system has **no card component**, and that is deliberate — see Do's and Don'ts. The nearest equivalents are the project media frames (`28px` radius, graphite ground, print-lift shadow, light register only) and the Contact panel (`clamp(26px, 3vw, 48px)` radius on ink).

### Navigation

- **Header:** Fixed, three-part. Wordmark left, Menu trigger centered, orange arrow action right. The trigger's two horizontal rules morph into a compact "X" on open and reverse on close.
- **Overlay:** Near-black full-viewport layer entered by a vertical clip reveal with staggered link entrance and delayed detail entrance. Links are oversized display type with an orange index numeral.
- **States:** Active links take a larger orange square marker and orange type. Hover performs one horizontal-axis rotation on the label while its marker blinks. All numeric indices are orange in every state.
- **Planned destinations:** Sections that are not built are labeled as planned and must not behave like working pages.

### Signature: The Aperture Reveal

The About portrait layers an orange-toned image over a pixel-aligned monochrome copy. Pointer or touch input opens a procedural liquid aperture in the top Canvas 2D layer, revealing the monochrome beneath. It stays on Canvas 2D specifically to avoid a second WebGL context. Under reduced motion it renders as a static layered composition with no aperture.

### Motion

Lenis owns scroll interpolation; GSAP ScrollTrigger maps section progress to the frame sequence and copy beats.

- **Primary easing:** `cubic-bezier(0.76, 0, 0.24, 1)` — the system's default for state and reveal.
- **Secondary easing:** `cubic-bezier(0.22, 1, 0.36, 1)` for entrances.
- **GSAP eases:** `power3.out` for entrances (dominant), `power4.inOut` for the intro seam and menu, `none` for scroll-linked scrubbing.
- **Durations:** `220ms` for interactive state (dominant), `260–400ms` for component transitions, `480–620ms` for orchestrated reveals.

## Do's and Don'ts

### Do:

- **Do** keep `border-radius: 0` on every interactive element. Square corners are the form signature.
- **Do** use exactly one accent. Distinguish new states with weight, scale, case, or tonal value.
- **Do** track display type negative (`-0.045em` to `-0.065em`) and label type positive (`0.1em` to `0.15em`).
- **Do** build depth from tonal layering, grain, blur, and real imagery.
- **Do** ship a genuine `prefers-reduced-motion` path with every animated surface — a static composition that still communicates, not a stripped one.
- **Do** keep the hero's `h1` the page's only `h1`.
- **Do** switch to Ember Deep (`#9d3d21`) for orange running text on the light register.
- **Do** scope per-project accents to their story block.
- **Do** let display type grow proportionally larger as the viewport narrows.

### Don't:

- **Don't** introduce a rounded button, a card component, or a card grid. PRODUCT.md names card-heavy template grids as an anti-reference, and the absence of a card primitive is what keeps the chapters full-bleed and cinematic.
- **Don't** add a drop shadow to the dark register, or to any interactive element in either register.
- **Don't** add a second accent hue, a gradient on text, or a gradient as a surface treatment.
- **Don't** add a second WebGL context. Three.js is dynamically imported and hero-only; the About reveal stays on Canvas 2D.
- **Don't** introduce Tailwind or a utility-class layer — the system is hand-authored CSS with custom properties.
- **Don't** let motion run without narrative purpose. Ambient, looping, or decorative animation is drift.
- **Don't** put `#ff4f18` in running text on `#f2efe8`.
- **Don't** neutralize display tracking. A heading at `letter-spacing: normal` is a defect here.
- **Don't** let a planned-but-unbuilt destination behave like a working page.
