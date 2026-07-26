# Edgar Bonilla — Portfolio

The current scope is a branded landing intro, one cinematic portfolio hero, and a full-bleed About/Expertise chapter. The intro opens from a horizontal seam once the hero's key frames are ready; the 195-frame hero sequence is then scrubbed by scroll with GSAP choreography, Lenis smoothing, pointer parallax, and a lightweight Three.js optical field. The About portrait uses a Canvas 2D liquid aperture to reveal the aligned monochrome image beneath the orange layer.

## Structure

- `components/hero/PortfolioHero.tsx` — scroll, canvas sequence, parallax, and Three.js scene
- `components/intro/IntroLoader.tsx` — readiness-aware opening transition into the hero
- `components/about/AboutSection.tsx` — layered portrait reveal, About narrative, and Expertise index
- `lib/portfolio-content.ts` — portfolio copy source
- `app/globals.css` — responsive visual system and reduced-motion fallbacks
- `public/assets/hero/frames/` — optimized 1600×900 runtime frames
- `public/assets/about/` — aligned orange and monochrome About portraits
- `files/` — untouched source frames, video, logos, and product/design briefs

See [`files/docs/HERO-IMPLEMENTATION.md`](files/docs/HERO-IMPLEMENTATION.md) for the motion model, asset pipeline, accessibility rules, and maintenance checklist.

## Run

```bash
pnpm install
pnpm dev
```

Projects and Contact are intentionally not implemented yet.
