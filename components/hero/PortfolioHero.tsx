"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { portfolioContent } from "@/lib/portfolio-content";

const FRAME_COUNT = 195;
const FRAME_ROOT = "/assets/hero/frames";
const HERO_READY_EVENT = "portfolio:hero-ready";

const framePath = (index: number) =>
  `${FRAME_ROOT}/frame-${String(index + 1).padStart(3, "0")}.jpg`;

export function PortfolioHero() {
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
    const images: Array<HTMLImageElement | undefined> = new Array(FRAME_COUNT);
    let destroyed = false;
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

      if (!images[resolved]?.complete) {
        for (let offset = 1; offset < FRAME_COUNT; offset += 1) {
          const before = clamped - offset;
          const after = clamped + offset;
          if (before >= 0 && images[before]?.complete) {
            resolved = before;
            break;
          }
          if (after < FRAME_COUNT && images[after]?.complete) {
            resolved = after;
            break;
          }
        }
      }

      const image = images[resolved];
      if (!image?.complete || image.naturalWidth === 0) return;
      lastRendered = resolved;
      drawImageCover(image);
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
      const queue = [
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

      await Promise.all(Array.from({ length: 6 }, worker));
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
        gsap.set("[data-beat='two'], [data-beat='three']", { autoAlpha: 0 });
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

      timeline
        .to("[data-beat='one']", { autoAlpha: 0, yPercent: -14, duration: 0.75 }, 0.72)
        .fromTo(
          "[data-beat='two']",
          { autoAlpha: 0, yPercent: 16 },
          { autoAlpha: 1, yPercent: 0, duration: 0.7 },
          1.05,
        )
        .to("[data-beat='two']", { autoAlpha: 0, yPercent: -12, duration: 0.65 }, 2.08)
        .fromTo(
          "[data-beat='three']",
          { autoAlpha: 0, yPercent: 14 },
          { autoAlpha: 1, yPercent: 0, duration: 0.75 },
          2.52,
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

    }, section);

    resizeCanvas();
    ScrollTrigger.refresh();

    return () => {
      destroyed = true;
      animationContext.revert();
      if (pointerParallax) gsap.ticker.remove(pointerParallax);
      if (lenisTicker) gsap.ticker.remove(lenisTicker);
      lenis?.destroy();
      window.removeEventListener("resize", resizeCanvas);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  useEffect(() => {
    const canvas = threeCanvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let cancelled = false;
    let disposeScene = () => undefined;

    void (async () => {
      const THREE = await import("three");
      if (cancelled) return;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
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
      const resize = () => {
        const rect = stage.getBoundingClientRect();
        renderer.setSize(rect.width, rect.height, false);
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
      };

      const render = () => {
        if (cancelled) return;
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
            <span className="hero-role-index">01 / Hero</span>
            <p>{hero.role}</p>
            <p>{hero.domains}</p>
          </div>

          <div className="hero-beats">
            <div className="hero-beat hero-beat-one" data-beat="one">
              <p className="hero-kicker">{hero.name}</p>
              <h1 id="hero-title">
                {hero.headline.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h1>
              <p className="hero-support">{hero.support}</p>
            </div>

            <p className="hero-beat hero-beat-statement" data-beat="two" aria-hidden="true">
              {hero.statement.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>

            <p className="hero-beat hero-beat-statement" data-beat="three" aria-hidden="true">
              {hero.close.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>

            <div className="hero-actions" aria-label="Featured destinations">
              <a
                className="hero-action hero-action-primary"
                href="#work"
                onClick={(event) => requestSection(event, "work")}
              >
                <span>My work</span>
                <span aria-hidden="true">↗</span>
              </a>
              <a
                className="hero-action hero-action-secondary"
                href="#about"
                onClick={(event) => requestSection(event, "about")}
              >
                <span>More about me</span>
                <span aria-hidden="true">↘</span>
              </a>
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
