"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
} from "react";
import { useGsapClient } from "@/lib/use-gsap-client";
import "./SplitText.css";

type SplitTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
type SplitType = "chars" | "words" | "lines" | "words, chars";
type GsapClientModules = NonNullable<ReturnType<typeof useGsapClient>>;
type GsapSplitTextInstance = InstanceType<GsapClientModules["SplitText"]>;
type SplitElement = HTMLElement & {
  _rbsplitInstance?: GsapSplitTextInstance | null;
};

export interface SplitTextProps {
  id?: string;
  text?: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: SplitType;
  from?: GSAPTweenVars;
  to?: GSAPTweenVars;
  threshold?: number;
  rootMargin?: string;
  textAlign?: CSSProperties["textAlign"];
  tag?: SplitTag;
  onLetterAnimationComplete?: () => void;
}

export default function SplitText({
  id,
  text = "",
  className = "",
  delay = 50,
  duration = 1.25,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "center",
  tag = "p",
  onLetterAnimationComplete,
}: SplitTextProps) {
  const gsapModules = useGsapClient();
  const ref = useRef<SplitElement | null>(null);
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const fromRef = useRef(from);
  const toRef = useRef(to);
  const [fontsLoaded, setFontsLoaded] = useState(() => {
    if (typeof document === "undefined") return false;
    if (!("fonts" in document)) return true;
    return document.fonts.status === "loaded";
  });
  const fromKey = JSON.stringify(from);
  const toKey = JSON.stringify(to);

  useEffect(() => {
    fromRef.current = from;
    toRef.current = to;
  }, [from, to]);

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    animationCompletedRef.current = false;
  }, [text]);

  useEffect(() => {
    if (!("fonts" in document) || document.fonts.status === "loaded") return;

    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setFontsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(
    () => {
      if (!gsapModules) return;
      const { gsap, ScrollTrigger, SplitText: GSAPSplitText } = gsapModules;
      gsap.registerPlugin(ScrollTrigger, GSAPSplitText);
      if (!ref.current || !text || !fontsLoaded || animationCompletedRef.current) return;
      const el = ref.current;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        animationCompletedRef.current = true;
        onCompleteRef.current?.();
        return;
      }

      if (el._rbsplitInstance) {
        try {
          el._rbsplitInstance.revert();
        } catch {
          // The original text is already restored.
        }
        el._rbsplitInstance = null;
      }

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? Number.parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || "px" : "px";
      const sign =
        marginValue === 0
          ? ""
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;
      let targets: Element[] = [];

      const assignTargets = (instance: GsapSplitTextInstance) => {
        if (splitType.includes("chars") && instance.chars.length) targets = instance.chars;
        if (!targets.length && splitType.includes("words") && instance.words.length) {
          targets = instance.words;
        }
        if (!targets.length && splitType.includes("lines") && instance.lines.length) {
          targets = instance.lines;
        }
        if (!targets.length) {
          targets = instance.chars.length
            ? instance.chars
            : instance.words.length
              ? instance.words
              : instance.lines;
        }
      };

      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === "lines",
        linesClass: "split-line",
        wordsClass: "split-word",
        charsClass: "split-char",
        reduceWhiteSpace: false,
        onSplit: (instance) => {
          assignTargets(instance);
          gsap.fromTo(
            targets,
            { ...fromRef.current },
            {
              ...toRef.current,
              duration,
              ease,
              stagger: delay / 1000,
              scrollTrigger: {
                trigger: el,
                start,
                once: true,
                fastScrollEnd: true,
                anticipatePin: 0.4,
              },
              onComplete: () => {
                animationCompletedRef.current = true;
                onCompleteRef.current?.();
              },
              willChange: "transform, opacity",
              force3D: true,
            },
          );
        },
      });

      el._rbsplitInstance = splitInstance;

      return () => {
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.trigger === el) trigger.kill();
        });
        try {
          splitInstance.revert();
        } catch {
          // The original text is already restored.
        }
        el._rbsplitInstance = null;
      };
    },
    [
      gsapModules,
      text,
      delay,
      duration,
      ease,
      splitType,
      fromKey,
      toKey,
      threshold,
      rootMargin,
      fontsLoaded,
    ],
  );

  const style: CSSProperties = {
    textAlign,
    overflow: "hidden",
    display: "inline-block",
    whiteSpace: "normal",
    overflowWrap: "break-word",
    willChange: "transform, opacity",
  };
  const classes = `split-parent ${className}`.trim();
  const Tag = tag as ElementType;

  return (
    <Tag id={id} ref={ref} style={style} className={classes}>
      {text}
    </Tag>
  );
}
