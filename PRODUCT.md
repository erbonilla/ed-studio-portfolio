# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: hiring managers, recruiters, and design leaders evaluating Edgar Bonilla G. for a **full-time UI/UX role**. They arrive from a résumé, LinkedIn, or a referral, scan for 30–60 seconds on desktop or phone, and are deciding one thing: is this person a credible designer worth a conversation.

They need fast proof of role fit, domain relevance (health, wellness, fitness, endurance), remote readiness, bilingual capability, and accessibility judgment — without reading a case study end to end.

Freelance and client inquiries are welcome but are not the surface's job. Nothing should be designed around them.

## Product Purpose

Position Edgar Bonilla G. as a detail-oriented UI/UX designer for accessible health-adjacent digital products.

Success is a recruiter or design lead finishing the page with an accurate read on role, level, and domain, and enough confidence to make contact. The craft of the site is itself the primary evidence: it must demonstrate senior execution rather than assert it.

## Positioning

Two things a neighboring portfolio could not truthfully copy:

1. **Health-adjacent specialization with real domain grounding.** Health, wellness, fitness, and endurance — contexts where confusing flows and inaccessible details carry real consequences. This is lived domain knowledge, not a claimed vertical.
2. **Evidence discipline as a stated practice.** The Osteóplus case study audits its own claims against the working build and publishes the gaps (two claims accurate, four overstated, three unverified). Refusing to convert design intent into invented outcomes is a positioning asset, not a liability to be smoothed over. The site states this in prose and links to the case study; the ledger graphic that scored the audit 2-of-9 on the home page was removed on 2026-08-13, because a fill-level chart reads as an accuracy grade rather than as rigor.

Supporting: bilingual ES/EN practice, accessibility built in from first sketch rather than bolted on at audit, and human-led AI-assisted workflows.

## Operating Context

- Based in Zarcero, Costa Rica. Remote-ready, collaborating across time zones.
- Works in English and Spanish; system copy and research are produced bilingually.
- End-to-end practice: research → IA → UX/UI → design systems → prototype/build.
- Uses AI-assisted workflows with human review to accelerate production without lowering the quality bar.

## Capabilities and Constraints

**Implemented surfaces** (single route, `app/page.tsx`): intro loader, persistent navigation, scroll-driven hero, About/Expertise chapter, Work marquee, Work section with two case studies, Contact section. Work and Contact are now built — the earlier brief that described them as unimplemented is superseded.

**Technical constraints future work must preserve:**

- Next.js 16 + React 19 on Vite/vinext, deployed via Cloudflare Workers (`wrangler`). pnpm only.
- No Tailwind. No CMS.
- Exactly one `h1`, owned by the portfolio hero.
- Portfolio copy stays in `lib/portfolio-content.ts` until a broader content model is introduced.
- Three.js stays dynamically imported and isolated to the hero. Do not add a second WebGL scene without revisiting performance and interaction budgets.
- The About portrait reveal stays on Canvas 2D for the same reason.
- Motion stack is GSAP + Lenis; every animated surface needs a reduced-motion path.

**Undecided:** whether Work expands beyond two case studies; whether a separate per-project route replaces the external case-study links.

## Brand Commitments

- Name and wordmark: Edgar Bonilla G. / "ED" studio wordmark (`public/assets/brand/ed-studio-wordmark.svg`).
- Voice: type-led, disciplined, premium, kinetic, accessible. Confident design leadership — memorable enough for a recruiter, restrained enough for a serious product team.
- Signature concept: **focus** — the intro aperture opens, the hero sequence moves from obstruction to clarity. Motion serves comprehension, never decoration.
- Anti-references: generic SaaS layouts, card-heavy template grids, beige editorial defaults, decorative gradient text, excessive rounding, unverified claims, motion without narrative purpose.

## Evidence on Hand

Real, on disk:

- **Atlan** (2026) — adaptive endurance coaching PWA. Self-initiated concept, functional PWA, **not launched**. Case study: `atlan-case-study-v2.vercel.app`; live app: `atlan-app-web-preview.vercel.app`. Media in `public/assets/work/atlan/`, stills in `public/images/atlan/`.
- **Osteóplus** (2025–26) — senior-accessible rehabilitation PWA. Fictional solo concept, working prototype, **nothing shipped**. Case study: `osteoplus-case-study-v2.vercel.app`; live site: `osteoplus-v2-9.vercel.app`. Media in `public/assets/work/osteoplus/` and `public/assets/osteoplus/`.
- Résumés in EN and ES: `public/assets/resume/`.
- Contact: erbonilla@outlook.com. LinkedIn `/in/edgarbonillag`, X `@erbonilla`, Instagram `@coacherbonilla`, Facebook `Oxígeno Zarcero`.
- Hero frame sequence (195 frames), About portraits, ribbon background frames — all in `public/assets/`.

**Absences future work must never paper over:** there are no shipped products, no real users, no adoption or outcome metrics, no client testimonials, no press, and no employer case studies — public or NDA'd. Both projects are concept work and are labeled as such on the page. Do not invent metrics, logos, testimonials, or "trusted by" proof. The honest labeling is deliberate and is part of the positioning; removing or softening it would damage the thing it is meant to demonstrate.

## Product Principles

1. **Lead with recognizable craft, not explanation.** The execution is the argument.
2. **Every claim must be auditable.** Copy lives in the content module; nothing asserts more than the evidence supports.
3. **Preserve the fast scan path.** Identity, role, domains, and location stay visible without interaction, at every breakpoint.
4. **Motion choreographs comprehension.** Scroll, parallax, and camera movement carry meaning or they don't ship.
5. **First paint never depends on WebGL.** Real DOM type and a CSS frame fallback carry the page alone.
6. **Make incomplete destinations explicit.** Preview a planned section in navigation if useful, but never let it behave like a working page.

## Accessibility & Inclusion

Target WCAG 2.2 AA — non-negotiable, and doubly so given the health-adjacent positioning.

- Exactly one `h1`; semantic content lives outside the canvases.
- Decorative canvases and text effects are `aria-hidden`.
- A genuine `prefers-reduced-motion` mode: static frame, no Three.js, no scroll choreography — not a degraded afterthought.
- Interactive controls require visible focus states and descriptive labels.
- Bilingual EN/ES audience; do not assume English-first reading.
