"use client";

import { useEffect, useRef, useState } from "react";
import { useGsapClient } from "@/lib/use-gsap-client";
import { portfolioContent } from "@/lib/portfolio-content";
import Shuffle from "@/components/effects/Shuffle";
import SplitText from "@/components/effects/SplitText";
import { Button04 } from "@/components/ui/animated-arrow-button";
import styles from "./ContactSection.module.css";

const EMAIL = "erbonilla@outlook.com";

// A pre-filled subject means the message arrives already labelled, and the
// visitor is not staring at an empty compose window deciding how to open.
const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent(
  "UI/UX role — let's talk",
)}`;

const { contact } = portfolioContent;

const SOCIAL_LINKS = [
  {
    label: "Instagram — @coacherbonilla",
    href: "https://www.instagram.com/coacherbonilla/",
    platform: "instagram",
    glyph: "",
  },
  {
    label: "LinkedIn — Edgar Bonilla G.",
    href: "https://www.linkedin.com/in/edgarbonillag/",
    platform: "linkedin",
    glyph: "in",
  },
  {
    label: "Facebook — Oxígeno Zarcero",
    href: "https://www.facebook.com/oxygenozar",
    platform: "facebook",
    glyph: "f",
  },
  {
    label: "X — @erbonilla",
    href: "https://x.com/erbonilla",
    platform: "x",
    glyph: "X",
  },
] as const;

export function ContactSection() {
  const gsapModules = useGsapClient();
  const sectionRef = useRef<HTMLElement>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "blocked">("idle");
  const resetTimer = useRef<number | undefined>(undefined);
  const copied = copyState === "copied";

  const copyEmail = async () => {
    window.clearTimeout(resetTimer.current);
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopyState("copied");
      resetTimer.current = window.setTimeout(() => setCopyState("idle"), 2400);
    } catch {
      /*
       * The clipboard API is blocked over plain http, inside some in-app
       * browsers, and behind a denied permission. The click used to do nothing
       * and say nothing — the recovery (the address is right there, selectable)
       * was only ever written in this comment. Now it reaches the visitor.
       */
      setCopyState("blocked");
      resetTimer.current = window.setTimeout(() => setCopyState("idle"), 6000);
    }
  };

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  useEffect(() => {
    if (!gsapModules) return;
    const { gsap, ScrollTrigger } = gsapModules;
    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const context = gsap.context(() => {
      /*
       * The SplitText headline is this chapter's authored moment. Everything
       * around it arrives as one quiet block — no stagger, short distance —
       * so the supporting copy settles rather than performing its own entrance.
       */
      gsap.from("[data-contact-reveal]", {
        y: 14,
        autoAlpha: 0,
        duration: 0.62,
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
          <p>Contact</p>
          <p>
            <span className={styles.statusDot} aria-hidden="true" />
            Costa Rica · Working globally
          </p>
          <a href="#home">Back to top ↑</a>
        </div>

        <div className={styles.conversation}>
          <div className={styles.intro}>
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
              Have something complex in mind? Product challenges, design systems,
              accessibility, or a role where thoughtful design can create real momentum.
            </p>

            {/* The facts a hiring manager needs before writing, at the moment
                they decide to write. They previously lived only in the menu
                overlay and the About signals. */}
            <dl className={styles.availability}>
              {contact.availability.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>

            <div className={styles.contactActions}>
              <Button04
                href={MAILTO}
                text="Start a conversation"
                compactText="Email me"
                variant="brand"
                size="large"
                fullWidth
              />
              <div className={styles.resumePair}>
                <Button04
                  href="/assets/resume/edgar-bonilla-resume-en.pdf"
                  text="Résumé — EN"
                  /* Both controls hand over a file. Under the pointer they say
                     so outright, and the arrow turns to point at the download
                     rather than off the page. */
                  hoverText="Download"
                  arrow="down"
                  variant="outline-light"
                  size="large"
                  fullWidth
                  download="Edgar-Bonilla-Resume-EN.pdf"
                  /* Starts with the visible label. The old name replaced it
                     outright, so "click Résumé EN" matched nothing under voice
                     control (WCAG 2.5.3, Label in Name). */
                  aria-label="Résumé — EN: download in English, PDF"
                />
                <Button04
                  href="/assets/resume/edgar-bonilla-resume-es.pdf"
                  text="CV — ES"
                  hoverText="Download"
                  arrow="down"
                  variant="outline-light"
                  size="large"
                  fullWidth
                  download="Edgar-Bonilla-Resume-ES.pdf"
                  /* The label is Spanish and the document behind it is Spanish;
                     without both attributes an English screen reader announces
                     the whole string in English phonetics. */
                  lang="es"
                  hrefLang="es"
                  aria-label="CV — ES: descargar en español, PDF"
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.utility} data-contact-reveal>
          <div>
            <span className={styles.utilityLabel}>Direct</span>
            {/*
              Copying the address is the conversion moment on this page, so it
              confirms optically rather than by swapping a word: the label
              wipes over on the same seam the chapter breaks use, and a single
              pass of light crosses the address to say *that* is what is on the
              clipboard. `role="status"` below carries the same fact to anyone
              who cannot see either.
            */}
            <span className={styles.directRow} data-copied={copied ? "true" : undefined}>
              <a href={MAILTO}>{EMAIL}</a>
              <button
                className={styles.copyEmail}
                type="button"
                onClick={copyEmail}
                aria-label={`Copy ${EMAIL} to clipboard`}
                data-copied={copied ? "true" : undefined}
              >
                <span className={styles.copySwap} aria-hidden="true">
                  <span>Copy</span>
                  <span>Copied</span>
                </span>
              </button>
            </span>
            <span
              className={styles.copyStatus}
              data-state={copyState === "idle" ? undefined : copyState}
              role="status"
            >
              {copyState === "copied" ? `${EMAIL} copied to clipboard` : null}
              {copyState === "blocked"
                ? "This browser blocked the clipboard. Select the address above to copy it, or use the email button."
                : null}
            </span>
          </div>
          <div>
            <span className={styles.utilityLabel}>Elsewhere</span>
            {/* `role="group"` is what carries the label; on a bare div it was
                dropped, so four icon links announced with no shared context. */}
            <div className={styles.socialLinks} role="group" aria-label="Social profiles">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.platform}
                  className={styles.socialLink}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  /* Every one of these leaves the site in a new tab. Sighted
                     users get no icon for that and screen-reader users got no
                     warning at all, so the accessible name says it. */
                  aria-label={`${social.label} (opens in a new tab)`}
                  title={social.label}
                >
                  <span
                    className={styles.socialIcon}
                    data-platform={social.platform}
                    aria-hidden="true"
                  >
                    {social.glyph}
                  </span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <span className={styles.utilityLabel}>Focus</span>
            <span>Health · Wellness · Fitness · Endurance</span>
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
          <p>UI/UX Designer</p>
          {/* Marked so a screen reader switches voice for the Spanish word
              instead of reading "Español" with English phonetics. */}
          <p>
            English / <span lang="es">Español</span>
          </p>
          <p>Designed with clarity. Built with care.</p>
        </footer>
      </div>
    </section>
  );
}
