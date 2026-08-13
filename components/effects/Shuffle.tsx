"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
} from "react";
import { useGsapClient } from "@/lib/use-gsap-client";
import "./Shuffle.css";

type ShuffleDirection = "left" | "right" | "up" | "down";
type ShuffleAnimationMode = "evenodd" | "random";
type ShuffleTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
type GsapClientModules = NonNullable<ReturnType<typeof useGsapClient>>;
type GsapSplitTextInstance = InstanceType<GsapClientModules["SplitText"]>;

export interface ShuffleProps {
  text: string;
  className?: string;
  style?: CSSProperties;
  shuffleDirection?: ShuffleDirection;
  duration?: number;
  maxDelay?: number;
  ease?: GSAPTweenVars["ease"];
  threshold?: number;
  rootMargin?: string;
  tag?: ShuffleTag;
  textAlign?: CSSProperties["textAlign"];
  onShuffleComplete?: () => void;
  shuffleTimes?: number;
  animationMode?: ShuffleAnimationMode;
  loop?: boolean;
  loopDelay?: number;
  stagger?: number;
  scrambleCharset?: string;
  colorFrom?: string;
  colorTo?: string;
  triggerOnce?: boolean;
  respectReducedMotion?: boolean;
  triggerOnHover?: boolean;
}

