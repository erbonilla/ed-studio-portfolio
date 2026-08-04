"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useGsapClient } from "@/lib/use-gsap-client";
import { Button04 } from "@/components/ui/animated-arrow-button";

type NavigationId = "home" | "about" | "work" | "contact";

type NavigationItem = {
  id: NavigationId;
  label: string;
  descriptor: string;
  frame: string;
  available: boolean;
};

const navigationItems: NavigationItem[] = [
  {
    id: "home",
    label: "Home",
    descriptor: "Landing / motion study",
    frame: "/assets/hero/frames/frame-001.jpg",
    available: true,
  },
  {
    id: "about",
    label: "About",
    descriptor: "Profile / expertise",
    frame: "/assets/hero/frames/frame-097.jpg",
    available: true,
  },
  {
    id: "work",
    label: "Work",
    descriptor: "Selected case studies",
    frame: "/assets/work/atlan/swimmer.jpg",
    available: true,
  },
  {
    id: "contact",
    label: "Contact",
    descriptor: "Start a conversation",
    frame: "/assets/hero/frames/frame-195.jpg",
    available: true,
  },
];

const NAVIGATION_EVENT = "portfolio:navigate";

export function PortfolioNavigation() {
  const gsapModules = useGsapClient();
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<NavigationId>("home");

  const activeItem =
    navigationItems.find((item) => item.id === activeId) ?? navigationItems[0];

  const openMenu = (id: NavigationId = "home") => {
    setActiveId(id);
    setIsOpen(true);
  };

  const visit = (id: NavigationId) => {
    const destination = document.getElementById(id);
    setActiveId(id);

    if (!destination) return;

    setIsOpen(false);
    window.setTimeout(() => {
      destination.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 360);
  };

  useEffect(() => {
    const onNavigationRequest = (event: Event) => {
      const request = event as CustomEvent<{ id?: NavigationId }>;
      const id = request.detail?.id;
      if (!id || !navigationItems.some((item) => item.id === id)) return;

      const destination = document.getElementById(id);
      if (destination) {
        destination.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      openMenu(id);
    };

    window.addEventListener(NAVIGATION_EVENT, onNavigationRequest);
    return () => window.removeEventListener(NAVIGATION_EVENT, onNavigationRequest);
  }, []);

  useEffect(() => {
    const gsap = gsapModules?.gsap;
    if (!gsap) return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const page = document.documentElement;
    const links = overlay.querySelectorAll<HTMLElement>("[data-menu-link]");
    const details = overlay.querySelectorAll<HTMLElement>("[data-menu-detail]");
    const closeLines = overlay.querySelectorAll<HTMLElement>(".menu-close-icon i");

    if (isOpen) {
      page.classList.add("menu-open");
      overlay.setAttribute("aria-hidden", "false");

      const timeline = gsap.timeline({
        defaults: { ease: "power4.inOut" },
        onStart: () => {
          gsap.set(overlay, { visibility: "visible", pointerEvents: "auto" });
        },
        onComplete: () => closeButtonRef.current?.focus(),
      });

      timeline
        .fromTo(
          overlay,
          { clipPath: "inset(0 0 100% 0 round 0 0 32px 32px)" },
          {
            clipPath: "inset(0 0 0% 0 round 0 0 32px 32px)",
            duration: reducedMotion ? 0.01 : 0.82,
          },
        )
        .fromTo(
          closeLines,
          {
            rotation: 0,
            y: (index) => (index === 0 ? -4 : 4),
          },
          {
            rotation: (index) => (index === 0 ? 45 : -45),
            y: 0,
            duration: reducedMotion ? 0.01 : 0.42,
            ease: "power3.inOut",
          },
          reducedMotion ? 0 : 0.16,
        )
        .fromTo(
          links,
          { autoAlpha: 0, y: 42 },
          {
            autoAlpha: 1,
            y: 0,
            duration: reducedMotion ? 0.01 : 0.62,
            stagger: reducedMotion ? 0 : 0.055,
            ease: "power3.out",
          },
          reducedMotion ? 0 : 0.28,
        )
        .fromTo(
          details,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: reducedMotion ? 0.01 : 0.52,
            stagger: reducedMotion ? 0 : 0.06,
            ease: "power3.out",
          },
          reducedMotion ? 0 : 0.4,
        );

      return () => {
        timeline.kill();
      };
    }

    page.classList.remove("menu-open");
    overlay.setAttribute("aria-hidden", "true");

    const timeline = gsap.timeline({
      onComplete: () => {
        gsap.set(overlay, { visibility: "hidden", pointerEvents: "none" });
      },
    });

    timeline
      .to(
        closeLines,
        {
          rotation: 0,
          y: (index) => (index === 0 ? -4 : 4),
          duration: reducedMotion ? 0.01 : 0.28,
          ease: "power2.inOut",
        },
        0,
      )
      .to(
        overlay,
        {
          clipPath: "inset(0 0 100% 0 round 0 0 32px 32px)",
          duration: reducedMotion ? 0.01 : 0.52,
          ease: "power4.inOut",
        },
        0,
      );

    return () => {
      timeline.kill();
    };
  }, [gsapModules, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const overlay = overlayRef.current;
      if (!overlay) return;

      if (event.key === "Escape") {
        setIsOpen(false);
        window.setTimeout(() => menuButtonRef.current?.focus(), 360);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(
        overlay.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      <header className="hero-nav site-navigation" aria-label="Primary navigation">
        <button className="nav-brand-button" type="button" onClick={() => visit("home")}>
          <Image
            className="hero-wordmark"
            src="/assets/brand/ed-studio-wordmark.svg"
            width="147"
            height="28"
            alt="Ed Studio — home"
            priority
            unoptimized
          />
        </button>

        <button
          ref={menuButtonRef}
          className="nav-menu-trigger"
          type="button"
          aria-expanded={isOpen}
          aria-controls="portfolio-menu"
          onClick={() => openMenu(activeId)}
        >
          <span>Menu</span>
          <span className="nav-menu-icon" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>

        <Button04
          className="nav-collaboration-cta"
          text="Let's work together"
          compactText="Let's talk"
          variant="brand"
          size="small"
          onClick={() => openMenu("contact")}
        />
      </header>

      <div
        ref={overlayRef}
        id="portfolio-menu"
        className="portfolio-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden="true"
      >
        <div className="portfolio-menu-topbar">
          <Image
            className="menu-wordmark"
            src="/assets/brand/ed-studio-wordmark.svg"
            width="147"
            height="28"
            alt="Ed Studio"
            unoptimized
          />

          <button
            ref={closeButtonRef}
            className="menu-close"
            type="button"
            onClick={() => {
              setIsOpen(false);
              window.setTimeout(() => menuButtonRef.current?.focus(), 360);
            }}
          >
            <span>Close</span>
            <span className="menu-close-icon" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>

          <Button04
            className="menu-collaboration-cta"
            text="Let's work together"
            compactText="Let's talk"
            variant="brand"
            size="small"
            onClick={() => setActiveId("contact")}
          />
        </div>

        <div className="portfolio-menu-grid">
          <nav className="portfolio-menu-links" aria-label="Portfolio sections">
            <ol>
              {navigationItems.map((item, index) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    data-menu-link
                    data-active={activeId === item.id}
                    aria-current={activeId === item.id ? "page" : undefined}
                    onPointerEnter={() => setActiveId(item.id)}
                    onFocus={() => setActiveId(item.id)}
                    onClick={(event) => {
                      event.preventDefault();
                      visit(item.id);
                    }}
                  >
                    <span className="menu-link-marker" aria-hidden="true" />
                    <span className="menu-link-label">{item.label}</span>
                    <span className="menu-link-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <aside className="portfolio-menu-meta" data-menu-detail>
            <div>
              <p className="menu-meta-label">CONTACT</p>
              <p>erbonilla@outlook.com</p>
            </div>
            <div>
              <p className="menu-meta-label">ELSEWHERE</p>
              <p className="menu-meta-socials">
                <span>LinkedIn</span>
                <span>GitHub</span>
                <span>Instagram</span>
              </p>
            </div>
            <div>
              <p className="menu-meta-label">LOCATION</p>
              <p>Zarcero, Costa Rica</p>
              <p>Working globally — remote-ready</p>
            </div>
            <div className="menu-meta-signals">
              <p>
                <span aria-hidden="true" />
                OPEN TO ROLES WORLDWIDE
              </p>
              <p>
                <span aria-hidden="true" />
                RÉSUMÉ — ENGLISH · ESPAÑOL
              </p>
            </div>
          </aside>

          <figure className="portfolio-menu-preview" data-menu-detail>
            <div className="menu-preview-media">
              <Image
                key={activeItem.id}
                src={activeItem.frame}
                alt=""
                fill
                sizes="(max-width: 900px) 100vw, 38vw"
                loading="eager"
                unoptimized
              />
              <span className="menu-preview-scan" aria-hidden="true" />
              <span className="menu-preview-number" aria-hidden="true">
                {String(
                  navigationItems.findIndex((item) => item.id === activeItem.id) + 1,
                ).padStart(2, "0")}
              </span>
            </div>
            <figcaption>
              <span>{activeItem.label}</span>
              <span>
                {activeItem.descriptor}
                {!activeItem.available ? " · Preview only" : ""}
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </>
  );
}
