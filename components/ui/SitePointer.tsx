"use client";

import { useEffect, useRef } from "react";

/*
 * Resolved in this order against the element under the pointer, so the first
 * match wins: a label inside a button is interactive, not reading copy.
 */
const HIDDEN_SELECTOR = "[data-pointer='hidden']";
const INTERACTIVE_SELECTOR =
  "a[href], button, [role='button'], summary, label[for], input, select, textarea, [tabindex]:not([tabindex='-1'])";
/* Reading copy only. The display headings are objects on this site, not text
   someone means to select, and an I-beam over a 126px word reads as an error. */
const TEXT_SELECTOR = "p, li, dd, dt, blockquote, figcaption, address";

type PointerState = "idle" | "interactive" | "text" | "hidden";

const resolveState = (element: Element | null): PointerState => {
  if (!element) return "hidden";
  if (element.closest(HIDDEN_SELECTOR)) return "hidden";
  if (element.closest(INTERACTIVE_SELECTOR)) return "interactive";
  if (element.closest(TEXT_SELECTOR)) return "text";
  return "idle";
};

/*
 * The site's own pointer: a focus reticle. The hero is a scrubbed frame
 * sequence that says "scroll to focus / 195 frames", the buttons draw their
 * glyphs out of a dot grid, and the About portrait already swaps the pointer
 * for a lens. This carries the same camera language across everything else —
 * a hard brand dot for precision, a ring trailing it for the eye to follow,
 * and a viewfinder frame that snaps open over anything you can act on.
 */
export function SitePointer() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    /*
     * Coarse pointers get nothing: there is no hover to track, and hiding the
     * native cursor on a device that has none would be a no-op at best.
     */
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const dot = root.querySelector<HTMLElement>(".site-pointer-dot");
    const follow = root.querySelector<HTMLElement>(".site-pointer-follow");
    if (!dot || !follow) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    /*
     * `cursor: none` is set from here, never in the stylesheet. If this effect
     * never runs — JS disabled, hydration failure, an old browser — the native
     * cursor stays exactly where it was instead of the page losing its pointer
     * altogether.
     */
    const documentElement = document.documentElement;
    documentElement.setAttribute("data-site-pointer", "on");

    const point = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const trail = { x: point.x, y: point.y };
    let frame = 0;
    let state: PointerState = "idle";
    let visible = false;

    const draw = () => {
      const ease = reduced.matches ? 1 : 0.18;
      trail.x += (point.x - trail.x) * ease;
      trail.y += (point.y - trail.y) * ease;

      dot.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%)`;
      follow.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0) translate(-50%, -50%)`;

      /*
       * The loop parks itself once the ring catches up. A cursor is idle far
       * more often than it moves, and this page already gives its frame budget
       * to two canvas sequences and a scrub timeline.
       */
      if (Math.abs(point.x - trail.x) < 0.1 && Math.abs(point.y - trail.y) < 0.1) {
        trail.x = point.x;
        trail.y = point.y;
        frame = 0;
        return;
      }
      frame = window.requestAnimationFrame(draw);
    };

    const start = () => {
      if (!frame) frame = window.requestAnimationFrame(draw);
    };

    const applyState = (next: PointerState) => {
      if (next === state) return;
      state = next;
      root.dataset.state = next;
    };

    const show = () => {
      if (visible) return;
      visible = true;
      root.dataset.visible = "true";
    };

    const onMove = (event: PointerEvent) => {
      point.x = event.clientX;
      point.y = event.clientY;
      if (!visible) {
        /* Land the ring on the pointer the first time rather than flying it in
           from the middle of the screen. */
        trail.x = point.x;
        trail.y = point.y;
        show();
      }
      applyState(resolveState(event.target as Element | null));
      start();
    };

    /*
     * Content moves under a stationary pointer on every scroll of this page, so
     * the state has to be re-read from the position rather than only from the
     * last move. Throttled hard: `elementFromPoint` costs a hit test, and this
     * only needs to keep up with the eye.
     */
    let scrollCheck = 0;
    const onScroll = () => {
      if (!visible || scrollCheck) return;
      scrollCheck = window.setTimeout(() => {
        scrollCheck = 0;
        applyState(resolveState(document.elementFromPoint(point.x, point.y)));
      }, 120);
    };

    const onDown = () => root.setAttribute("data-pressed", "true");
    const onUp = () => root.removeAttribute("data-pressed");

    const hide = () => {
      visible = false;
      delete root.dataset.visible;
      onUp();
    };

    /* `relatedTarget: null` on a document-level `mouseout` is the pointer
       actually leaving the window, not crossing between elements inside it. */
    const onOut = (event: MouseEvent) => {
      if (!event.relatedTarget) hide();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("blur", hide);
    document.addEventListener("mouseout", onOut);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", hide);
      document.removeEventListener("mouseout", onOut);
      if (frame) window.cancelAnimationFrame(frame);
      if (scrollCheck) window.clearTimeout(scrollCheck);
      documentElement.removeAttribute("data-site-pointer");
    };
  }, []);

  return (
    <div ref={rootRef} className="site-pointer" data-state="idle" aria-hidden="true">
      <span className="site-pointer-follow">
        <span className="site-pointer-ring" />
        <span className="site-pointer-frame">
          <i />
          <i />
          <i />
          <i />
        </span>
      </span>
      <span className="site-pointer-dot" />
    </div>
  );
}

export default SitePointer;
