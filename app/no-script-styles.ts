/*
 * Injected verbatim into a <noscript> element by app/layout.tsx, so every rule
 * here applies only when scripting is disabled. Plain selectors are correct —
 * the <noscript> wrapper is the condition.
 *
 * This is a module rather than a stylesheet because the rules have to travel
 * inside the first HTML response, and every bundler in play has to agree on
 * how to read them. A plain string does; raw-text CSS imports do not.
 *
 * This file is only for what genuinely needs a scripting engine: the pinned
 * scroll rig and the interactions built on it. Failures that happen *with*
 * scripting on — a motion chunk that never arrives, WebGL refused, frames that
 * 404 — are handled in globals.css and in the components themselves, because
 * <noscript> stays inert for all of them.
 *
 * The page loses the choreography here and keeps the argument: every fact,
 * every link, every download.
 */

/*
 * Rule-by-rule reasoning, in source order:
 *
 * `.intro-loader` — a curtain with nothing to raise it.
 *
 * `.hero-sequence` / `.about-understory` — two viewport-heights of pinned stage
 * with nothing to scrub through is not a hero, it is a dead scroll, and the
 * About understory is three more. Each chapter collapses to the height of its
 * own content and the page reads straight down.
 *
 * `.hero-scroll-status`, `.hero-beat-statement`, `.about-reveal-hint`,
 * `.about-cursor` — progress readouts and reveal prompts describe interactions
 * that need the scroll rig. Without it they are instructions to do something
 * impossible.
 *
 * `.about-depth-label` — goes too, but it holds the first column of the
 * understory grid. Removing it from flow drops the story block into that 260px
 * rail and guillotines the lead type, so it is hidden in place instead.
 *
 * `.nav-menu-trigger` / `.portfolio-menu` — the wordmark and the contact CTA
 * are real links and still work. The Menu trigger is a button whose handler
 * never ran, so it goes, and the header closes up into a working two-part bar.
 *
 * `.hero-nav` — the bar's light/dark swap is measured on scroll, so without
 * scripting it stays in its dark register and the wordmark goes invisible the
 * moment the cream Work chapter passes beneath it. Unpinned, it becomes a
 * masthead: it sits over the near-black hero where it was designed to live,
 * and scrolls away instead of colliding with a chapter it cannot read.
 *
 * `.about-image-orange-fallback` — the portrait's monochrome layer is revealed
 * by a pointer-driven canvas that never initialises. The orange layer above it
 * is the finished composition.
 */
export const NO_SCRIPT_STYLES = `
.intro-loader {
  display: none;
}

.hero-sequence,
.about-understory {
  height: auto;
}

.hero-stage,
.about-understory-stage {
  position: relative;
  top: auto;
}

.hero-stage {
  height: 100svh;
}

.about-understory-stage {
  min-height: 0;
  padding-block: clamp(72px, 9vw, 132px);
}

.hero-scroll-status,
.hero-beat-statement,
.about-reveal-hint,
.about-cursor {
  display: none;
}

.about-depth-label {
  visibility: hidden;
}

.nav-menu-trigger,
.portfolio-menu {
  display: none;
}

.hero-nav {
  position: static;
  grid-template-columns: 1fr auto;
  margin: 0 clamp(20px, 3.4vw, 56px);
  pointer-events: auto;
}

.about-image-orange-fallback {
  opacity: 1;
}
`.trim();
