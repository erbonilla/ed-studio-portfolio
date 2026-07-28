"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ContactSection.module.css";

const EMAIL = "erbonilla@outlook.com";

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const signatureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const signature = signatureRef.current;
    if (!section || !signature) return;

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

      gsap.fromTo(
        signature,
        { xPercent: -53 },
        {
          xPercent: -47,
          ease: "none",
          scrollTrigger: {
            trigger: signature,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.7,
          },
        },
      );
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
            <h2 id="contact-title" data-contact-reveal>
              Let&apos;s make
              <br />
              it <span>clear.</span>
            </h2>
          </div>

          <div className={styles.action} data-contact-reveal>
            <p>
              Product challenges, design systems, accessibility, or a role where thoughtful
              design can create real momentum.
            </p>
            <a className={styles.emailButton} href={`mailto:${EMAIL}`}>
              <span>Start a conversation</span>
              <span className={styles.buttonArrow} aria-hidden="true">
                ↗
              </span>
            </a>
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

        <div className={styles.signature} aria-label="ED-BONILLA">
          <span ref={signatureRef}>ED-BONILLA</span>
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
