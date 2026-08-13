"use client";

import { useEffect, useState } from "react";

type GsapClientModules = {
  gsap: typeof import("gsap").gsap;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
  SplitText: typeof import("gsap/SplitText").SplitText;
};

let modulesPromise: Promise<GsapClientModules | null> | undefined;

/*
 * The motion stack arrives as a separate chunk. That request fails in the
 * wild — an offline second visit, a corporate proxy, a stalled deploy — and an
 * unhandled rejection here would leave every animated surface waiting on a
 * promise that never settles. Resolving to `null` instead means each consumer
 * takes the same path it already takes before the chunk arrives, which is the
 * static composition, and the failure is logged once rather than thrown.
 */
function loadGsapClientModules() {
  modulesPromise ??= Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
    import("gsap/SplitText"),
  ])
    .then(([gsapModule, scrollTriggerModule, splitTextModule]) => ({
      gsap: gsapModule.gsap,
      ScrollTrigger: scrollTriggerModule.ScrollTrigger,
      SplitText: splitTextModule.SplitText,
    }))
    .catch((error: unknown) => {
      console.warn("Motion stack unavailable; falling back to static.", error);
      return null;
    });

  return modulesPromise;
}

export function useGsapClient() {
  const [modules, setModules] = useState<GsapClientModules | null>(null);

  useEffect(() => {
    let active = true;

    void loadGsapClientModules().then((loadedModules) => {
      if (active && loadedModules) setModules(loadedModules);
    });

    return () => {
      active = false;
    };
  }, []);

  return modules;
}
