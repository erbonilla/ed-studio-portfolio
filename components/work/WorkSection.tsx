"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useGsapClient } from "@/lib/use-gsap-client";
import { Shuffle } from "@/components/effects/Shuffle";
import { LogoLoop } from "@/components/effects/LogoLoop";
import { Button04 } from "@/components/ui/animated-arrow-button";
import { WorkBackgroundSequence } from "./WorkBackgroundSequence";
import { toolLogos } from "./tool-logos";

const projects = [
  {
    slug: "atlan",
    index: "01",
    name: "Atlan",
    title: "Designing a coach for athletes with lives",
    eyebrow: "Adaptive endurance coaching PWA",
    year: "2026",
    status: "Self-initiated concept · Functional PWA, not launched",
    description:
      "An offline-first, bilingual coaching PWA designed to absorb disruption without turning a changed week into a failure state.",
    scene:
      "The meeting ran 45 minutes late. Session Swapper offers a lower-cost alternative, rebalances the week, and leaves the training math one tap away.",
    role: "End-to-end product strategy, IA, UX/UI, brand system, PWA build",
    focus: "Adherence, poolside interaction, ES / EN system copy",
    proof: ["Functional PWA", "Session Swapper", "Wet Mode", "Documented vs. expected"],
    video: "/assets/work/atlan/context-loop.mp4",
    poster: "/assets/work/atlan/swimmer.webp",
    detail: "/assets/work/atlan/wet-mode.webp",
    detailAlt: "A wet hand reaching toward a phone in a waterproof case beside a pool.",
    videoLabel:
      "Silent loop of a swimmer pushing away from the pool wall at sunrise.",
    caseStudy: "https://atlan-case-study-v2.vercel.app/Atlan%20Case%20Study.html",
    /* The destination is the interactive web preview, not a shipped build —
       the label says so, in the same register as the "not launched" status. */
    live: "https://atlan-app-web-preview.vercel.app/",
    liveLabel: "Open app preview",
    liveDescription: "the Atlan mobile app preview",
  },
  {
    slug: "osteoplus",
    index: "02",
    name: "Osteóplus",
    title: "From medical repository to Action Dashboard",
    eyebrow: "Senior-accessible rehabilitation PWA",
    year: "2025–26",
    status: "Fictional solo concept · Working prototype, nothing shipped",
    description:
      "A bilingual rehabilitation concept built around guest-first booking and the next safe action—then audited claim by claim against the working build.",
    scene:
      "The audit found two claims accurate, four overstated, and three unverified. The case study keeps those gaps visible instead of turning design intent into outcomes.",
    role: "End-to-end product strategy, IA, UX/UI, accessibility, prototype",
    focus: "Adults 60+, guest booking, safety, evidence discipline",
    proof: ["Today-first IA", "Guest-first booking", "Live-build audit", "Clinical boundaries"],
    video: "/assets/work/osteoplus/context-loop.mp4",
    poster: "/assets/work/osteoplus/rehab.webp",
    detail: "/assets/work/osteoplus/booking.webp",
    detailAlt:
      "An older adult using a smartphone at home with Barcelona visible through the window.",
    videoLabel:
      "Silent loop of an older adult following a guided care routine at home.",
    caseStudy: "https://osteoplus-case-study-v2.vercel.app/",
    live: "https://osteoplus-v2-9.vercel.app/",
    liveLabel: "Open the website",
    liveDescription: "the Osteóplus website",
  },
] as const;

