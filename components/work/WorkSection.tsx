"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button04 } from "@/components/ui/animated-arrow-button";
import { WorkBackgroundSequence } from "./WorkBackgroundSequence";

const projects = [
  {
    slug: "atlan",
    index: "01",
    name: "Atlan",
    title: "Adapting training when life breaks the plan",
    eyebrow: "Endurance coaching PWA",
    year: "2026",
    status: "Self-initiated concept · Functional prototype",
    description:
      "An offline-first coaching concept that treats disruption as a product requirement—not an athlete’s failure.",
    scene:
      "The meeting ran late. Instead of breaking the week, Session Swapper adapts the plan and explains the trade-off.",
    role: "Product strategy, UX/UI, brand system, prototype",
    focus: "Environmental UX, bilingual design, accessibility",
    proof: ["Offline-first", "ES / EN parity", "Wet Mode", "Why explanations"],
    video: "/assets/work/atlan/context-loop.mp4",
    poster: "/assets/work/atlan/swimmer.jpg",
    detail: "/assets/work/atlan/wet-mode.jpg",
    detailAlt: "A wet hand reaching toward a phone in a waterproof case beside a pool.",
    videoLabel:
      "Silent loop of a swimmer pushing away from the pool wall at sunrise.",
    caseStudy: "https://case-study-atlan.vercel.app/",
    repository: "https://github.com/erbonilla/case-study-atlan",
  },
  {
    slug: "osteoplus",
    index: "02",
    name: "Osteóplus",
    title: "Designing the next safe action",
    eyebrow: "Senior-accessible healthcare concept",
    year: "2025–26",
    status: "Original fictional brand · Interactive concept",
    description:
      "A bilingual rehabilitation experience reframed from a medical repository into a Today-first Action Dashboard.",
    scene:
      "Booking comes before account creation. Today comes before the archive. Safety comes before completion.",
    role: "Product strategy, IA, UX/UI, accessibility system",
    focus: "Guest booking, rehabilitation, adults 60+",
    proof: ["Guest-first booking", "Today-first IA", "56px actions", "Pain Interrupt"],
    video: "/assets/work/osteoplus/context-loop.mp4",
    poster: "/assets/work/osteoplus/rehab.jpg",
    detail: "/assets/work/osteoplus/booking.jpg",
    detailAlt:
      "An older adult using a smartphone at home with Barcelona visible through the window.",
    videoLabel:
      "Silent loop of an older adult following a guided care routine at home.",
    caseStudy: "https://case-study-osteoplus.vercel.app/",
    repository: "https://github.com/erbonilla/case-study-osteoplus",
  },
] as const;

export function WorkSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
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

      gsap.from(".work-kicker, .work-heading, .work-intro", {
        y: 48,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".work-introduction",
          start: "top 78%",
        },
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
          gsap.fromTo(
            media,
            { clipPath: "inset(14% 0 14% 0 round 28px)" },
            {
              clipPath: "inset(0% 0 0% 0 round 28px)",
              duration: 1.15,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 78%",
              },
            },
          );
        }

        gsap.from(copy, {
          y: 34,
          autoAlpha: 0,
          duration: 0.72,
          stagger: 0.065,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 70%",
          },
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
                scrub: 0.7,
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
                scrub: 0.8,
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
  }, []);

  return (
    <section ref={sectionRef} id="work" className="work-section" aria-labelledby="work-title">
      <WorkBackgroundSequence />

      <div className="work-introduction">
        <p className="work-kicker">
          <span>Selected work</span>
          <span>02 case studies</span>
        </p>
        <h2 id="work-title" className="work-heading">
          Built around
          <span>real constraints.</span>
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
                  sizes="(max-width: 900px) 100vw, 62vw"
                  unoptimized
                />
                <video
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={project.poster}
                  aria-label={project.videoLabel}
                >
                  <source src={project.video} type="video/mp4" />
                </video>
              </div>
              <div className="project-media-shade" aria-hidden="true" />
              <div className="project-media-label">
                <span>Context study</span>
                <span>Motion / silent</span>
              </div>
              <div className="project-detail-image">
                <Image
                  src={project.detail}
                  alt={project.detailAlt}
                  fill
                  sizes="(max-width: 620px) 42vw, 16vw"
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

              <h3 id={`${project.slug}-title`} className="project-title">
                <span>{project.name}</span>
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

              <div className="project-actions">
                <Button04
                  href={project.caseStudy}
                  text="Read case study"
                  variant="dark"
                  size="medium"
                  target="_blank"
                  rel="noreferrer"
                />
                <Button04
                  href={project.repository}
                  text="View repository"
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
    </section>
  );
}
