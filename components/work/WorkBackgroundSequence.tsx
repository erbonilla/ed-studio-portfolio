"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./WorkBackgroundSequence.module.css";

const FRAME_COUNT = 240;
const MAX_CACHED_FRAMES = 16;

function frameSource(index: number) {
  return `/assets/work/background/frame-${String(index + 1).padStart(3, "0")}.jpg`;
}

export function WorkBackgroundSequence() {
  const layerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const canvas = canvasRef.current;
    const section = layer?.closest<HTMLElement>(".work-section");
    const context = canvas?.getContext("2d", { alpha: false });

    if (!layer || !canvas || !section || !context) return;

    gsap.registerPlugin(ScrollTrigger);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frames = new Map<number, HTMLImageElement>();
    let targetFrame = reducedMotion ? Math.floor((FRAME_COUNT - 1) * 0.38) : 0;
    let renderedFrame = -1;
    let animationFrame = 0;
    let disposed = false;

    const resizeCanvas = () => {
      const bounds = layer.getBoundingClientRect();
      const density = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(bounds.width * density));
      const height = Math.max(1, Math.round(window.innerHeight * density));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        renderedFrame = -1;
      }
    };

    const drawFrame = (image: HTMLImageElement, index: number) => {
      if (disposed || !image.complete || image.naturalWidth === 0) return;

      resizeCanvas();

      const scale = Math.max(
        canvas.width / image.naturalWidth,
        canvas.height / image.naturalHeight,
      );
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      const x = (canvas.width - width) / 2;
      const y = (canvas.height - height) / 2;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, x, y, width, height);
      renderedFrame = index;
      section.dataset.workBackgroundFrame = String(index + 1);
    };

    const drawNearestLoadedFrame = () => {
      let nearestIndex = -1;
      let nearestDistance = Number.POSITIVE_INFINITY;

      frames.forEach((image, index) => {
        if (!image.complete || image.naturalWidth === 0) return;
        const distance = Math.abs(index - targetFrame);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      if (nearestIndex >= 0 && nearestIndex !== renderedFrame) {
        const image = frames.get(nearestIndex);
        if (image) drawFrame(image, nearestIndex);
      }
    };

    const trimFrameCache = () => {
      if (frames.size <= MAX_CACHED_FRAMES) return;

      const removable = Array.from(frames.keys())
        .filter((index) => index !== renderedFrame && index !== targetFrame)
        .sort(
          (first, second) =>
            Math.abs(second - targetFrame) - Math.abs(first - targetFrame),
        );

      while (frames.size > MAX_CACHED_FRAMES && removable.length > 0) {
        const index = removable.shift();
        if (index !== undefined) frames.delete(index);
      }
    };

    const loadFrame = (index: number) => {
      const safeIndex = Math.max(0, Math.min(FRAME_COUNT - 1, index));
      if (frames.has(safeIndex)) return;

      const image = new window.Image();
      image.decoding = "async";
      image.src = frameSource(safeIndex);
      frames.set(safeIndex, image);

      image.onload = () => {
        if (disposed) return;
        drawNearestLoadedFrame();
        trimFrameCache();
      };
    };

    const requestFrame = (index: number) => {
      targetFrame = Math.max(0, Math.min(FRAME_COUNT - 1, index));

      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        loadFrame(targetFrame);
        loadFrame(targetFrame - 1);
        loadFrame(targetFrame + 1);
        loadFrame(targetFrame - 2);
        loadFrame(targetFrame + 2);
        drawNearestLoadedFrame();
      });
    };

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
      renderedFrame = -1;
      drawNearestLoadedFrame();
    });
    resizeObserver.observe(layer);

    requestFrame(targetFrame);

    let scrollSequence: ScrollTrigger | undefined;
    if (!reducedMotion) {
      scrollSequence = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onUpdate: ({ progress }) => {
          section.style.setProperty("--work-background-progress", progress.toFixed(4));
          requestFrame(Math.round(progress * (FRAME_COUNT - 1)));
        },
      });
    } else {
      section.style.setProperty("--work-background-progress", "0.38");
    }

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      scrollSequence?.kill();
      frames.clear();
      delete section.dataset.workBackgroundFrame;
      section.style.removeProperty("--work-background-progress");
    };
  }, []);

  return (
    <div ref={layerRef} className={styles.layer} aria-hidden="true">
      <div className={styles.sticky}>
        <canvas ref={canvasRef} className={styles.canvas} />
        <div className={styles.readabilityVeil} />
      </div>
    </div>
  );
}
