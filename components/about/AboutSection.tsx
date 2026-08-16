"use client";

import { useEffect, useRef, useState } from "react";
import { portfolioContent } from "@/lib/portfolio-content";
import { useGsapClient } from "@/lib/use-gsap-client";
import {
  rubberbandIfOutOfBounds,
  rubberbandedUnit,
  Spring,
  Spring2D,
  tickerDt,
  unboundedProgress,
  VelocityTracker,
} from "@/lib/fluid-motion";
import { DecryptedText, type DecryptedTextHandle } from "@/components/effects/DecryptedText";

const ABOUT_BACKGROUND_FRAME_COUNT = 80;
const ABOUT_BACKGROUND_ROOT = "/assets/about/background";
const ABOUT_STORY_CARD_LABELS = ["Practice", "Working principles"];

/*
 * WebP. This is a decorative canvas — aria-hidden, behind a scrim, under a
 * blur lens — and as JPEG the 80 frames were 17.6MB, the heaviest single asset
 * group on the site and larger than the 195-frame hero sequence. At q78 the
 * same 80 frames are 5.0MB with no visible difference through the scrim.
 */
const aboutBackgroundFramePath = (index: number) =>
  `${ABOUT_BACKGROUND_ROOT}/frame-${String(index + 1).padStart(3, "0")}.webp`;

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
  const gsapModules = useGsapClient();
  const sectionRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const understoryRef = useRef<HTMLDivElement>(null);
  const understoryStageRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const depthLensRef = useRef<HTMLDivElement>(null);
  const depthProgressRef = useRef<HTMLSpanElement>(null);
  const depthProgressValueRef = useRef<HTMLSpanElement>(null);
  const storyDecryptRefs = useRef<Array<DecryptedTextHandle | null>>([]);
  const [canvasReady, setCanvasReady] = useState(false);
  const { about, expertise } = portfolioContent;

  useEffect(() => {
    if (!gsapModules) return;
    const { gsap, ScrollTrigger } = gsapModules;
    const section = sectionRef.current;
    const portrait = portraitRef.current;
    const canvas = canvasRef.current;
    const cursor = cursorRef.current;
    const understory = understoryRef.current;
    const understoryStage = understoryStageRef.current;
    const story = storyRef.current;
    const backgroundCanvas = backgroundCanvasRef.current;
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
      !backgroundCanvas ||
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
    orangePortrait.src = "/assets/about/about-orange.webp";

    const state: RevealState = {
      x: portrait.clientWidth * 0.5,
      y: portrait.clientHeight * 0.5,
      targetX: portrait.clientWidth * 0.5,
      targetY: portrait.clientHeight * 0.5,
      strength: 0,
      targetStrength: 0,
      velocity: 0,
    };
    const pointerSpring = new Spring2D(1, 0.35);
    const strengthSpring = new Spring(0, 1, 0.3);
    const pointerVelocity = new VelocityTracker();
    pointerSpring.setImmediate(state.x, state.y);
    let pointerCaptured = false;
    let pointerOver = false;

    let dpr = 1;
    let rafId = 0;
    let isDestroyed = false;
    let lastRenderTime = 0;
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
      const dt =
        lastRenderTime === 0
          ? 1 / 60
          : Math.min(1 / 30, Math.max(0.001, (timestamp - lastRenderTime) / 1000));
      lastRenderTime = timestamp;

      if (pointerCaptured || pointerOver) {
        pointerSpring.setImmediate(state.targetX, state.targetY);
      } else {
        pointerSpring.step(dt);
      }
      strengthSpring.target = state.targetStrength;
      strengthSpring.step(dt);

      state.x = pointerSpring.x.value;
      state.y = pointerSpring.y.value;
      state.strength = strengthSpring.value;
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
      const x = rubberbandIfOutOfBounds(event.clientX - rect.left, 0, rect.width);
      const y = rubberbandIfOutOfBounds(event.clientY - rect.top, 0, rect.height);
      pointerVelocity.add(x, y);
      const velocity = pointerVelocity.velocity();
      state.velocity = Math.min(48, Math.hypot(velocity.x, velocity.y) / 24);
      state.targetX = x;
      state.targetY = y;
    };

    const onPointerEnter = (event: PointerEvent) => {
      pointerOver = true;
      setPointer(event);
      state.targetStrength = reducedMotion ? 0.72 : 1;
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerOver = true;
      setPointer(event);
      if (event.pointerType !== "touch") state.targetStrength = reducedMotion ? 0.72 : 1;
    };

    const onPointerLeave = () => {
      pointerOver = false;
      if (pointerCaptured) return;
      const velocity = pointerVelocity.velocity();
      pointerSpring.dampingRatio = Math.hypot(velocity.x, velocity.y) > 400 ? 0.8 : 1;
      pointerSpring.setVelocity(velocity.x, velocity.y);
      pointerVelocity.reset();
      state.targetStrength = 0;
    };

    const onPointerDown = (event: PointerEvent) => {
      pointerCaptured = true;
      pointerOver = true;
      portrait.setPointerCapture(event.pointerId);
      setPointer(event);
      state.targetStrength = 1;
    };

    const onPointerUp = (event: PointerEvent) => {
      pointerCaptured = false;
      if (portrait.hasPointerCapture(event.pointerId)) {
        portrait.releasePointerCapture(event.pointerId);
      }
      const rect = portrait.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      pointerOver = inside;
      if (!inside) {
        const velocity = pointerVelocity.velocity();
        pointerSpring.dampingRatio = Math.hypot(velocity.x, velocity.y) > 400 ? 0.8 : 1;
        pointerSpring.setVelocity(velocity.x, velocity.y);
        pointerVelocity.reset();
      }
      state.targetStrength = inside && event.pointerType !== "touch" ? 1 : 0;
    };

    let resizeObserver: ResizeObserver | undefined;

    if (!reducedMotion) {
      orangePortrait.onload = () => {
        if (isDestroyed) return;
        resize();
        setCanvasReady(true);
      };
      if (orangePortrait.complete) orangePortrait.onload(new Event("load"));

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(portrait);
      portrait.addEventListener("pointerenter", onPointerEnter);
      portrait.addEventListener("pointermove", onPointerMove, { passive: true });
      portrait.addEventListener("pointerleave", onPointerLeave);
      portrait.addEventListener("pointerdown", onPointerDown);
      portrait.addEventListener("pointerup", onPointerUp);
      portrait.addEventListener("pointercancel", onPointerUp);
      resize();
      rafId = window.requestAnimationFrame(render);
    }

    const backgroundContext = backgroundCanvas.getContext("2d", { alpha: false });
    const backgroundFrames: Array<HTMLImageElement | undefined> = new Array(
      ABOUT_BACKGROUND_FRAME_COUNT,
    );
    let backgroundDpr = 1;
    let backgroundLastRendered = reducedMotion
      ? Math.floor(ABOUT_BACKGROUND_FRAME_COUNT * 0.5)
      : 0;
    let backgroundRequestedIndex = backgroundLastRendered;
    let backgroundPreloadStarted = false;

    const drawBackgroundCover = (image: HTMLImageElement) => {
      if (!backgroundContext) return;
      const canvasRatio = backgroundCanvas.width / backgroundCanvas.height;
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
        sourceY = (image.naturalHeight - sourceHeight) * 0.5;
      }

      backgroundContext.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
      backgroundContext.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        backgroundCanvas.width,
        backgroundCanvas.height,
      );
    };

    const drawBackgroundFrame = (requestedIndex: number) => {
      const clamped = Math.max(
        0,
        Math.min(ABOUT_BACKGROUND_FRAME_COUNT - 1, Math.round(requestedIndex)),
      );
      let resolved = clamped;

      if (!backgroundFrames[resolved]?.complete) {
        for (let offset = 1; offset < ABOUT_BACKGROUND_FRAME_COUNT; offset += 1) {
          const before = clamped - offset;
          const after = clamped + offset;
          if (before >= 0 && backgroundFrames[before]?.complete) {
            resolved = before;
            break;
          }
          if (after < ABOUT_BACKGROUND_FRAME_COUNT && backgroundFrames[after]?.complete) {
            resolved = after;
            break;
          }
        }
      }

      const image = backgroundFrames[resolved];
      if (!image?.complete || image.naturalWidth === 0) return;
      backgroundLastRendered = resolved;
      drawBackgroundCover(image);
    };

    const resizeBackground = () => {
      const rect = understoryStage.getBoundingClientRect();
      const displayWidth = rect.width * 1.04;
      const displayHeight = rect.height * 1.04;
      backgroundDpr = Math.min(window.devicePixelRatio || 1, 1.35);
      backgroundCanvas.width = Math.max(1, Math.round(displayWidth * backgroundDpr));
      backgroundCanvas.height = Math.max(1, Math.round(displayHeight * backgroundDpr));
      backgroundCanvas.style.width = `${displayWidth}px`;
      backgroundCanvas.style.height = `${displayHeight}px`;
      drawBackgroundFrame(backgroundLastRendered);
    };

    const loadBackgroundFrame = (index: number) =>
      new Promise<void>((resolve) => {
        if (isDestroyed || backgroundFrames[index]) {
          resolve();
          return;
        }

        const image = new Image();
        image.decoding = "async";
        image.src = aboutBackgroundFramePath(index);
        backgroundFrames[index] = image;
        image.onload = () => {
          if (
            index === backgroundRequestedIndex ||
            backgroundFrames[backgroundRequestedIndex]?.complete
          ) {
            drawBackgroundFrame(backgroundRequestedIndex);
          }
          resolve();
        };
        image.onerror = () => resolve();
      });

    const requestBackgroundFrame = (index: number) => {
      const clamped = Math.max(
        0,
        Math.min(ABOUT_BACKGROUND_FRAME_COUNT - 1, Math.round(index)),
      );
      backgroundRequestedIndex = clamped;
      drawBackgroundFrame(clamped);
      for (let offset = -2; offset <= 3; offset += 1) {
        const nearby = clamped + offset;
        if (nearby >= 0 && nearby < ABOUT_BACKGROUND_FRAME_COUNT) {
          void loadBackgroundFrame(nearby);
        }
      }
    };

    const preloadBackgroundSequence = async () => {
      if (backgroundPreloadStarted || isDestroyed || reducedMotion) return;
      backgroundPreloadStarted = true;
      const anchors = [0, 20, 40, 60, ABOUT_BACKGROUND_FRAME_COUNT - 1];
      const anchorSet = new Set(anchors);
      const queue = [
        ...anchors,
        ...Array.from({ length: ABOUT_BACKGROUND_FRAME_COUNT }, (_, index) => index).filter(
          (index) => !anchorSet.has(index),
        ),
      ];
      let queueIndex = 0;

      const worker = async () => {
        while (!isDestroyed && queueIndex < queue.length) {
          const index = queue[queueIndex];
          queueIndex += 1;
          await loadBackgroundFrame(index);
        }
      };

      await Promise.all(Array.from({ length: 4 }, worker));
    };

    const initialBackgroundIndex = reducedMotion
      ? Math.floor(ABOUT_BACKGROUND_FRAME_COUNT * 0.5)
      : 0;
    const backgroundResizeObserver = new ResizeObserver(resizeBackground);
    backgroundResizeObserver.observe(understoryStage);
    const backgroundIntersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void preloadBackgroundSequence();
          backgroundIntersectionObserver.disconnect();
        }
      },
      { rootMargin: "150% 0px" },
    );
    backgroundIntersectionObserver.observe(understory);
    resizeBackground();
    void loadBackgroundFrame(initialBackgroundIndex).then(() => {
      if (!isDestroyed) drawBackgroundFrame(initialBackgroundIndex);
    });

    /* The cards used to hold their flipped, decrypted face for good, so the
       section always scrolled away mid-story and came back already spent.
       Tracking the decrypted state here lets the exit flip re-arm the reveal. */
    const storyCardDecrypted = new Set<number>();

    const triggerCardDecrypt = (index: number) => {
      storyCardDecrypted.add(index);
      storyDecryptRefs.current[index]?.trigger();
    };

    const resetCardDecrypt = (index: number) => {
      if (!storyCardDecrypted.has(index)) return;
      storyCardDecrypted.delete(index);
      storyDecryptRefs.current[index]?.reset();
    };

    /* Staggered windows inside the exit scroll range, so the two cards turn
       back to "Practice" / "Working principles" in reading order. */
    const cardExitWindows: Array<[number, number]> = [
      [0, 0.5],
      [0.12, 0.62],
    ];
    const flipBackEase = gsap.parseEase("power2.inOut");
    const cardFlipBackProgress = (progress: number, index: number) => {
      const [start, end] = cardExitWindows[index] ?? cardExitWindows[0];
      return gsap.utils.clamp(0, 1, (progress - start) / (end - start));
    };

    gsap.registerPlugin(ScrollTrigger);
    const animationContext = gsap.context(() => {
      if (reducedMotion) return;

      if (finePointer) {
        const lensSpring = new Spring2D(1, 0.32);
        const lensAlphaSpring = new Spring(0.28, 1, 0.3);
        const storySpring = new Spring2D(1, 0.35);
        const lensVelocity = new VelocityTracker();
        let lensOver = false;
        let stageWidth = understoryStage.clientWidth || 1;
        let stageHeight = understoryStage.clientHeight || 1;

        const paintLensAndStory = () => {
          gsap.set(depthLens, {
            x: lensSpring.x.value,
            y: lensSpring.y.value,
            autoAlpha: lensAlphaSpring.value,
          });
          gsap.set(story, {
            rotationX: storySpring.x.value,
            rotationY: storySpring.y.value,
          });
        };

        const applyLens = (event: PointerEvent) => {
          const rect = understoryStage.getBoundingClientRect();
          stageWidth = Math.max(1, rect.width);
          stageHeight = Math.max(1, rect.height);
          const x = rubberbandIfOutOfBounds(event.clientX - rect.left, 0, rect.width);
          const y = rubberbandIfOutOfBounds(event.clientY - rect.top, 0, rect.height);
          const normalizedX = x / stageWidth - 0.5;
          const normalizedY = y / stageHeight - 0.5;
          const lensX = x - 260;
          const lensY = y - 260;
          lensVelocity.add(lensX, lensY);
          lensSpring.setImmediate(lensX, lensY);
          lensAlphaSpring.setImmediate(0.72);
          storySpring.setImmediate(normalizedY * -1.5, normalizedX * 1.8);
          paintLensAndStory();
        };

        const restLens = () => {
          lensOver = false;
          const velocity = lensVelocity.velocity();
          const speed = Math.hypot(velocity.x, velocity.y);
          const withMomentum = speed > 600;
          lensSpring.dampingRatio = withMomentum ? 0.8 : 1;
          storySpring.dampingRatio = withMomentum ? 0.8 : 1;
          /* Position target stays at the live value so the lens coasts from
             release velocity instead of snapping home. Opacity and tilt spring
             from their presentation values toward rest. */
          lensSpring.setVelocity(velocity.x, velocity.y);
          lensAlphaSpring.target = 0.28;
          storySpring.setTarget(0, 0);
          storySpring.setVelocity(
            (velocity.y * -1.5) / stageHeight,
            (velocity.x * 1.8) / stageWidth,
          );
          lensVelocity.reset();
        };

        const onUnderstoryPointerMove = (event: PointerEvent) => {
          lensOver = true;
          applyLens(event);
        };

        const onUnderstoryPointerLeave = () => {
          restLens();
        };

        const tickLens = () => {
          if (lensOver) return;
          const dt = tickerDt(gsap.ticker);
          lensSpring.step(dt);
          lensAlphaSpring.step(dt);
          storySpring.step(dt);
          paintLensAndStory();
        };
        gsap.ticker.add(tickLens);
        paintLensAndStory();

        understoryStage.addEventListener("pointermove", onUnderstoryPointerMove, {
          passive: true,
        });
        understoryStage.addEventListener("pointerleave", onUnderstoryPointerLeave);
        removeUnderstoryPointer = () => {
          gsap.ticker.remove(tickLens);
          understoryStage.removeEventListener("pointermove", onUnderstoryPointerMove);
          understoryStage.removeEventListener("pointerleave", onUnderstoryPointerLeave);
        };
      }

      gsap.set(".about-title-line > span", { yPercent: 108 });
      gsap.to(".about-title-line > span", {
        yPercent: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".about-portrait",
          start: "top 72%",
          toggleActions: "play none none reverse",
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
      const appendStorySequence = (timeline: ReturnType<typeof gsap.timeline>) => {
        timeline
          .fromTo(
            ".about-story-lead-line > span",
            { yPercent: 112, rotationX: -68, autoAlpha: 0 },
            {
              yPercent: 0,
              rotationX: 0,
              autoAlpha: 1,
              duration: 0.22,
              stagger: 0.04,
            },
            0.04,
          )
          .fromTo(
            ".about-depth-arrow",
            { yPercent: -65, rotate: 0 },
            { yPercent: 0, rotate: 180, duration: 0.18 },
            0.31,
          )
          .fromTo(
            ".about-story-card:nth-child(1)",
            { y: 34, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.08 },
            0.4,
          )
          .fromTo(
            ".about-story-card:nth-child(1) .about-story-card-inner",
            { rotationY: 0 },
            { rotationY: 180, duration: 0.15 },
            0.44,
          )
          .call(() => triggerCardDecrypt(0), undefined, 0.6)
          .fromTo(
            ".about-story-card:nth-child(2)",
            { y: 34, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.08 },
            0.59,
          )
          .fromTo(
            ".about-story-card:nth-child(2) .about-story-card-inner",
            { rotationY: 0 },
            { rotationY: 180, duration: 0.15 },
            0.63,
          )
          .call(() => triggerCardDecrypt(1), undefined, 0.79)
          .fromTo(
            ".about-signals span",
            {
              y: 14,
              autoAlpha: 0,
              clipPath: "inset(0 100% 0 0)",
            },
            {
              y: 0,
              autoAlpha: 1,
              clipPath: "inset(0 0% 0 0)",
              duration: 0.08,
              stagger: 0.025,
            },
            0.82,
          );
      };

      // Kept in em to match the stylesheet. These two queries gate the desktop
      // and compact builds of the same section, so if one anchor moves with the
      // reader's text size and the other does not, a large-text reader gets the
      // desktop scroll choreography driving the compact layout.
      motionMedia.add("(min-width: 56.3125em)", () => {
        const depthTimeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: understory,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.2,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const range = Math.max(1, self.end - self.start);
              const progress = rubberbandedUnit(
                unboundedProgress(self.scroll(), self.start, self.end),
                range,
              );
              const clamped = Math.max(0, Math.min(1, progress));
              depthProgressValue.textContent = String(Math.round(clamped * 100)).padStart(2, "0");
              gsap.set(depthProgress, { scaleY: clamped });
              requestBackgroundFrame(progress * (ABOUT_BACKGROUND_FRAME_COUNT - 1));
            },
          },
        });

        depthTimeline
          .fromTo(
            backgroundCanvas,
            { scale: 1.075, xPercent: -1.2, rotation: 0.35 },
            { scale: 1.015, xPercent: 0.8, rotation: -0.25, duration: 1 },
            0,
          )
          .fromTo(
            ".about-depth-line",
            { scaleX: 0 },
            { scaleX: 1, duration: 0.46, stagger: 0.035 },
            0,
          );

        appendStorySequence(depthTimeline);

        /* The depth timeline ends when the sticky stage starts scrolling away,
           and there is a full viewport of exit left after that. The cards spend
           it turning back to their front face.

           This writes rotationY directly instead of running a second tween on
           the same property: a tween here would render its from-value at
           progress 0 on every ScrollTrigger refresh, and — sorted after the
           depth trigger — would land on top of the depth timeline's own flip.
           Skipping progress 0 leaves the depth timeline sole owner up to the
           handoff point. */
        const storyCardInners = gsap.utils.toArray<HTMLElement>(
          ".about-story-card .about-story-card-inner",
        );

        ScrollTrigger.create({
          trigger: understory,
          start: "bottom bottom",
          end: "bottom 40%",
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            /* progress 0 leaves the depth timeline sole owner. As progress
               approaches 0, rotationY is already at 180, so handing off without
               an onLeaveBack snap keeps the live presentation value. */
            if (self.progress <= 0) return;
            storyCardInners.forEach((inner, index) => {
              const flipBack = cardFlipBackProgress(self.progress, index);
              gsap.set(inner, { rotationY: 180 * (1 - flipBackEase(flipBack)) });
              /* Past 90° the back face is hidden, so re-scrambling the copy
                 there is invisible. Coming back up, the card turns to face the
                 reader again, so the reveal replays — but only upward: firing
                 this on the way down would restart the decrypt the exit had
                 just cleared. */
              if (flipBack > 0.6) resetCardDecrypt(index);
              else if (self.direction < 0) triggerCardDecrypt(index);
            });
          },
        });
      });

      motionMedia.add("(max-width: 56.25em)", () => {
        const mobileBackgroundTrigger = ScrollTrigger.create({
          trigger: understory,
          start: "top bottom",
          end: "bottom top",
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const range = Math.max(1, self.end - self.start);
            const progress = rubberbandedUnit(
              unboundedProgress(self.scroll(), self.start, self.end),
              range,
            );
            requestBackgroundFrame(progress * (ABOUT_BACKGROUND_FRAME_COUNT - 1));
            gsap.set(backgroundCanvas, {
              scale: 1.08 - Math.max(0, Math.min(1, progress)) * 0.045,
              yPercent: (Math.max(0, Math.min(1, progress)) - 0.5) * -2.4,
            });
          },
        });

        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: ".about-story-lead",
              start: "top 88%",
              end: "bottom 42%",
              scrub: 0.2,
            },
          })
          .fromTo(
            ".about-story-lead-line > span",
            { yPercent: 108, rotationX: -52, autoAlpha: 0 },
            {
              yPercent: 0,
              rotationX: 0,
              autoAlpha: 1,
              duration: 0.72,
              stagger: 0.07,
            },
          )
          .fromTo(
            ".about-depth-arrow",
            { yPercent: -65, rotate: 0 },
            { yPercent: 0, rotate: 180, duration: 0.28 },
            0.48,
          );

        gsap.utils.toArray<HTMLElement>(".about-story-card").forEach((card, cardIndex) => {
          const inner = card.querySelector<HTMLElement>(".about-story-card-inner");
          if (!inner) return;

          gsap.fromTo(
            card,
            { y: 36, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top 90%",
                end: "top 72%",
                scrub: 0.2,
              },
            },
          );

          /* One timeline owns the whole flip lifecycle — turn, hold, turn back
             as the card leaves the top of the viewport — so the two halves
             never fight over rotationY across a ScrollTrigger refresh. The
             durations are fractions of the card's full pass through the
             viewport; 0.35 keeps the opening flip on the same stretch of
             scroll it had before the exit range was added. */
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: card,
                start: "top 72%",
                end: "bottom top",
                scrub: 0.22,
                onUpdate: (self) => {
                  if (self.progress >= 0.74) resetCardDecrypt(cardIndex);
                  else if (self.progress >= 0.18) triggerCardDecrypt(cardIndex);
                },
              },
            })
            /* Empty tween: ScrollTrigger maps the scroll range onto the
               timeline's total duration, so without a full-length child the
               positions below would be renormalized against 0.86 and both
               flips would land late. */
            .to({}, { duration: 1 }, 0)
            .fromTo(inner, { rotationY: 0 }, { rotationY: 180, duration: 0.35 }, 0)
            .to(inner, { rotationY: 0, duration: 0.28 }, 0.58);
        });

        gsap.fromTo(
          ".about-signals span",
          {
            y: 14,
            autoAlpha: 0,
            clipPath: "inset(0 100% 0 0)",
          },
          {
            y: 0,
            autoAlpha: 1,
            clipPath: "inset(0 0% 0 0)",
            duration: 0.6,
            stagger: 0.18,
            ease: "none",
            scrollTrigger: {
              trigger: ".about-signals",
              start: "top 90%",
              end: "bottom 52%",
              scrub: 0.2,
            },
          },
        );

        return () => mobileBackgroundTrigger.kill();
      });

      const expertiseTimeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: ".expertise",
          start: "top 72%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.set(".expertise-heading > *", { y: 36, autoAlpha: 0 });
      gsap.set(".expertise-row", {
        y: 72,
        rotationX: 7,
        scale: 0.985,
        autoAlpha: 0,
        transformPerspective: 900,
        transformOrigin: "50% 100%",
      });
      gsap.set(".expertise-index, .expertise-arrow", { y: 14, autoAlpha: 0 });

      expertiseTimeline
        .to(".expertise-heading > *", {
          y: 0,
          autoAlpha: 1,
          duration: 0.72,
          stagger: 0.1,
        })
        .to(
          ".expertise-row",
          {
            y: 0,
            rotationX: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 0.92,
            stagger: {
              each: 0.13,
              from: "start",
              grid: [2, 2],
            },
          },
          "-=0.38",
        )
        .to(
          ".expertise-index, .expertise-arrow",
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.46,
            stagger: 0.035,
          },
          "-=0.54",
        );

      return () => motionMedia.revert();
    }, section);

    return () => {
      isDestroyed = true;
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      backgroundResizeObserver.disconnect();
      backgroundIntersectionObserver.disconnect();
      removeUnderstoryPointer();
      animationContext.revert();
      portrait.removeEventListener("pointerenter", onPointerEnter);
      portrait.removeEventListener("pointermove", onPointerMove);
      portrait.removeEventListener("pointerleave", onPointerLeave);
      portrait.removeEventListener("pointerdown", onPointerDown);
      portrait.removeEventListener("pointerup", onPointerUp);
      portrait.removeEventListener("pointercancel", onPointerUp);
    };
  }, [gsapModules]);

  return (
    <section ref={sectionRef} id="about" className="about-section" aria-labelledby="about-title">
      <div
        ref={portraitRef}
        className={`about-portrait${canvasReady ? " is-canvas-ready" : ""}`}
        data-nav-theme="light"
        /* This surface already replaces the pointer with its own "Reveal"
           lens. The site reticle stands down here rather than riding on top
           of it. */
        data-pointer="hidden"
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
            src="/assets/about/about-grayscale.webp"
            alt=""
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="about-image about-image-orange-fallback"
            src="/assets/about/about-orange.webp"
            alt=""
          />
          <canvas ref={canvasRef} className="about-liquid-canvas" aria-hidden="true" />
        </div>

        <div className="about-image-shade" aria-hidden="true" />
        <div className="about-topline">
          <span>About</span>
          <span>Move to look beneath</span>
        </div>

        {/* A real h2: this was a div, so the document outline contained no
            "About" entry at all and the section's aria-labelledby pointed at a
            generic element. */}
        <h2 className="about-title" id="about-title">
          <span className="about-title-line">
            <span>Human depth.</span>
          </span>
          <span className="about-title-line about-title-line-accent">
            <span> System clarity.</span>
          </span>
        </h2>

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
            <canvas
              ref={backgroundCanvasRef}
              className="about-background-canvas"
              aria-hidden="true"
            />
            <div className="about-background-scrim" />
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
              {about.paragraphs.map((paragraph, index) => (
                <div className="about-story-card" key={paragraph}>
                  <div className="about-story-card-inner">
                    <div className="about-story-card-face about-story-card-front" aria-hidden="true">
                      <span className="about-story-card-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="about-story-card-label">
                        {ABOUT_STORY_CARD_LABELS[index] ?? "Perspective"}
                      </span>
                      <span className="about-story-card-action">
                        Scroll to reveal <i>↘</i>
                      </span>
                    </div>
                    <div className="about-story-card-face about-story-card-back">
                      <span className="about-story-card-index" aria-hidden="true">
                        {String(index + 1).padStart(2, "0")} / 02
                      </span>
                      <p>
                        <DecryptedText
                          ref={(handle) => {
                            storyDecryptRefs.current[index] = handle;
                          }}
                          text={paragraph}
                          animateOn="manual"
                          sequential
                          revealDirection="start"
                          speed={12}
                          useOriginalCharsOnly
                          parentClassName="about-story-card-decrypt"
                          className="about-story-card-decrypt-char"
                          encryptedClassName="about-story-card-decrypt-char is-encrypted"
                        />
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* These are four separate facts, not one string. Without the list
                roles a screen reader ran them together as a single run of text,
                and the aria-label on a bare div was ignored on top of that. */}
            <div className="about-signals" role="list" aria-label="How I work">
              {about.signals.map((signal) => (
                <span role="listitem" key={signal}>
                  {signal}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="expertise" aria-labelledby="expertise-title">
        <header className="expertise-heading">
          <div>
            {/* The heading carries the idea itself. "Expertise" under a kicker
                said less than the kicker did. */}
            <h2 id="expertise-title">Four disciplines. One practice.</h2>
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
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