export function Shuffle({
  text,
  className = "",
  style = {},
  shuffleDirection = "right",
  duration = 0.35,
  maxDelay = 0,
  ease = "power3.out",
  threshold = 0.1,
  rootMargin = "-100px",
  tag = "p",
  textAlign = "center",
  onShuffleComplete,
  shuffleTimes = 1,
  animationMode = "evenodd",
  loop = false,
  loopDelay = 0,
  stagger = 0.03,
  scrambleCharset = "",
  colorFrom,
  colorTo,
  triggerOnce = true,
  respectReducedMotion = true,
  triggerOnHover = true,
}: ShuffleProps) {
  const gsapModules = useGsapClient();
  const ref = useRef<HTMLElement | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(() => {
    if (typeof document === "undefined") return false;
    if (!("fonts" in document)) return true;
    return document.fonts.status === "loaded";
  });
  const [ready, setReady] = useState(false);

  const splitRef = useRef<GsapSplitTextInstance | null>(null);
  const wrappersRef = useRef<HTMLSpanElement[]>([]);
  const tlRef = useRef<GSAPTimeline | null>(null);
  const playingRef = useRef(false);
  const hoverHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof document === "undefined" || !("fonts" in document)) return;
    if (document.fonts.status === "loaded") return;

    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setFontsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const scrollTriggerStart = useMemo(() => {
    const startPct = (1 - threshold) * 100;
    const mm = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin || "");
    const mv = mm ? parseFloat(mm[1]) : 0;
    const mu = mm ? mm[2] || "px" : "px";
    const sign = mv === 0 ? "" : mv < 0 ? `-=${Math.abs(mv)}${mu}` : `+=${mv}${mu}`;
    return `top ${startPct}%${sign}`;
  }, [threshold, rootMargin]);

  useEffect(
    () => {
      if (!gsapModules) return;
      const { gsap, ScrollTrigger, SplitText: GSAPSplitText } = gsapModules;
      gsap.registerPlugin(ScrollTrigger, GSAPSplitText);
      const el = ref.current;
      if (!el || !text || !fontsLoaded) return;
      if (
        respectReducedMotion &&
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        const readyFrame = window.requestAnimationFrame(() => {
          setReady(true);
          onShuffleComplete?.();
        });
        return () => window.cancelAnimationFrame(readyFrame);
      }

      const start = scrollTriggerStart;
      const isVertical = shuffleDirection === "up" || shuffleDirection === "down";

      const removeHover = () => {
        if (hoverHandlerRef.current && ref.current) {
          ref.current.removeEventListener("mouseenter", hoverHandlerRef.current);
          hoverHandlerRef.current = null;
        }
      };

      const teardown = () => {
        if (tlRef.current) {
          tlRef.current.kill();
          tlRef.current = null;
        }
        if (wrappersRef.current.length) {
          wrappersRef.current.forEach((wrap) => {
            const inner = wrap.firstElementChild;
            const orig = inner?.querySelector('[data-orig="1"]');
            if (orig && wrap.parentNode) wrap.parentNode.replaceChild(orig, wrap);
          });
          wrappersRef.current = [];
        }
        try {
          splitRef.current?.revert();
        } catch {
          /* noop */
        }
        splitRef.current = null;
        playingRef.current = false;
      };

      const build = () => {
        teardown();

        splitRef.current = new GSAPSplitText(el, {
          type: "chars",
          charsClass: "shuffle-char",
          wordsClass: "shuffle-word",
          linesClass: "shuffle-line",
          smartWrap: true,
          reduceWhiteSpace: false,
        });

        const chars = (splitRef.current.chars ?? []) as HTMLElement[];
        wrappersRef.current = [];

        const rolls = Math.max(1, Math.floor(shuffleTimes));
        const rand = (set: string) => set.charAt(Math.floor(Math.random() * set.length)) || "";

        chars.forEach((ch) => {
          const parent = ch.parentElement;
          if (!parent) return;

          const rect = ch.getBoundingClientRect();
          const w = rect.width;
          const h = rect.height;
          if (!w) return;

          const wrap = document.createElement("span");
          Object.assign(wrap.style, {
            display: "inline-block",
            overflow: "hidden",
            width: `${w}px`,
            height: isVertical ? `${h}px` : "auto",
            verticalAlign: "bottom",
          });

          const inner = document.createElement("span");
          Object.assign(inner.style, {
            display: "inline-block",
            whiteSpace: isVertical ? "normal" : "nowrap",
            willChange: "transform",
          });

          parent.insertBefore(wrap, ch);
          wrap.appendChild(inner);

          const firstOrig = ch.cloneNode(true) as HTMLElement;
          Object.assign(firstOrig.style, {
            display: isVertical ? "block" : "inline-block",
            width: `${w}px`,
            textAlign: "center",
          });

          ch.setAttribute("data-orig", "1");
          Object.assign(ch.style, {
            display: isVertical ? "block" : "inline-block",
            width: `${w}px`,
            textAlign: "center",
          });

          inner.appendChild(firstOrig);
          for (let k = 0; k < rolls; k++) {
            const c = ch.cloneNode(true) as HTMLElement;
            if (scrambleCharset) c.textContent = rand(scrambleCharset);
            Object.assign(c.style, {
              display: isVertical ? "block" : "inline-block",
              width: `${w}px`,
              textAlign: "center",
            });
            inner.appendChild(c);
          }
          inner.appendChild(ch);

          if (shuffleDirection === "right" || shuffleDirection === "down") {
            const firstCopy = inner.firstElementChild;
            const real = inner.lastElementChild;
            if (real) inner.insertBefore(real, inner.firstChild);
            if (firstCopy) inner.appendChild(firstCopy);
          }

          const steps = rolls + 1;
          let startX = 0;
          let finalX = 0;
          let startY = 0;
          let finalY = 0;

          if (shuffleDirection === "right") {
            startX = -steps * w;
            finalX = 0;
          } else if (shuffleDirection === "left") {
            startX = 0;
            finalX = -steps * w;
          } else if (shuffleDirection === "down") {
            startY = -steps * h;
            finalY = 0;
          } else if (shuffleDirection === "up") {
            startY = 0;
            finalY = -steps * h;
          }

          if (shuffleDirection === "left" || shuffleDirection === "right") {
            gsap.set(inner, { x: startX, y: 0, force3D: true });
            inner.setAttribute("data-start-x", String(startX));
            inner.setAttribute("data-final-x", String(finalX));
          } else {
            gsap.set(inner, { x: 0, y: startY, force3D: true });
            inner.setAttribute("data-start-y", String(startY));
            inner.setAttribute("data-final-y", String(finalY));
          }

          if (colorFrom) inner.style.color = colorFrom;
          wrappersRef.current.push(wrap);
        });
      };

      const inners = () =>
        wrappersRef.current
          .map((wrap) => wrap.firstElementChild as HTMLElement | null)
          .filter((node): node is HTMLElement => Boolean(node));

      const randomizeScrambles = () => {
        if (!scrambleCharset) return;
        wrappersRef.current.forEach((wrap) => {
          const strip = wrap.firstElementChild;
          if (!strip) return;
          const kids = Array.from(strip.children);
          for (let i = 1; i < kids.length - 1; i++) {
            kids[i].textContent = scrambleCharset.charAt(
              Math.floor(Math.random() * scrambleCharset.length),
            );
          }
        });
      };

      const cleanupToStill = () => {
        wrappersRef.current.forEach((wrap) => {
          const strip = wrap.firstElementChild as HTMLElement | null;
          if (!strip) return;
          const real = strip.querySelector('[data-orig="1"]') as HTMLElement | null;
          if (!real) return;
          strip.replaceChildren(real);
          strip.style.transform = "none";
          strip.style.willChange = "auto";
          /*
           * The per-character boxes are measured once, at whatever size the
           * text happened to be when the reveal fired, and they are only
           * needed while the strips are sliding. Left behind they outlive
           * every later resize: these headings are sized off the container
           * or the viewport, so rotating an iPad — or a late web-font swap —
           * shrinks the glyphs inside boxes that keep the old width, and the
           * word visibly splits apart. The resting state needs no fixed
           * boxes, so hand the letters back to normal layout.
           */
          wrap.style.width = "";
          wrap.style.height = "";
          wrap.style.overflow = "";
          real.style.width = "";
          real.style.textAlign = "";
        });
      };

      const play = () => {
        const strips = inners();
        if (!strips.length) return;

        playingRef.current = true;

        const tl = gsap.timeline({
          smoothChildTiming: true,
          repeat: loop ? -1 : 0,
          repeatDelay: loop ? loopDelay : 0,
          onRepeat: () => {
            if (scrambleCharset) randomizeScrambles();
            if (isVertical) {
              gsap.set(strips, {
                y: (_i: number, target: HTMLElement) =>
                  parseFloat(target.getAttribute("data-start-y") || "0"),
              });
            } else {
              gsap.set(strips, {
                x: (_i: number, target: HTMLElement) =>
                  parseFloat(target.getAttribute("data-start-x") || "0"),
              });
            }
            onShuffleComplete?.();
          },
          onComplete: () => {
            playingRef.current = false;
            if (!loop) {
              cleanupToStill();
              if (colorTo) gsap.set(strips, { color: colorTo });
              onShuffleComplete?.();
              armHover();
            }
          },
        });

        const addTween = (targets: HTMLElement[], at: number) => {
          const vars: GSAPTweenVars = {
            duration,
            ease,
            force3D: true,
            stagger: animationMode === "evenodd" ? stagger : 0,
          };
          if (isVertical) {
            vars.y = (_i: number, target: HTMLElement) =>
              parseFloat(target.getAttribute("data-final-y") || "0");
          } else {
            vars.x = (_i: number, target: HTMLElement) =>
              parseFloat(target.getAttribute("data-final-x") || "0");
          }

          tl.to(targets, vars, at);

          if (colorFrom && colorTo) {
            tl.to(targets, { color: colorTo, duration, ease }, at);
          }
        };

        if (animationMode === "evenodd") {
          const odd = strips.filter((_, i) => i % 2 === 1);
          const even = strips.filter((_, i) => i % 2 === 0);
          const oddTotal = duration + Math.max(0, odd.length - 1) * stagger;
          const evenStart = odd.length ? oddTotal * 0.7 : 0;
          if (odd.length) addTween(odd, 0);
          if (even.length) addTween(even, evenStart);
        } else {
          strips.forEach((strip) => {
            const d = Math.random() * maxDelay;
            const vars: GSAPTweenVars = { duration, ease, force3D: true };
            if (isVertical) {
              vars.y = parseFloat(strip.getAttribute("data-final-y") || "0");
            } else {
              vars.x = parseFloat(strip.getAttribute("data-final-x") || "0");
            }
            tl.to(strip, vars, d);
            if (colorFrom && colorTo) {
              tl.fromTo(strip, { color: colorFrom }, { color: colorTo, duration, ease }, d);
            }
          });
        }

        tlRef.current = tl;
      };

      const armHover = () => {
        if (!triggerOnHover || !ref.current) return;
        removeHover();
        const handler = () => {
          if (playingRef.current) return;
          build();
          if (scrambleCharset) randomizeScrambles();
          play();
        };
        hoverHandlerRef.current = handler;
        ref.current.addEventListener("mouseenter", handler);
      };

      const create = () => {
        build();
        if (scrambleCharset) randomizeScrambles();
        play();
        armHover();
        setReady(true);
      };

      const trigger = ScrollTrigger.create({
        trigger: el,
        start,
        once: triggerOnce,
        onEnter: create,
      });

      return () => {
        trigger.kill();
        removeHover();
        teardown();
        setReady(false);
      };
    },
    [
      gsapModules,
      text,
      duration,
      maxDelay,
      ease,
      scrollTriggerStart,
      fontsLoaded,
      shuffleDirection,
      shuffleTimes,
      animationMode,
      loop,
      loopDelay,
      stagger,
      scrambleCharset,
      colorFrom,
      colorTo,
      triggerOnce,
      respectReducedMotion,
      triggerOnHover,
      onShuffleComplete,
    ],
  );

  const commonStyle = useMemo<CSSProperties>(() => ({ textAlign, ...style }), [textAlign, style]);
  const classes = useMemo(
    () => `shuffle-parent ${ready ? "is-ready" : ""} ${className}`.trim(),
    [ready, className],
  );

  const Tag = tag as ElementType;

  return (
    <Tag ref={ref} className={classes} style={commonStyle}>
      {text}
    </Tag>
  );
}

export default Shuffle;
