"use client";

import { useEffect, useRef, useState } from "react";
import { useGsapClient } from "@/lib/use-gsap-client";

const HERO_READY_EVENT = "portfolio:hero-ready";
const MINIMUM_HOLD_MS = 420;
/* A visitor who has already watched the aperture open this session gets the
   fact of the brand, not the performance of it a second time. */
const RETURNING_HOLD_MS = 180;
const FAILSAFE_MS = 5000;
/* Beyond this the sequence is not late, it is broken. Runs whether or not the
   motion chunk ever arrived. */
const HARD_DISMISS_MS = 6000;
const SEEN_KEY = "portfolio:intro-seen";
const DEEP_LINK_TARGETS = new Set(["about", "work", "contact"]);

/* Someone arriving on a shared #work or #contact link asked for a section, not
   for the opening titles. Reading this once at module scope keeps it stable
   across the render that follows hydration. */
const arrivedOnDeepLink = () => {
  if (typeof window === "undefined") return false;
  return DEEP_LINK_TARGETS.has(window.location.hash.replace("#", ""));
};

const hasSeenIntro = () => {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    // Private mode or a blocked storage partition: treat as a first visit.
    return false;
  }
};

const markIntroSeen = () => {
  try {
    window.sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Nothing to recover from — the intro simply plays in full next time.
  }
};

