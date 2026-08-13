"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import Lenis from "lenis";
import { portfolioContent } from "@/lib/portfolio-content";
import { useGsapClient } from "@/lib/use-gsap-client";
import { setScrollController } from "@/lib/scroll-controller";
import { Button04 } from "@/components/ui/animated-arrow-button";

const FRAME_COUNT = 195;
const FRAME_ROOT = "/assets/hero/frames";
const HERO_READY_EVENT = "portfolio:hero-ready";

const framePath = (index: number) =>
  `${FRAME_ROOT}/frame-${String(index + 1).padStart(3, "0")}.jpg`;

/*
 * 195 JPEGs and a WebGL scene are a fair ask on a laptop and an unfair one on a
 * metered phone. Where the browser tells us the connection is constrained, the
 * sequence drops to its anchor frames and the Three.js field never loads: the
 * hero still resolves from obstruction to clarity, just in coarser steps.
 */
type NetworkInformation = { saveData?: boolean; effectiveType?: string };

const isConstrainedConnection = () => {
  const connection = (navigator as Navigator & { connection?: NetworkInformation })
    .connection;
  if (!connection) return false;
  if (connection.saveData) return true;
  return ["slow-2g", "2g", "3g"].includes(connection.effectiveType ?? "");
};

/* A frame that 404'd or decoded empty reports `complete: true`. Treating that
   as loaded made the nearest-neighbour search settle on it and draw nothing. */
const isDrawable = (image: HTMLImageElement | undefined): image is HTMLImageElement =>
  Boolean(image?.complete && image.naturalWidth > 0);

