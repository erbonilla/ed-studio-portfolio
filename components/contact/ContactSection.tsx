"use client";

import { useEffect, useRef } from "react";
import { useGsapClient } from "@/lib/use-gsap-client";
import Shuffle from "@/components/effects/Shuffle";
import SplitText from "@/components/effects/SplitText";
import { Button04 } from "@/components/ui/animated-arrow-button";
import styles from "./ContactSection.module.css";

const EMAIL = "erbonilla@outlook.com";

export function ContactSection() {
  const gsapModules = useGsapClient();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!gsapModules) return;
    const { gsap, ScrollTrigger } = gsapModules;
    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const context = gsap.context(() => {
      gsap.from("[data-contact-reveal]", {
        y: 44,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 76%",
          once: true,
        },
      });

    }, section);

    return () => context.revert();
  }, [gsapModules]);

  return (
    <section ref={sectionRef} id="contact" className={styles.section} aria-labelledby="contact-title">
      <div className={styles.shell}>
        <div className={styles.topline} data-contact-reveal>
          <p>Contact / 04</p>
          <p>
            <span className={styles.statusDot} aria-hidden="true" />
            Costa Rica · Working globally
          </p>
          <a href="#home">Back to top ↑</a>
        </div>

        <div className={styles.conversation}>
          <div className={styles.intro}>
            <p className={styles.eyebrow} data-contact-reveal>
              Have something complex in mind?
            </p>
            <SplitText
              id="contact-title"
              tag="h2"
              text="LET'S MAKE IT CLEAR"
              className={styles.splitHeadline}
              delay={45}
              duration={0.72}
              ease="power3.out"
              splitType="words, chars"
              from={{ opacity: 0, y: 72, rotateX: -55 }}
              to={{ opacity: 1, y: 0, rotateX: 0 }}
              threshold={0.18}
              rootMargin="-60px"
              textAlign="left"
            />
          </div>

          <div className={styles.action} data-contact-reveal>
            <p>
              Product challenges, design systems, accessibility, or a role where thoughtful
              design can create real momentum.
            </p>
            <Button04
              className={styles.contactButton}
              href={`mailto:${EMAIL}`}
              text="Start a conversation"
              variant="brand"
              size="large"
              fullWidth
            />
          </div>
        </div>

        <div className={styles.utility} data-contact-reveal>
          <div>
            <span className={styles.utilityLabel}>Direct</span>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </div>
          <div>
            <span className={styles.utilityLabel}>Elsewhere</span>
            <a href="https://github.com/erbonilla" target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
          </div>
          <div>
            <span className={styles.utilityLabel}>Focus</span>
            <span>Health · Wellness · Endurance</span>
          </div>
        </div>

        <div className={styles.signature}>
          <Shuffle
            text="ED BONILLA"
            tag="span"
            className={styles.signatureTrack}
            shuffleDirection="right"
            duration={0.48}
            animationMode="evenodd"
            shuffleTimes={2}
            ease="power3.out"
            stagger={0.04}
            threshold={0.12}
            rootMargin="-40px"
            scrambleCharset="EDBONILA/+"
            colorFrom="#ffffff"
            colorTo="#ff4f18"
            triggerOnce
            triggerOnHover
            respectReducedMotion
          />
        </div>

        <footer className={styles.footer}>
          <p>Senior UI/UX Designer</p>
          <p>English / Español</p>
          <p>Designed with clarity. Built with care.</p>
        </footer>
      </div>
    </section>
  );
}
