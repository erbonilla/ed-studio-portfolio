"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { portfolioContent } from "@/lib/portfolio-content";

type RevealState = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  strength: number;
  targetStrength: number;
  velocity: number;
};

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const understoryRef = useRef<HTMLDivElement>(null);
  const understoryStageRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const depthLensRef = useRef<HTMLDivElement>(null);
  const depthProgressRef = useRef<HTMLSpanElement>(null);
  const depthProgressValueRef = useRef<HTMLSpanElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const { about, expertise } = portfolioContent;

  useEffect(() => {
    const section = sectionRef.current;
    const portrait = portraitRef.current;
    const canvas = canvasRef.current;
    const cursor = cursorRef.current;
    const understory = understoryRef.current;
    const understoryStage = understoryStageRef.current;
    const story = storyRef.current;
    const depthLens = depthLensRef.current;
    const depthProgress = depthProgressRef.current;
    const depthProgressValue = depthProgressValueRef.current;
    if (
      !section ||
      !portrait ||
      !canvas ||
      !cursor ||
      !understory ||
      !understoryStage ||
      !story ||
      !depthLens ||
      !depthProgress ||
      !depthProgressValue
    ) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const context = canvas.getContext("2d");
    if (!context) return;

    const orangePortrait = new Image();
    orangePortrait.decoding = "async";
    orangePortrait.src = "/assets/about/about-orange.png";

    const state: RevealState = {
      x: portrait.clientWidth * 0.5,
      y: portrait.clientHeight * 0.5,
      targetX: portrait.clientWidth * 0.5,
      targetY: portrait.clientHeight * 0.5,
      strength: 0,
      targetStrength: 0,
      velocity: 0,
    };

    let dpr = 1;
    let rafId = 0;
    let isDestroyed = false;
    let lastPointer = { x: state.x, y: state.y };
    let touchReleaseTimer = 0;
    let removeUnderstoryPointer = () => undefined;

    const resize = () => {
      const rect = portrait.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    const drawCover = (image: HTMLImageElement) => {
      const canvasRatio = canvas.width / canvas.height;
      const imageRatio = image.naturalWidth / image.naturalHeight;
      let sourceWidth = image.naturalWidth;
      let sourceHeight = image.naturalHeight;
      let sourceX = 0;
      let sourceY = 0;

      if (imageRatio > canvasRatio) {
        sourceWidth = image.naturalHeight * canvasRatio;
        sourceX = (image.naturalWidth - sourceWidth) * 0.5;
      } else {
        sourceHeight = image.naturalWidth / canvasRatio;
        sourceY = (image.naturalHeight - sourceHeight) * 0.42;
      }

      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    };

    const liquidPath = (time: number, baseRadius: number) => {
      const pointCount = 54;
      context.beginPath();
      for (let index = 0; index <= pointCount; index += 1) {
        const angle = (index / pointCount) * Math.PI * 2;
        const wobble =
          Math.sin(angle * 3 + time * 1.55) * 0.1 +
          Math.sin(angle * 5 - time * 1.05) * 0.055 +
          Math.sin(angle * 7 + time * 0.68) * 0.03;
        const radius = baseRadius * (1 + wobble);
        const x = state.x * dpr + Math.cos(angle) * radius;
        const y = state.y * dpr + Math.sin(angle) * radius * 0.82;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.closePath();
    };

    const render = (timestamp: number) => {
      if (isDestroyed) return;
      const time = timestamp * 0.001;
      const liquidTime = reducedMotion ? 0 : time;
      state.x += (state.targetX - state.x) * 0.12;
      state.y += (state.targetY - state.y) * 0.12;
      state.strength += (state.targetStrength - state.strength) * 0.09;
      state.velocity *= 0.9;

      if (orangePortrait.complete && orangePortrait.naturalWidth > 0) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = "source-over";
        context.filter = "none";
        context.globalAlpha = 1;
        drawCover(orangePortrait);

        if (state.strength > 0.004) {
          const responsiveRadius = Math.min(canvas.width, canvas.height) * 0.17;
          const baseRadius =
            responsiveRadius * (0.72 + state.strength * 0.42 + Math.min(state.velocity, 38) * 0.004);

          context.save();
          context.globalCompositeOperation = "destination-out";
          context.filter = `blur(${Math.max(12, 22 * dpr)}px)`;
          context.globalAlpha = Math.min(1, state.strength * 1.2);
          liquidPath(liquidTime, baseRadius);
          context.fill();

          for (let index = 0; index < 5; index += 1) {
            const orbit = liquidTime * (0.45 + index * 0.035) + index * 1.74;
            const distance = baseRadius * (0.58 + index * 0.06);
            const blobRadius = baseRadius * (0.19 + (index % 3) * 0.035);
            context.beginPath();
            context.arc(
              state.x * dpr + Math.cos(orbit) * distance,
              state.y * dpr + Math.sin(orbit * 1.17) * distance * 0.58,
              blobRadius,
              0,
              Math.PI * 2,
            );
            context.fill();
          }
          context.restore();

          context.save();
          context.globalCompositeOperation = "source-over";
          context.globalAlpha = state.strength * 0.55;
          context.strokeStyle = "rgba(255,255,255,0.72)";
          context.lineWidth = Math.max(1, 1.15 * dpr);
          context.shadowColor = "rgba(255,79,24,0.85)";
          context.shadowBlur = 20 * dpr;
          liquidPath(liquidTime, baseRadius * 1.08);
          context.stroke();
          context.restore();
        }
      }

      if (finePointer) {
        cursor.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%)`;
        cursor.style.opacity = String(Math.min(1, state.strength * 1.8));
      }

      rafId = window.requestAnimationFrame(render);
    };

    const setPointer = (event: PointerEvent) => {
      const rect = portrait.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      state.velocity = Math.min(48, Math.hypot(x - lastPointer.x, y - lastPointer.y));
      state.targetX = x;
      state.targetY = y;
      lastPointer = { x, y };
    };

    const onPointerEnter = (event: PointerEvent) => {
      setPointer(event);
      state.targetStrength = reducedMotion ? 0.72 : 1;
    };

    const onPointerMove = (event: PointerEvent) => {
      setPointer(event);
      if (event.pointerType !== "touch") state.targetStrength = reducedMotion ? 0.72 : 1;
    };

    const onPointerLeave = () => {
      state.targetStrength = 0;
    };

    const onPointerDown = (event: PointerEvent) => {
      window.clearTimeout(touchReleaseTimer);
      setPointer(event);
      state.targetStrength = 1;
    };

    const onPointerUp = () => {
      touchReleaseTimer = window.setTimeout(() => {
        state.targetStrength = 0;
      }, 720);
    };

    orangePortrait.onload = () => {
      if (isDestroyed) return;
      resize();
      setCanvasReady(true);
    };
    if (orangePortrait.complete) orangePortrait.onload(new Event("load"));

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(portrait);
    portrait.addEventListener("pointerenter", onPointerEnter);
    portrait.addEventListener("pointermove", onPointerMove, { passive: true });
    portrait.addEventListener("pointerleave", onPointerLeave);
    portrait.addEventListener("pointerdown", onPointerDown);
    portrait.addEventListener("pointerup", onPointerUp);
    portrait.addEventListener("pointercancel", onPointerUp);
    resize();
    rafId = window.requestAnimationFrame(render);

    gsap.registerPlugin(ScrollTrigger);
    const animationContext = gsap.context(() => {
      if (reducedMotion) return;

      if (finePointer) {
        const lensX = gsap.quickTo(depthLens, "x", {
          duration: 0.85,
          ease: "power3.out",
        });
        const lensY = gsap.quickTo(depthLens, "y", {
          duration: 0.85,
          ease: "power3.out",
        });
        const storyRotationX = gsap.quickTo(story, "rotationX", {
          duration: 0.9,
          ease: "power3.out",
        });
        const storyRotationY = gsap.quickTo(story, "rotationY", {
          duration: 0.9,
          ease: "power3.out",
        });

        const onUnderstoryPointerMove = (event: PointerEvent) => {
          const rect = understoryStage.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          const normalizedX = x / rect.width - 0.5;
          const normalizedY = y / rect.height - 0.5;

          lensX(x - 260);
          lensY(y - 260);
          storyRotationX(normalizedY * -1.5);
          storyRotationY(normalizedX * 1.8);
          gsap.to(depthLens, { autoAlpha: 0.72, duration: 0.18, overwrite: true });
        };

        const onUnderstoryPointerLeave = () => {
          storyRotationX(0);
          storyRotationY(0);
          gsap.to(depthLens, {
            autoAlpha: 0.28,
            duration: 0.45,
            ease: "power2.out",
            overwrite: true,
          });
        };

        understoryStage.addEventListener("pointermove", onUnderstoryPointerMove, {
          passive: true,
        });
        understoryStage.addEventListener("pointerleave", onUnderstoryPointerLeave);
        removeUnderstoryPointer = () => {
          understoryStage.removeEventListener("pointermove", onUnderstoryPointerMove);
          understoryStage.removeEventListener("pointerleave", onUnderstoryPointerLeave);
        };
      }

      gsap.from(".about-title-line > span", {
        yPercent: 108,
        duration: 1.15,
        stagger: 0.12,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".about-portrait",
          start: "top 72%",
        },
      });

      gsap.fromTo(
        ".about-portrait-visual",
        { scale: 1.075 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".about-portrait",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      const motionMedia = gsap.matchMedia();

      motionMedia.add("(min-width: 901px)", () => {
        const depthTimeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: understory,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.55,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const progress = Math.round(self.progress * 100);
              depthProgressValue.textContent = String(progress).padStart(2, "0");
              gsap.set(depthProgress, { scaleY: self.progress });
            },
          },
        });

        depthTimeline
          .fromTo(
            ".about-depth-line",
            { scaleX: 0 },
            { scaleX: 1, duration: 0.46, stagger: 0.035 },
            0,
          )
          .fromTo(
            ".about-story-lead-line > span",
            { yPercent: 112, rotationX: -68, autoAlpha: 0 },
            {
              yPercent: 0,
              rotationX: 0,
              autoAlpha: 1,
              duration: 0.55,
              stagger: 0.075,
            },
            0.06,
          )
          .fromTo(
            ".about-depth-arrow",
            { yPercent: -65, rotate: 0 },
            { yPercent: 0, rotate: 180, duration: 0.32 },
            0.26,
          )
          .fromTo(
            ".about-story-detail",
            { y: 48, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.3 },
            0.62,
          )
          .fromTo(
            ".about-signals span",
            { y: 18, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.18, stagger: 0.025 },
            0.79,
          );
      });

      motionMedia.add("(max-width: 900px)", () => {
        gsap
          .timeline({
            defaults: { ease: "power4.out" },
            scrollTrigger: {
              trigger: understory,
              start: "top 72%",
              once: true,
            },
          })
          .from(".about-story-lead-line > span", {
            yPercent: 108,
            rotationX: -42,
            autoAlpha: 0,
            duration: 0.82,
            stagger: 0.08,
          })
          .from(
            ".about-story-detail, .about-signals",
            {
              y: 36,
              autoAlpha: 0,
              duration: 0.58,
              stagger: 0.08,
            },
            "-=0.35",
          );
      });

      gsap.from(".expertise-row", {
        y: 56,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.11,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".expertise-list",
          start: "top 78%",
        },
      });

      return () => motionMedia.revert();
    }, section);

    return () => {
      isDestroyed = true;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(touchReleaseTimer);
      resizeObserver.disconnect();
      removeUnderstoryPointer();
      animationContext.revert();
      portrait.removeEventListener("pointerenter", onPointerEnter);
      portrait.removeEventListener("pointermove", onPointerMove);
      portrait.removeEventListener("pointerleave", onPointerLeave);
      portrait.removeEventListener("pointerdown", onPointerDown);
      portrait.removeEventListener("pointerup", onPointerUp);
      portrait.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <section ref={sectionRef} id="about" className="about-section" aria-labelledby="about-title">
      <div
        ref={portraitRef}
        className={`about-portrait${canvasReady ? " is-canvas-ready" : ""}`}
      >
        <div
          className="about-portrait-visual"
          role="img"
          aria-label="Portrait of Edgar Bonilla, transitioning from vivid orange light to monochrome"
        >
          {/* These aligned layers form the reveal; the canvas is decorative. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="about-image about-image-grayscale"
            src="/assets/about/about-grayscale.png"
            alt=""
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="about-image about-image-orange-fallback"
            src="/assets/about/about-orange.png"
            alt=""
          />
          <canvas ref={canvasRef} className="about-liquid-canvas" aria-hidden="true" />
        </div>

        <div className="about-image-shade" aria-hidden="true" />
        <div className="about-topline">
          <span>02 / About</span>
          <span>Move to look beneath</span>
        </div>

        <div className="about-title" id="about-title">
          <span className="about-title-line">
            <span>Human depth.</span>
          </span>
          <span className="about-title-line about-title-line-accent">
            <span>System clarity.</span>
          </span>
        </div>

        <div className="about-reveal-hint" aria-hidden="true">
          <span>Hover or press</span>
          <span className="about-hint-line" />
          <span>Reveal the layer below</span>
        </div>

        <div ref={cursorRef} className="about-cursor" aria-hidden="true">
          <span>Reveal</span>
          <i />
        </div>
      </div>

      <div ref={understoryRef} className="about-understory">
        <div ref={understoryStageRef} className="about-understory-stage">
          <div className="about-depth-field" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
              <i className={`about-depth-line about-depth-line-${index + 1}`} key={index} />
            ))}
            <div ref={depthLensRef} className="about-depth-lens" />
          </div>

          <div className="about-depth-label" aria-hidden="true">
            <div className="about-depth-label-copy">
              <span>Below the surface</span>
              <span className="about-depth-arrow">↓</span>
            </div>
            <span className="about-depth-track">
              <span ref={depthProgressRef} />
            </span>
            <span ref={depthProgressValueRef} className="about-depth-progress">
              00
            </span>
          </div>

          <div ref={storyRef} className="about-story">
            <p className="about-story-lead">
              <span className="sr-only">{about.lead}</span>
              <span className="about-story-lead-lines" aria-hidden="true">
                {about.leadLines.map((line) => (
                  <span className="about-story-lead-line" key={line}>
                    <span>{line}</span>
                  </span>
                ))}
              </span>
            </p>
            <div className="about-story-detail">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="about-signals" aria-label="Professional highlights">
              {about.signals.map((signal) => (
                <span key={signal}>{signal}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="expertise" aria-labelledby="expertise-title">
        <header className="expertise-heading">
          <div>
            <p>Four disciplines. One practice.</p>
            <h2 id="expertise-title">Expertise</h2>
          </div>
          <p className="expertise-intro">{expertise.intro}</p>
        </header>

        <div className="expertise-list">
          {expertise.areas.map((area, index) => (
            <article className="expertise-row" key={area.title}>
              <span className="expertise-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="expertise-row-copy">
                <h3>{area.title}</h3>
                <p>{area.description}</p>
              </div>
              <ul aria-label={`${area.title} capabilities`}>
                {area.capabilities.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
              <span className="expertise-arrow" aria-hidden="true">
                ↗
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