export function WorkSection() {
  const gsapModules = useGsapClient();
  const sectionRef = useRef<HTMLElement>(null);
  const shutterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gsapModules) return;
    const { gsap, ScrollTrigger } = gsapModules;
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const videos = Array.from(section.querySelectorAll<HTMLVideoElement>("video"));
    const cleanups: Array<() => void> = [];

    if (!reducedMotion) {
      const videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target as HTMLVideoElement;
            if (entry.isIntersecting) {
              void video.play().catch(() => undefined);
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.35 },
      );

      videos.forEach((video) => videoObserver.observe(video));
      cleanups.push(() => videoObserver.disconnect());
    } else {
      videos.forEach((video) => video.pause());
    }

    gsap.registerPlugin(ScrollTrigger);
    const animationContext = gsap.context(() => {
      if (reducedMotion) return;

      /*
       * The register shutter. The chapter above this one is a solid orange
       * field; this chapter is paper. Rather than cut between them, the
       * aperture the intro loader opens on load actuates a second time here,
       * scrubbed by scroll: the orange holds past the point where the paper
       * would have arrived, then the blade drops away and the light register
       * is exposed.
       *
       * The blade is the marquee's own orange and sits in flow at the very top
       * of this chapter rather than fixed over the viewport, so it is exactly
       * as tall as the paper that has arrived and the field above simply looks
       * like it continues. That placement is what makes the shutter free: a
       * viewport-sized overlay would have to switch on at some scroll position,
       * and the marquee is only 84svh (52svh on phones), so there is no
       * position where switching it on would not pop — either over a strip of
       * paper below or over the dark About chapter above.
       */
      const shutter = shutterRef.current;

      if (shutter) {
        shutter.dataset.armed = "true";
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "top top",
              // 1:1 with scroll — lag here reads as latency, not momentum.
              scrub: true,
              invalidateOnRefresh: true,
            },
          })
          // Held shut for the first stretch, so the release reads as a blade
          // letting go rather than as the orange drifting off with the scroll.
          .to({}, { duration: 0.42 })
          .to("[data-shutter-edge]", { scaleX: 0, duration: 0.14, ease: "none" }, 0.42)
          .to(
            "[data-shutter-blade]",
            { yPercent: 100, duration: 0.58, ease: "none" },
            0.42,
          );
      }

      /*
       * Chapter reveals are exposures, not arrivals: a hard-edged wipe along
       * one axis, matching the shutter above and the seam in the intro.
       *
       * Enter and leave both use power2.out from the live value — GSAP's
       * `reverse` time-reverses ease-out into an accelerating close, which
       * breaks Apple's mirrored-path rule. Explicit leave tweens keep the
       * same decelerating character on the way out.
       */
      const expose = (
        targets: string | Element | NodeListOf<Element> | Element[],
        options: {
          trigger: Element | string;
          closed: string;
          open: string;
          duration?: number;
          stagger?: number;
          start?: string;
          clearClip?: boolean;
        },
      ) => {
        const duration = options.duration ?? 0.48;
        const stagger = options.stagger ?? 0;
        const elements = gsap.utils.toArray<HTMLElement>(targets);
        if (elements.length === 0) return;

        gsap.set(elements, {
          clipPath: options.closed,
          ...(options.clearClip ? { willChange: "clip-path" } : null),
        });

        const toState = (open: boolean) => {
          if (!open && options.clearClip) {
            // Open may have cleared clip-path so focus rings can overflow.
            // Re-arm from the fully open inset before closing, otherwise GSAP
            // has nothing to interpolate from and the wipe pops shut.
            elements.forEach((element) => {
              const current = gsap.getProperty(element, "clipPath");
              if (!current || current === "none") {
                gsap.set(element, { clipPath: options.open });
              }
            });
          }

          gsap.to(elements, {
            clipPath: open ? options.open : options.closed,
            duration,
            stagger: open ? stagger : stagger * 0.55,
            ease: "power2.out",
            overwrite: "auto",
            // Focus rings and the arrow-button glyph overflow their boxes, so
            // the clip cannot survive the open state.
            onStart: () => {
              if (options.clearClip) {
                gsap.set(elements, { willChange: "clip-path" });
              }
            },
            onComplete: () => {
              if (open && options.clearClip) {
                gsap.set(elements, { clearProps: "clipPath,willChange" });
              }
            },
          });
        };

        ScrollTrigger.create({
          trigger: options.trigger,
          start: options.start ?? "top 78%",
          onEnter: () => toState(true),
          onLeaveBack: () => toState(false),
        });
      };

      expose(".work-kicker, .work-intro", {
        trigger: ".work-introduction",
        closed: "inset(0 100% 0 0)",
        open: "inset(0 0% 0% 0)",
        stagger: 0.09,
        clearClip: true,
      });

      expose(".work-tools-kicker, .work-tools-loop", {
        trigger: ".work-tools",
        closed: "inset(0 100% 0 0)",
        open: "inset(0 0% 0% 0)",
        duration: 0.78,
        stagger: 0.09,
        start: "top 85%",
        clearClip: true,
      });

      const cards = gsap.utils.toArray<HTMLElement>(".project-story");
      cards.forEach((card) => {
        const media = card.querySelector(".project-media");
        const copy = card.querySelectorAll(
          ".project-status, .project-title, .project-description, .project-scene, .project-facts, .project-actions",
        );
        const visual = card.querySelector(".project-media-visual");
        const detail = card.querySelector(".project-detail-image");

        if (media) {
          expose(media, {
            trigger: card,
            closed: "inset(14% 0 14% 0 round 28px)",
            open: "inset(0% 0 0% 0 round 28px)",
            duration: 0.55,
          });
        }

        // Same exposure verb as the chapter opener, turned 90°: the copy
        // column is read top-to-bottom, so it is uncovered top-to-bottom.
        expose(copy, {
          trigger: card,
          closed: "inset(0 0 100% 0)",
          open: "inset(0 0% 0% 0)",
          duration: 0.48,
          stagger: 0.065,
          start: "top 70%",
          clearClip: true,
        });

        if (visual) {
          gsap.fromTo(
            visual,
            { scale: 1.04 },
            {
              scale: 1.11,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }

        if (detail) {
          gsap.fromTo(
            detail,
            { yPercent: 12, rotation: card.dataset.project === "atlan" ? 2.5 : -2.5 },
            {
              yPercent: -7,
              rotation: 0,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }
      });
    }, section);

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      animationContext.revert();
    };
  }, [gsapModules]);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="work-section"
      data-nav-theme="light"
      aria-labelledby="work-title"
    >
      <WorkBackgroundSequence />

      {/* Parted by scroll in the effect above. Inert and hidden until the
          boundary is actually crossing — see the ScrollTrigger `onToggle`. */}
      <div ref={shutterRef} className="register-shutter" aria-hidden="true">
        <div className="register-shutter-blade" data-shutter-blade>
          <span className="register-shutter-edge">
            <span data-shutter-edge />
          </span>
        </div>
      </div>

      <div className="work-introduction">
        <p className="work-kicker">
          <span>Selected work</span>
          <span>02 case studies</span>
        </p>
        {/*
          The Shuffle effect rewrites its own characters, so the live DOM text
          is scrambled ("BBBBuuuuiiiilllltttt..."). This section is
          aria-labelledby="work-title", so without a clean name the entire Work
          landmark announces as scramble. The sr-only copy is the accessible
          name; the animated copy is hidden from assistive tech.
        */}
        <h2 id="work-title" className="work-heading">
          <span className="sr-only">Built around real constraints.</span>
          <span aria-hidden="true" className="work-heading-animated">
          <Shuffle
            text="Built around"
            tag="span"
            textAlign="left"
            shuffleDirection="right"
            duration={0.5}
            animationMode="evenodd"
            shuffleTimes={2}
            ease="power3.out"
            stagger={0.035}
            threshold={0.2}
            triggerOnce
            triggerOnHover
            respectReducedMotion
          />
          <span className="work-heading-accent">
            <Shuffle
              text="real constraints."
              tag="span"
              textAlign="left"
              shuffleDirection="right"
              duration={0.5}
              animationMode="evenodd"
              shuffleTimes={2}
              ease="power3.out"
              stagger={0.035}
              threshold={0.2}
              triggerOnce
              triggerOnHover
              respectReducedMotion
            />
          </span>
          </span>
        </h2>
        <p className="work-intro">
          Two self-initiated product studies about what happens when context, ability,
          and safety shape the interface. Each separates designed evidence from outcomes
          that still need validation.
        </p>
      </div>

      <div className="project-stories">
        {projects.map((project) => (
          <article
            key={project.slug}
            className={`project-story project-story-${project.slug}`}
            data-project={project.slug}
            aria-labelledby={`${project.slug}-title`}
          >
            <div className="project-rail" aria-hidden="true">
              <span>{project.index}</span>
              <i />
              <span>{project.name}</span>
            </div>

            <figure className="project-media">
              <div className="project-media-visual">
                <Image
                  className="project-poster"
                  src={project.poster}
                  alt=""
                  fill
                  sizes="(max-width: 56.25em) 100vw, 62vw"
                  unoptimized
                />
                {/* The sr-only figcaption below already carries videoLabel and
                    names the figure. Repeating it here as the video's own
                    accessible name read the same sentence out twice. */}
                <video
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={project.poster}
                >
                  <source src={project.video} type="video/mp4" />
                </video>
              </div>
              <div className="project-media-shade" aria-hidden="true" />
              <div className="project-media-label">
                <span>AI-assisted portfolio imagery</span>
                <span>Motion / silent</span>
              </div>
              <div className="project-detail-image">
                <Image
                  src={project.detail}
                  alt={project.detailAlt}
                  fill
                  sizes="(max-width: 38.75em) 42vw, 16vw"
                  unoptimized
                />
              </div>
              <figcaption>{project.videoLabel}</figcaption>
            </figure>

            <div className="project-copy">
              <div className="project-status">
                <span>{project.eyebrow}</span>
                <span>{project.year}</span>
              </div>

              {/* The space matters: the name span is display:block, so without
                  it the accessible name reads "AtlanDesigning a coach…". */}
              <h3 id={`${project.slug}-title`} className="project-title">
                <span>{project.name}</span>{" "}
                {project.title}
              </h3>

              <p className="project-description">{project.description}</p>

              <blockquote className="project-scene">
                <p>{project.scene}</p>
              </blockquote>

              <dl className="project-facts">
                <div>
                  <dt>Status</dt>
                  <dd>{project.status}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>{project.role}</dd>
                </div>
                <div>
                  <dt>Focus</dt>
                  <dd>{project.focus}</dd>
                </div>
              </dl>

              <ul className="project-proof" aria-label={`${project.name} product decisions`}>
                {project.proof.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              {/* "Read case study" repeats across both stories, so a screen
                  reader's link list held it twice with nothing to tell the
                  pairs apart. The accessible names carry the project and the
                  fact that the link leaves the site; both start with the
                  visible text, so voice control still matches what is on
                  screen. */}
              <div className="project-actions">
                <Button04
                  href={project.caseStudy}
                  text="Read case study"
                  aria-label={`Read case study — ${project.name} (opens in a new tab)`}
                  variant="dark"
                  size="medium"
                  target="_blank"
                  rel="noreferrer"
                />
                <Button04
                  href={project.live}
                  text={project.liveLabel}
                  aria-label={`${project.liveLabel} — ${project.liveDescription} (opens in a new tab)`}
                  variant="outline-dark"
                  size="medium"
                  target="_blank"
                  rel="noreferrer"
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="work-tools">
        <p className="work-tools-kicker">
          <span>Tools &amp; technology</span>
          <span>{String(toolLogos.length).padStart(2, "0")} in the toolkit</span>
        </p>
        <LogoLoop
          className="work-tools-loop"
          logos={toolLogos}
          speed={72}
          direction="left"
          logoHeight={34}
          gap={64}
          hoverSpeed={20}
          scaleOnHover
          ariaLabel="Tools and technology used to design and build this portfolio"
        />
      </div>
    </section>
  );
}
