"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GlitchText from "@/components/effects/GlitchText";
import SplitText from "@/components/effects/SplitText";
import { Button04 } from "@/components/ui/animated-arrow-button";
import styles from "./ContactSection.module.css";

const EMAIL = "erbonilla@outlook.com";

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
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
  }, []);

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
          <GlitchText
            className={styles.signatureTrack}
            speed={0.8}
            enableShadows
            enableOnHover
          >
            ED BONILLA
          </GlitchText>
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
