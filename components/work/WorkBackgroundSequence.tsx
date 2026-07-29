"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./WorkBackgroundSequence.module.css";

const FRAME_COUNT = 240;
const MAX_DECODED_FRAMES = 18;
const PREFETCH_CONCURRENCY = 8;

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
    const fetchController = new AbortController();
    const frameBlobs = new Map<number, Blob>();
    const blobRequests = new Map<number, Promise<Blob | null>>();
    const decodedFrames = new Map<number, ImageBitmap>();
    const decodeRequests = new Map<number, Promise<ImageBitmap | null>>();
    let targetFrame = reducedMotion ? Math.floor((FRAME_COUNT - 1) * 0.38) : 0;
    let previousTargetFrame = targetFrame;
    let scrollDirection = 1;
    let renderedFrame = -1;
    let animationFrame = 0;
    let disposed = false;
    let prefetchStarted = false;

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

    const drawFrame = (image: ImageBitmap, index: number) => {
      if (disposed || image.width === 0 || image.height === 0) return;

      resizeCanvas();

      const scale = Math.max(
        canvas.width / image.width,
        canvas.height / image.height,
      );
      const width = image.width * scale;
      const height = image.height * scale;
      const x = (canvas.width - width) / 2;
      const y = (canvas.height - height) / 2;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, x, y, width, height);
      renderedFrame = index;
      section.dataset.workBackgroundFrame = String(index + 1);
    };

    const drawNearestDecodedFrame = () => {
      let nearestIndex = -1;
      let nearestDistance = Number.POSITIVE_INFINITY;

      decodedFrames.forEach((image, index) => {
        if (image.width === 0 || image.height === 0) return;
        const distance = Math.abs(index - targetFrame);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      if (nearestIndex >= 0 && nearestIndex !== renderedFrame) {
        const image = decodedFrames.get(nearestIndex);
        if (image) drawFrame(image, nearestIndex);
      }
    };

    const trimDecodedFrames = () => {
      if (decodedFrames.size <= MAX_DECODED_FRAMES) return;

      const removable = Array.from(decodedFrames.keys())
        .filter((index) => index !== renderedFrame && index !== targetFrame)
        .sort(
          (first, second) =>
            Math.abs(second - targetFrame) - Math.abs(first - targetFrame),
        );

      while (decodedFrames.size > MAX_DECODED_FRAMES && removable.length > 0) {
        const index = removable.shift();
        if (index === undefined) continue;
        decodedFrames.get(index)?.close();
        decodedFrames.delete(index);
      }
    };

    const fetchFrame = (index: number) => {
      const safeIndex = Math.max(0, Math.min(FRAME_COUNT - 1, index));
      const cachedBlob = frameBlobs.get(safeIndex);
      if (cachedBlob) return Promise.resolve(cachedBlob);

      const pendingRequest = blobRequests.get(safeIndex);
      if (pendingRequest) return pendingRequest;

      const request = fetch(frameSource(safeIndex), {
        cache: "force-cache",
        signal: fetchController.signal,
      })
        .then((response) => {
          if (!response.ok) throw new Error(`Frame ${safeIndex + 1} failed to load`);
          return response.blob();
        })
        .then((blob) => {
          if (disposed) return null;
          frameBlobs.set(safeIndex, blob);
          section.dataset.workBackgroundBuffered = String(frameBlobs.size);
          return blob;
        })
        .catch(() => null)
        .finally(() => {
          blobRequests.delete(safeIndex);
        });

      blobRequests.set(safeIndex, request);
      return request;
    };

    const decodeFrame = (index: number) => {
      const safeIndex = Math.max(0, Math.min(FRAME_COUNT - 1, index));
      const cachedFrame = decodedFrames.get(safeIndex);
      if (cachedFrame) return Promise.resolve(cachedFrame);

      const pendingDecode = decodeRequests.get(safeIndex);
      if (pendingDecode) return pendingDecode;

      const request = fetchFrame(safeIndex)
        .then((blob) => {
          if (!blob || disposed) return null;
          return window.createImageBitmap(blob);
        })
        .then((image) => {
          if (!image) return null;
          if (disposed) {
            image.close();
            return null;
          }

          decodedFrames.set(safeIndex, image);
          drawNearestDecodedFrame();
          trimDecodedFrames();
          return image;
        })
        .catch(() => null)
        .finally(() => {
          decodeRequests.delete(safeIndex);
        });

      decodeRequests.set(safeIndex, request);
      return request;
    };

    const requestFrame = (index: number) => {
      const nextFrame = Math.max(0, Math.min(FRAME_COUNT - 1, index));
      scrollDirection = nextFrame >= previousTargetFrame ? 1 : -1;
      previousTargetFrame = nextFrame;
      targetFrame = nextFrame;

      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const decodeOrder =
          scrollDirection > 0
            ? [0, 1, 2, 3, 4, -1, -2]
            : [0, -1, -2, -3, -4, 1, 2];

        decodeOrder.forEach((offset) => {
          void decodeFrame(targetFrame + offset);
        });
        drawNearestDecodedFrame();
      });
    };

    const prefetchSequence = () => {
      if (prefetchStarted || disposed || reducedMotion) return;
      prefetchStarted = true;

      const anchors = Array.from(
        { length: Math.ceil(FRAME_COUNT / 8) },
        (_, index) => index * 8,
      );
      const fullSequence = Array.from({ length: FRAME_COUNT }, (_, index) => index);
      const prefetchOrder = Array.from(
        new Set([...anchors, FRAME_COUNT - 1, ...fullSequence]),
      );
      let cursor = 0;

      const worker = async () => {
        while (!disposed && cursor < prefetchOrder.length) {
          const index = prefetchOrder[cursor];
          cursor += 1;
          await fetchFrame(index);
        }
      };

      void Promise.all(
        Array.from({ length: PREFETCH_CONCURRENCY }, () => worker()),
      ).then(() => {
        if (!disposed) section.dataset.workBackgroundReady = "true";
      });
    };

    const prefetchObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          prefetchSequence();
          prefetchObserver.disconnect();
        }
      },
      { rootMargin: "240% 0px" },
    );
    prefetchObserver.observe(section);

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
      renderedFrame = -1;
      drawNearestDecodedFrame();
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
      fetchController.abort();
      prefetchObserver.disconnect();
      resizeObserver.disconnect();
      scrollSequence?.kill();
      decodedFrames.forEach((image) => image.close());
      decodedFrames.clear();
      decodeRequests.clear();
      frameBlobs.clear();
      blobRequests.clear();
      delete section.dataset.workBackgroundFrame;
      delete section.dataset.workBackgroundBuffered;
      delete section.dataset.workBackgroundReady;
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
