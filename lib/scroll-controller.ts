/**
 * Lenis owns scroll interpolation for the page, but it is created inside the
 * hero. Navigation lives in a sibling component and must not fall back to
 * native `scrollIntoView`: running both smooth-scroll systems at once fights
 * Lenis and produces the ~10,500px drift the critique found.
 *
 * The hero registers its instance here on mount and clears it on teardown;
 * everything else asks for a scroll through `scrollToSection`.
 */

type ScrollController = {
  scrollTo: (target: HTMLElement, options?: { offset?: number }) => void;
};

let controller: ScrollController | null = null;

export function setScrollController(next: ScrollController | null) {
  controller = next;
}

export function scrollToSection(destination: HTMLElement) {
  if (controller) {
    controller.scrollTo(destination, { offset: 0 });
    return;
  }

  // Reduced motion, or before the hero has mounted: native is correct here.
  destination.scrollIntoView({ behavior: "smooth", block: "start" });
}
