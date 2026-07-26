"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const HERO_READY_EVENT = "portfolio:hero-ready";
const MINIMUM_HOLD_MS = 1350;
const FAILSAFE_MS = 5000;

export function IntroLoader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const page = document.documentElement;
    const heroStage = document.querySelector<HTMLElement>(".hero-stage");
    const heroInterface = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".hero-nav, .hero-copy-grid, .hero-scroll-status",
      ),
    );
    let heroReady = page.dataset.heroReady === "true";
    let minimumElapsed = false;
    let isOpening = false;
    let exitTimeline: gsap.core.Timeline | undefined;

    page.classList.add("is-loading");

    if (!reducedMotion) {
      if (heroStage) gsap.set(heroStage, { scale: 1.035 });
      gsap.set(heroInterface, { autoAlpha: 0.45, y: 12 });
    }

    const finish = () => {
      page.classList.remove("is-loading");
      root.setAttribute("aria-hidden", "true");
      setVisible(false);
    };

    const open = () => {
      if (isOpening || !minimumElapsed || !heroReady) return;
      isOpening = true;

      if (reducedMotion) {
        exitTimeline = gsap.timeline({ onComplete: finish }).to(root, {
          autoAlpha: 0,
          duration: 0.24,
          ease: "power1.out",
        });
        return;
      }

      exitTimeline = gsap.timeline({
        defaults: { ease: "power4.inOut" },
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

    const context = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          ".intro-wordmark",
          { autoAlpha: 0, scale: 0.94 },
          { autoAlpha: 1, scale: 1, duration: reducedMotion ? 0.01 : 0.58 },
        )
        .fromTo(
          ".intro-phrase",
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: reducedMotion ? 0.01 : 0.5 },
          reducedMotion ? 0 : 0.16,
        )
        .fromTo(
          ".intro-seam",
          { scaleX: 0 },
          { scaleX: 1, duration: reducedMotion ? 0.01 : 0.62 },
          reducedMotion ? 0 : 0.12,
        );
    }, root);

    const minimumTimer = window.setTimeout(() => {
      minimumElapsed = true;
      open();
    }, reducedMotion ? 120 : MINIMUM_HOLD_MS);

    const failsafeTimer = window.setTimeout(() => {
      heroReady = true;
      minimumElapsed = true;
      open();
    }, FAILSAFE_MS);

    return () => {
      window.clearTimeout(minimumTimer);
      window.clearTimeout(failsafeTimer);
      window.removeEventListener(HERO_READY_EVENT, onHeroReady);
      context.revert();
      exitTimeline?.kill();
      page.classList.remove("is-loading");
      if (heroStage) gsap.set(heroStage, { clearProps: "scale" });
      gsap.set(heroInterface, { clearProps: "opacity,visibility,transform" });
    };
  }, []);

  if (!visible) return null;

  return (
    <div ref={rootRef} className="intro-loader" role="status" aria-label="Loading portfolio">
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
        <p className="intro-phrase">Designing clarity into motion.</p>
      </div>

      <div className="intro-seam" aria-hidden="true">
        <span className="intro-seam-fill" />
      </div>
      <span className="sr-only">Preparing Edgar Bonilla&apos;s portfolio.</span>
    </div>
  );
}
