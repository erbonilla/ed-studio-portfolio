"use client";

import { useEffect, useState } from "react";

type GsapClientModules = {
  gsap: typeof import("gsap").gsap;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
  SplitText: typeof import("gsap/SplitText").SplitText;
};

let modulesPromise: Promise<GsapClientModules> | undefined;

function loadGsapClientModules() {
  modulesPromise ??= Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
    import("gsap/SplitText"),
  ]).then(([gsapModule, scrollTriggerModule, splitTextModule]) => ({
    gsap: gsapModule.gsap,
    ScrollTrigger: scrollTriggerModule.ScrollTrigger,
    SplitText: splitTextModule.SplitText,
  }));

  return modulesPromise;
}

export function useGsapClient() {
  const [modules, setModules] = useState<GsapClientModules | null>(null);

  useEffect(() => {
    let active = true;

    void loadGsapClientModules().then((loadedModules) => {
      if (active) setModules(loadedModules);
    });

    return () => {
      active = false;
    };
  }, []);

  return modules;
}