export function PortfolioHero() {
  const gsapModules = useGsapClient();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameLayerRef = useRef<HTMLDivElement>(null);
  const frameCanvasRef = useRef<HTMLCanvasElement>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement>(null);
  const progressBarRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const hero = portfolioContent.hero;

  const requestSection = (
    event: MouseEvent<HTMLAnchorElement>,
    id: "about" | "work",
  ) => {
    event.preventDefault();
    window.dispatchEvent(new CustomEvent("portfolio:navigate", { detail: { id } }));
  };

  useEffect(() => {
    if (!gsapModules) return;
    const { gsap, ScrollTrigger } = gsapModules;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const layer = frameLayerRef.current;
    const canvas = frameCanvasRef.current;
    const progressBar = progressBarRef.current;

    if (!section || !stage || !layer || !canvas || !progressBar) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const constrained = isConstrainedConnection();
    // `drawFrame` is a hoisted declaration, so it does not inherit the null
    // narrowing from the guard above; this alias carries it.
    const frameLayer: HTMLDivElement = layer;
    const images: Array<HTMLImageElement | undefined> = new Array(FRAME_COUNT);
    let destroyed = false;
    let hasPainted = false;
    let lastRendered = reducedMotion ? 96 : 0;
    let lenis: Lenis | undefined;
    let lenisTicker: ((time: number) => void) | undefined;
    let pointerParallax: (() => void) | undefined;

    const resizeCanvas = () => {
      const rect = stage.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      drawFrame(lastRendered);
    };

    const drawImageCover = (image: HTMLImageElement) => {
      const canvasRatio = canvas.width / canvas.height;
      const imageRatio = image.naturalWidth / image.naturalHeight;
      let sourceWidth = image.naturalWidth;
      let sourceHeight = image.naturalHeight;
      let sourceX = 0;
      let sourceY = 0;

      if (imageRatio > canvasRatio) {
        sourceWidth = image.naturalHeight * canvasRatio;
        sourceX = (image.naturalWidth - sourceWidth) / 2;
      } else {
        sourceHeight = image.naturalWidth / canvasRatio;
        sourceY = (image.naturalHeight - sourceHeight) / 2;
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

    function drawFrame(requestedIndex: number) {
      const clamped = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(requestedIndex)));
      let resolved = clamped;

      if (!isDrawable(images[resolved])) {
        for (let offset = 1; offset < FRAME_COUNT; offset += 1) {
          const before = clamped - offset;
          const after = clamped + offset;
          if (before >= 0 && isDrawable(images[before])) {
            resolved = before;
            break;
          }
          if (after < FRAME_COUNT && isDrawable(images[after])) {
            resolved = after;
            break;
          }
        }
      }

      const image = images[resolved];
      if (!isDrawable(image)) return;
      lastRendered = resolved;
      drawImageCover(image);

      // The 2D context is opaque, so until something is painted the canvas is a
      // black rectangle sitting on top of the CSS still that is meant to carry
      // the hero when the sequence cannot. Reveal it only once it has content.
      if (!hasPainted) {
        hasPainted = true;
        frameLayer.dataset.painted = "true";
      }
    }

    const loadFrame = (index: number) =>
      new Promise<void>((resolve) => {
        if (destroyed || images[index]) {
          resolve();
          return;
        }

        const image = new Image();
        image.decoding = "async";
        image.src = framePath(index);
        images[index] = image;
        image.onload = () => {
          if (index === lastRendered || (reducedMotion && index === 96)) drawFrame(index);
          resolve();
        };
        image.onerror = () => resolve();
      });

    const preloadSequence = async () => {
      const anchorFrames = Array.from(
        new Set([
          0,
          96,
          FRAME_COUNT - 1,
          ...Array.from({ length: 33 }, (_, index) => Math.min(index * 6, FRAME_COUNT - 1)),
        ]),
      );
      const anchorSet = new Set(anchorFrames);
      // On a constrained connection the anchors are the whole sequence: 35
      // frames instead of 195, and the nearest-neighbour draw covers the rest.
      const queue = constrained
        ? anchorFrames
        : [
            ...anchorFrames,
            ...Array.from({ length: FRAME_COUNT }, (_, index) => index).filter(
              (index) => !anchorSet.has(index),
            ),
          ];
      let cursor = 0;

      const worker = async () => {
        while (!destroyed && cursor < queue.length) {
          const index = queue[cursor];
          cursor += 1;
          await loadFrame(index);
        }
      };

      await Promise.all(Array.from({ length: constrained ? 2 : 6 }, worker));
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerRef.current.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const onPointerLeave = () => {
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
    };

    void Promise.all([loadFrame(0), loadFrame(96), loadFrame(FRAME_COUNT - 1)]).then(() => {
      if (destroyed) return;
      resizeCanvas();
      document.documentElement.dataset.heroReady = "true";
      window.dispatchEvent(new CustomEvent(HERO_READY_EVENT));
    });
    void preloadSequence();
    window.addEventListener("resize", resizeCanvas);
    stage.addEventListener("pointermove", onPointerMove, { passive: true });
    stage.addEventListener("pointerleave", onPointerLeave);

    const animationContext = gsap.context(() => {
      if (reducedMotion) {
        gsap.set("[data-beat='two']", { autoAlpha: 0 });
        gsap.set(progressBar, { scaleX: 1 });
        return;
      }

      const moveX = gsap.quickTo(layer, "xPercent", {
        duration: 0.8,
        ease: "power3.out",
      });
      const moveY = gsap.quickTo(layer, "yPercent", {
        duration: 0.8,
        ease: "power3.out",
      });

      pointerParallax = () => {
        moveX(pointerRef.current.x * -0.7);
        moveY(pointerRef.current.y * -0.45);
      };
      gsap.ticker.add(pointerParallax);

      const timeline = gsap.timeline({
        defaults: { ease: "power4.inOut" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.18,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            progressRef.current = self.progress;
            drawFrame(self.progress * (FRAME_COUNT - 1));
            gsap.set(progressBar, { scaleX: self.progress });
          },
        },
      });

      // Two beats over a 200svh stage: the headline block holds most of the
      // sequence, then hands off to the single closing statement.
      timeline
        .to("[data-beat='one']", { autoAlpha: 0, yPercent: -14, duration: 0.6 }, 0.85)
        .fromTo(
          "[data-beat='two']",
          { autoAlpha: 0, yPercent: 16 },
          { autoAlpha: 1, yPercent: 0, duration: 0.7 },
          1.2,
        );

      lenis = new Lenis({
        duration: 1.05,
        smoothWheel: true,
        touchMultiplier: 1.15,
      });
      lenis.on("scroll", ScrollTrigger.update);
      lenisTicker = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(lenisTicker);
      gsap.ticker.lagSmoothing(0);
      setScrollController(lenis);

    }, section);

    resizeCanvas();
    ScrollTrigger.refresh();

    return () => {
      destroyed = true;
      animationContext.revert();
      if (pointerParallax) gsap.ticker.remove(pointerParallax);
      if (lenisTicker) gsap.ticker.remove(lenisTicker);
      setScrollController(null);
      lenis?.destroy();
      window.removeEventListener("resize", resizeCanvas);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [gsapModules]);

  useEffect(() => {
    const canvas = threeCanvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // The focus field is atmosphere layered over the frame sequence. It is the
    // first thing to go when motion is unwanted or bytes are expensive.
    if (reducedMotion || isConstrainedConnection()) return;

    let cancelled = false;
    let disposeScene = () => undefined;

    void (async () => {
      let THREE: typeof import("three");
      try {
        THREE = await import("three");
      } catch (error) {
        // Chunk blocked or unavailable: the hero is complete without it.
        console.warn("Hero focus field unavailable.", error);
        return;
      }
      if (cancelled) return;

      // Software-blocked WebGL, an exhausted context pool, or a driver
      // blocklist all throw here. Uncaught, that took down the whole route.
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
      } catch (error) {
        console.warn("WebGL unavailable; hero renders without the focus field.", error);
        canvas.style.display = "none";
        return;
      }

      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 0, 6.5);

      const focusField = new THREE.Group();
      focusField.position.set(-2.35, 0.15, 0);
      scene.add(focusField);

      const ringMaterials: InstanceType<typeof THREE.MeshStandardMaterial>[] = [];
      for (let index = 0; index < 4; index += 1) {
        const geometry = new THREE.TorusGeometry(
          1.05 + index * 0.24,
          0.012 + index * 0.004,
          8,
          160,
          Math.PI * (1.15 + index * 0.09),
        );
        const material = new THREE.MeshStandardMaterial({
          color: index % 2 === 0 ? 0xff4f18 : 0xffd4c7,
          metalness: 0.86,
          roughness: 0.18,
          transparent: true,
          opacity: 0.24 + index * 0.045,
        });
        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.set(index * 0.2 - 0.32, index * -0.14, index * 0.34 - 0.55);
        ring.position.z = index * -0.18;
        ringMaterials.push(material);
        focusField.add(ring);
      }

      const pointGeometry = new THREE.BufferGeometry();
      const pointPositions = new Float32Array(72 * 3);
      for (let index = 0; index < 72; index += 1) {
        const angle = index * 2.399963;
        const radius = 0.55 + ((index * 37) % 100) / 58;
        pointPositions[index * 3] = Math.cos(angle) * radius;
        pointPositions[index * 3 + 1] = Math.sin(angle) * radius;
        pointPositions[index * 3 + 2] = ((index * 17) % 31) / 18 - 0.85;
      }
      pointGeometry.setAttribute("position", new THREE.BufferAttribute(pointPositions, 3));
      const pointMaterial = new THREE.PointsMaterial({
        color: 0xff8a68,
        size: 0.018,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true,
      });
      const points = new THREE.Points(pointGeometry, pointMaterial);
      focusField.add(points);

      scene.add(new THREE.AmbientLight(0xffd8cf, 0.8));
      const hotLight = new THREE.PointLight(0xff4f18, 14, 18);
      hotLight.position.set(-1.5, 2.6, 3.5);
      scene.add(hotLight);

      let rafId = 0;
      let contextLost = false;

      /*
       * A GPU reset, a backgrounded tab reclaimed by the OS, or too many live
       * contexts on the machine all fire this. Without it the canvas keeps its
       * last frame frozen under `mix-blend-mode: screen`, which reads as a
       * smear across the portrait rather than as a missing effect.
       */
      const onContextLost = (event: Event) => {
        event.preventDefault();
        contextLost = true;
        window.cancelAnimationFrame(rafId);
        canvas.style.display = "none";
      };
      canvas.addEventListener("webglcontextlost", onContextLost);

      const resize = () => {
        const rect = stage.getBoundingClientRect();
        renderer.setSize(rect.width, rect.height, false);
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
      };

      const render = () => {
        if (cancelled || contextLost) return;
        const progress = progressRef.current;
        const pointer = pointerRef.current;

        camera.position.x += (pointer.x * 0.16 - camera.position.x) * 0.045;
        camera.position.y += (pointer.y * -0.11 - camera.position.y) * 0.045;
        focusField.rotation.y += (progress * 1.05 + pointer.x * 0.12 - focusField.rotation.y) * 0.05;
        focusField.rotation.z += (-0.18 + progress * 0.62 - focusField.rotation.z) * 0.045;
        focusField.position.x +=
          (-2.35 + Math.sin(progress * Math.PI) * 0.48 - focusField.position.x) * 0.04;
        points.rotation.z -= 0.0008;

        ringMaterials.forEach((material, index) => {
          material.opacity = 0.16 + Math.sin(progress * Math.PI + index * 0.35) * 0.1;
        });

        renderer.render(scene, camera);
        rafId = window.requestAnimationFrame(render);
      };

      resize();
      window.addEventListener("resize", resize);
      render();

      disposeScene = () => {
        window.cancelAnimationFrame(rafId);
        window.removeEventListener("resize", resize);
        canvas.removeEventListener("webglcontextlost", onContextLost);
        focusField.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((material) => material.dispose());
          }
        });
        pointGeometry.dispose();
        pointMaterial.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      cancelled = true;
      disposeScene();
    };
  }, []);

  return (
    <section ref={sectionRef} id="home" className="hero-sequence" aria-labelledby="hero-title">
      <div ref={stageRef} className="hero-stage">
        <div ref={frameLayerRef} className="hero-frame-layer" aria-hidden="true">
          <canvas ref={frameCanvasRef} className="hero-frame-canvas" />
        </div>
        <canvas ref={threeCanvasRef} className="hero-three-canvas" aria-hidden="true" />
        <div className="hero-scrim" aria-hidden="true" />
        <div className="hero-grain" aria-hidden="true" />

        <div className="hero-copy-grid">
          <div className="hero-role">
            <p>{hero.location}</p>
          </div>

          <div className="hero-beats">
            <div className="hero-beat hero-beat-one" data-beat="one">
              {/* Identity, seniority and domain sit above the headline so the
                  45-second scan reaches them without interaction, at every
                  breakpoint. See PRODUCT.md "Preserve the fast scan path". */}
              <p className="hero-identity">
                <span className="hero-identity-name">{hero.name}</span>
                <span className="hero-identity-role">{hero.role}</span>
                <span className="hero-identity-domains">{hero.domains}</span>
                {/* Availability is the fact that decides whether this visitor
                    keeps reading, and it used to live only in the menu overlay
                    and at the far end of Contact. It sits inside the identity
                    block rather than the left rail because this block is the
                    one part of the scan path no breakpoint hides. */}
                <span className="hero-identity-availability">
                  <span className="hero-availability-dot" aria-hidden="true" />
                  {hero.availability}
                </span>
                {/* The left rail that normally carries location is display:none
                    on compact phones and short landscape. Location is part of
                    the scan path at every breakpoint, so it reappears here —
                    exactly where the rail is hidden, never both at once. */}
                <span className="hero-identity-location">{hero.location}</span>
              </p>
              <h1 id="hero-title">
                {hero.headline.map((line, index) => (
                  <span key={line}>{index > 0 ? ` ${line}` : line}</span>
                ))}
              </h1>
              <p className="hero-support">{hero.support}</p>
            </div>

            <p className="hero-beat hero-beat-statement" data-beat="two" aria-hidden="true">
              {hero.close.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>

            {/* A bare div takes no accessible name, so the old aria-label was
                dropped outright. `role="group"` is what makes the label reach
                assistive tech — and the label now says where the pair goes
                rather than calling them "destinations". */}
            <div className="hero-actions" role="group" aria-label="Jump to a section">
              <Button04
                className="hero-action hero-action-primary"
                href="#work"
                text="See my work"
                /* The pair splits the row `flex: 1 1 0`, so both labels have to
                   fit the same half. Neither does at 375px. */
                compactText="See work"
                variant="brand"
                size="medium"
                onClick={(event) => requestSection(event, "work")}
              />
              <Button04
                className="hero-action hero-action-secondary"
                href="#about"
                text="More about me"
                /* Below 620px the full label overruns its own box and slides
                   under the arrow glyph. Same swap the header CTA uses. */
                compactText="About me"
                variant="outline-light"
                size="medium"
                onClick={(event) => requestSection(event, "about")}
              />
            </div>
          </div>
        </div>

        <div className="hero-scroll-status" aria-hidden="true">
          <span>Scroll to focus</span>
          <span className="hero-progress-track">
            <span ref={progressBarRef} />
          </span>
          <span>195 frames</span>
        </div>
      </div>
    </section>
  );
}