export function IntroLoader() {
  const gsapModules = useGsapClient();
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  /*
   * Runs independently of the motion stack. If the GSAP chunk never resolves,
   * the effect below never mounts its timers and this fixed, full-viewport
   * orange panel would sit over the entire portfolio forever. Its CSS twin in
   * globals.css covers the case where React itself never hydrates.
   */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      document.documentElement.classList.remove("is-loading");
      setVisible(false);
    }, HARD_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const gsap = gsapModules?.gsap;
    if (!gsap) return;
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // A deep link and a repeat visit both want the page, not the overture. The
    // deep link skips it outright; the repeat visit keeps a short beat so the
    // hand-off into the hero is not a jump cut.
    const deepLink = arrivedOnDeepLink();
    const returning = hasSeenIntro();
    const abbreviated = reducedMotion || deepLink || returning;
    const page = document.documentElement;
    const heroStage = document.querySelector<HTMLElement>(".hero-stage");
    const heroInterface = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".hero-nav, .hero-copy-grid, .hero-scroll-status",
      ),
    );
    let heroReady = page.dataset.heroReady === "true";
    let minimumElapsed = false;
    let enterTimeline: ReturnType<typeof gsap.timeline> | undefined;
    let exitTimeline: ReturnType<typeof gsap.timeline> | undefined;

    page.classList.add("is-loading");

    // Only the full overture dims and scales the hero behind the panels. An
    // abbreviated exit does not run the timeline that restores them, so it must
    // not stage them either.
    if (!abbreviated) {
      if (heroStage) gsap.set(heroStage, { scale: 1.035 });
      gsap.set(heroInterface, { autoAlpha: 0.45, y: 12 });
    }

    const finish = () => {
      page.classList.remove("is-loading");
      root.setAttribute("aria-hidden", "true");
      markIntroSeen();
      setVisible(false);

      // The browser's own hash jump happened while the document was still
      // locked, so it landed nowhere. Re-issue it now that the page can move.
      if (deepLink) {
        const id = window.location.hash.slice(1);
        // Next frame, so the pinned hero has been measured and the offsets the
        // jump lands on are the final ones.
        window.requestAnimationFrame(() => {
          document.getElementById(id)?.scrollIntoView({ block: "start" });
        });
      }
    };

    const open = (options?: { force?: boolean }) => {
      const force = options?.force === true;
      // Skip must respond on pointer-down. heroReady only gates the unattended
      // path so the exit does not race incomplete hero chrome on auto-play.
      if (!force && (!minimumElapsed || !heroReady)) return;
      if (exitTimeline) {
        // Already leaving: a second tap/key inherits the live values and
        // just arrives faster. Killing and rebuilding would jump.
        exitTimeline.timeScale(2.6);
        return;
      }

      enterTimeline?.kill();
      minimumElapsed = true;
      heroReady = true;

      if (abbreviated) {
        exitTimeline = gsap.timeline({ onComplete: finish }).to(root, {
          autoAlpha: 0,
          duration: 0.24,
          ease: "power1.out",
        });
        return;
      }

      exitTimeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: finish,
      });

      exitTimeline
        .to(".intro-seam-fill", { scaleX: 1, duration: 0.42, ease: "power3.out" }, 0)
        .to(".intro-wordmark", { y: "-34vh", scale: 0.88, duration: 0.92 }, 0.28)
        .to(".intro-phrase", { y: "34vh", duration: 0.92 }, 0.28)
        .to(".intro-panel-top", { yPercent: -100, duration: 1.06 }, 0.42)
        .to(".intro-panel-bottom", { yPercent: 100, duration: 1.06 }, 0.42)
        .to(".intro-corner", { autoAlpha: 0, duration: 0.28, ease: "power2.out" }, 0.46)
        .to(
          [".intro-wordmark", ".intro-phrase", ".intro-seam"],
          { autoAlpha: 0, duration: 0.24, ease: "power2.out" },
          1.12,
        )
        .to(heroStage, { scale: 1, duration: 1.1, ease: "power3.out" }, 0.42)
        .to(
          heroInterface,
          { autoAlpha: 1, y: 0, duration: 0.72, stagger: 0.035, ease: "power3.out" },
          0.72,
        )
        .set(root, { display: "none" });
    };

    const onHeroReady = () => {
      heroReady = true;
      open();
    };

    window.addEventListener(HERO_READY_EVENT, onHeroReady);

    const skipHold = () => {
      minimumElapsed = true;
      open({ force: true });
    };

    const onPointerDown = () => skipHold();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" && event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      skipHold();
    };

    root.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    const context = gsap.context(() => {
      enterTimeline = gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          ".intro-wordmark",
          { autoAlpha: 0, scale: 0.94 },
          { autoAlpha: 1, scale: 1, duration: abbreviated ? 0.01 : 0.58 },
        )
        .fromTo(
          ".intro-phrase",
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: abbreviated ? 0.01 : 0.5 },
          abbreviated ? 0 : 0.16,
        )
        .fromTo(
          ".intro-seam",
          { scaleX: 0 },
          { scaleX: 1, duration: abbreviated ? 0.01 : 0.62 },
          abbreviated ? 0 : 0.12,
        );
    }, root);

    const minimumTimer = window.setTimeout(
      () => {
        minimumElapsed = true;
        open();
      },
      // Reduced motion and a deep link both want out immediately; a returning
      // visitor gets a beat, not a hold.
      reducedMotion || deepLink ? 120 : returning ? RETURNING_HOLD_MS : MINIMUM_HOLD_MS,
    );

    const failsafeTimer = window.setTimeout(() => {
      heroReady = true;
      minimumElapsed = true;
      open();
    }, FAILSAFE_MS);

    return () => {
      window.clearTimeout(minimumTimer);
      window.clearTimeout(failsafeTimer);
      window.removeEventListener(HERO_READY_EVENT, onHeroReady);
      window.removeEventListener("keydown", onKeyDown);
      root.removeEventListener("pointerdown", onPointerDown);
      context.revert();
      enterTimeline?.kill();
      exitTimeline?.kill();
      page.classList.remove("is-loading");
      if (heroStage) gsap.set(heroStage, { clearProps: "scale" });
      gsap.set(heroInterface, { clearProps: "opacity,visibility,transform" });
    };
  }, [gsapModules]);

  if (!visible) return null;

  return (
    /* The live region is the one sentence below, not this whole subtree. With
       role="status" on the container, every panel and corner label was part of
       the announcement and the wordmark's mask element read as noise. */
    <div ref={rootRef} className="intro-loader">
      <div className="intro-panel intro-panel-top" aria-hidden="true" />
      <div className="intro-panel intro-panel-bottom" aria-hidden="true" />

      <div className="intro-corner intro-corner-left" aria-hidden="true">
        ED / 2026
      </div>
      <div className="intro-corner intro-corner-right" aria-hidden="true">
        Costa Rica · Remote
      </div>

      <div className="intro-identity">
        <span className="intro-wordmark" aria-hidden="true" />
        {/* Word for word the hero h1 that follows. Announcing it here made
            screen-reader visitors hear the headline twice before the page
            existed. */}
        <p className="intro-phrase" aria-hidden="true">
          Designing clarity into motion.
        </p>
      </div>

      <div className="intro-seam" aria-hidden="true">
        <span className="intro-seam-fill" />
      </div>
      <span className="sr-only" role="status">
        Loading Edgar Bonilla&apos;s portfolio. Tap, or press Escape, to enter.
      </span>
    </div>
  );
}
