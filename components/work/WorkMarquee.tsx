"use client";

import { useEffect, useRef } from "react";
import styles from "./WorkMarquee.module.css";

const marqueeItems = [
  "Work",
  "Case",
  "Studies",
  "Atlan",
  "Adapt when plans change",
  "Osteóplus",
  "Make the next safe action clear",
] as const;

function MarqueeGroup({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className={styles.group} aria-hidden="true">
      {marqueeItems.map((item) => (
        <span className={styles.item} key={`${duplicate ? "duplicate" : "primary"}-${item}`}>
          {item}
          <i>—</i>
        </span>
      ))}
    </div>
  );
}

export function WorkMarquee() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      section.dataset.paused = "true";
      return;
    }

    /*
     * Ambient lateral motion only earns its keep while the seam is on screen.
     * Leaving the loop running off-stage stacks continuous FOV motion with the
     * tools loop below without any utility.
     */
    const observer = new IntersectionObserver(
      ([entry]) => {
        section.dataset.paused = entry.isIntersecting ? "false" : "true";
      },
      { rootMargin: "12% 0px", threshold: 0 },
    );

    section.dataset.paused = "true";
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    /*
     * A named <section> becomes a landmark, so this band was listing itself in
     * the landmark menu under a whole two-sentence name. Everything it says —
     * both project names and both taglines — is stated properly in the Work
     * chapter immediately below, so it leaves the accessibility tree entirely
     * and stays what it looks like: a kinetic seam between two registers.
     */
    <section
      ref={sectionRef}
      className={styles.marquee}
      data-nav-theme="light"
      data-paused="true"
      aria-hidden="true"
    >
      <div className={styles.meta} aria-hidden="true">
        <span>Next / Selected work</span>
        <span>02 case studies</span>
      </div>

      <div className={styles.viewport}>
        <div className={styles.track}>
          <MarqueeGroup />
          <MarqueeGroup duplicate />
        </div>
      </div>
    </section>
  );
}
