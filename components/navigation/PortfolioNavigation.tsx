"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useGsapClient } from "@/lib/use-gsap-client";
import { scrollToSection } from "@/lib/scroll-controller";
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
    frame: "/assets/work/atlan/swimmer.webp",
    available: true,
  },
  {
    id: "contact",
    label: "Contact",
    // Describes what the section holds. It used to borrow the email button's
    // label, so one phrase named both a destination and a different action.
    descriptor: "Availability, résumé, email",
    frame: "/assets/hero/frames/frame-195.jpg",
    available: true,
  },
];

const socialLinks = [
  {
    label: "Instagram — @coacherbonilla",
    href: "https://www.instagram.com/coacherbonilla/",
    platform: "instagram",
    glyph: "",
  },
  {
    label: "LinkedIn — Edgar Bonilla G.",
    href: "https://www.linkedin.com/in/edgarbonillag/",
    platform: "linkedin",
    glyph: "in",
  },
  {
    label: "Facebook — Oxígeno Zarcero",
    href: "https://www.facebook.com/oxygenozar",
    platform: "facebook",
    glyph: "f",
  },
  {
    label: "X — @erbonilla",
    href: "https://x.com/erbonilla",
    platform: "x",
    glyph: "X",
  },
] as const;

const NAVIGATION_EVENT = "portfolio:navigate";

export function PortfolioNavigation() {
  const gsapModules = useGsapClient();
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  // `previewId` follows hover and focus inside the menu and only drives the
  // preview thumbnail. `currentId` follows the actual scroll position and is
  // the only thing allowed to set aria-current — hovering a link does not
  // change which section the visitor is on.
  const [previewId, setPreviewId] = useState<NavigationId>("home");
  const [currentId, setCurrentId] = useState<NavigationId>("home");
  const [navTheme, setNavTheme] = useState<"dark" | "light">("dark");
  const restoreMenuFocusRef = useRef(false);

  const activeItem =
    navigationItems.find((item) => item.id === previewId) ?? navigationItems[0];

  const openMenu = (id: NavigationId = "home") => {
    restoreMenuFocusRef.current = false;
    setPreviewId(id);
    setIsOpen(true);
  };

  const closeMenu = () => {
    restoreMenuFocusRef.current = true;
    setIsOpen(false);
  };

  const visit = (id: NavigationId) => {
    const destination = document.getElementById(id);
    setPreviewId(id);

    if (!destination) return;

    // Unlock scroll immediately. Waiting on the close timeline added a 360ms
    // seam between the click and motion; the sheet can still animate out
    // while Lenis moves the page underneath.
    restoreMenuFocusRef.current = false;
    document.documentElement.classList.remove("menu-open");
    setIsOpen(false);
    scrollToSection(destination);
    // Write the hash so the section is linkable and browser-back works,
    // without triggering a second native jump.
    if (window.location.hash !== `#${id}`) {
      window.history.pushState(null, "", `#${id}`);
    }
  };

  // The header sits over five chapters in two registers. Its frost fill is
  // tuned for near-black, so over the orange marquee, the orange About
  // portrait, and the cream Work chapter the wordmark and CTA vanish. Any
  // element marked data-nav-theme="light" flips the bar while it is under
  // the header band.
  useEffect(() => {
    const marked = Array.from(
      document.querySelectorAll<HTMLElement>("[data-nav-theme='light']"),
    );
    if (marked.length === 0) return;

    const header = document.querySelector<HTMLElement>(".hero-nav");

    const resolve = () => {
      // Sample at the vertical middle of the bar, so the swap happens as the
      // chapter edge passes under it rather than before or after.
      const band = (header?.getBoundingClientRect().height ?? 82) * 0.6;
      const overLight = marked.some((element) => {
        const rect = element.getBoundingClientRect();
        return rect.top <= band && rect.bottom >= band;
      });
      setNavTheme(overLight ? "light" : "dark");
    };

    resolve();
    window.addEventListener("scroll", resolve, { passive: true });
    window.addEventListener("resize", resolve);
    return () => {
      window.removeEventListener("scroll", resolve);
      window.removeEventListener("resize", resolve);
    };
  }, []);

  // Scroll position, not hover, decides which section is current.
  useEffect(() => {
    const sections = navigationItems
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (sections.length === 0) return;

    const resolve = () => {
      const marker = window.innerHeight * 0.35;
      let next = sections[0];
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= marker) next = section;
      }
      setCurrentId(next.id as NavigationId);
    };

    resolve();
    window.addEventListener("scroll", resolve, { passive: true });
    window.addEventListener("resize", resolve);
    return () => {
      window.removeEventListener("scroll", resolve);
      window.removeEventListener("resize", resolve);
    };
  }, []);

  useEffect(() => {
    const onNavigationRequest = (event: Event) => {
      const request = event as CustomEvent<{ id?: NavigationId }>;
      const id = request.detail?.id;
      if (!id || !navigationItems.some((item) => item.id === id)) return;

      const destination = document.getElementById(id);
      if (destination) {
        scrollToSection(destination);
        if (window.location.hash !== `#${id}`) {
          window.history.pushState(null, "", `#${id}`);
        }
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

      const closedClip = "inset(0 0 100% 0 round 0 0 32px 32px)";
      const openClip = "inset(0 0 0% 0 round 0 0 32px 32px)";
      const clip = String(gsap.getProperty(overlay, "clipPath") || "");
      const visibility = String(gsap.getProperty(overlay, "visibility") || "");
      const startsClosed =
        visibility === "hidden" || clip.includes("100%") || clip === "none" || clip === "";

      /*
       * Animate from the live presentation value. fromTo() re-armed every open
       * at the fully-closed clip, so grabbing a closing sheet and reopening
       * jumped shut before sliding open again.
       */
      if (startsClosed) {
        gsap.set(overlay, {
          visibility: "visible",
          pointerEvents: "auto",
          clipPath: closedClip,
        });
        gsap.set(closeLines, {
          rotation: 0,
          y: (index: number) => (index === 0 ? -4 : 4),
        });
        gsap.set(links, { autoAlpha: 0, y: 42 });
        gsap.set(details, { autoAlpha: 0, y: 20 });
      } else {
        gsap.set(overlay, { visibility: "visible", pointerEvents: "auto" });
      }

      const timeline = gsap.timeline({
        defaults: { ease: "power4.inOut" },
        onComplete: () => closeButtonRef.current?.focus(),
      });

      timeline
        .to(overlay, {
          clipPath: openClip,
          duration: reducedMotion ? 0.01 : 0.82,
        })
        .to(
          closeLines,
          {
            rotation: (index: number) => (index === 0 ? 45 : -45),
            y: 0,
            duration: reducedMotion ? 0.01 : 0.42,
            ease: "power3.inOut",
          },
          reducedMotion ? 0 : 0.16,
        )
        .to(
          links,
          {
            autoAlpha: 1,
            y: 0,
            duration: reducedMotion ? 0.01 : 0.62,
            stagger: reducedMotion ? 0 : 0.055,
            ease: "power3.out",
          },
          reducedMotion ? 0 : 0.28,
        )
        .to(
          details,
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
        if (restoreMenuFocusRef.current) {
          restoreMenuFocusRef.current = false;
          menuButtonRef.current?.focus();
        }
      },
    });

    timeline
      .to(
        closeLines,
        {
          rotation: 0,
          y: (index: number) => (index === 0 ? -4 : 4),
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
        closeMenu();
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
      <a className="skip-link" href="#work">
        Skip to selected work
      </a>

      <header
        className="hero-nav site-navigation"
        data-theme={navTheme}
        aria-label="Primary navigation"
      >
        <button
          className="nav-brand-button"
          type="button"
          onClick={() => visit("home")}
          aria-label="Edgar Bonilla G. — back to top"
        >
          <Image
            className="hero-wordmark"
            src={
              navTheme === "light"
                ? "/assets/brand/ed-studio-wordmark-ink.svg"
                : "/assets/brand/ed-studio-wordmark.svg"
            }
            width="147"
            height="28"
            alt=""
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
          onClick={() => openMenu(currentId)}
        >
          <span>Menu</span>
          <span className="nav-menu-icon" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>

        {/* Goes to Contact. It used to open the menu, which meant the loudest
            control on the page did not do what it said. Labelled distinctly so
            it can never collide with the Contact section's own button. */}
        <Button04
          className="nav-collaboration-cta"
          href="#contact"
          text="Get in touch"
          compactText="Contact"
          variant="brand"
          size="small"
          onClick={(event) => {
            event.preventDefault();
            visit("contact");
          }}
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
              closeMenu();
            }}
          >
            <span>Close</span>
            <span className="menu-close-icon" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>

          {/* Same words as the header control, because it is the same action:
              go to Contact. "Let's work together" also read as a freelance
              pitch, which is not what this page is for. "Start a conversation"
              now belongs only to the button that actually opens an email. */}
          <Button04
            className="menu-collaboration-cta"
            text="Get in touch"
            compactText="Contact"
            variant="brand"
            size="small"
            onClick={() => visit("contact")}
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
                    data-active={previewId === item.id}
                    aria-current={currentId === item.id ? "page" : undefined}
                    onPointerEnter={() => setPreviewId(item.id)}
                    onFocus={() => setPreviewId(item.id)}
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
              <div className="menu-meta-socials" role="group" aria-label="Social profiles">
                {socialLinks.map((social) => (
                  <a
                    key={social.platform}
                    className="menu-social-link"
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${social.label} (opens in a new tab)`}
                    title={social.label}
                  >
                    <span
                      className="menu-social-icon"
                      data-platform={social.platform}
                      aria-hidden="true"
                    >
                      {social.glyph}
                    </span>
                  </a>
                ))}
              </div>
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
              {/* This line used to announce that a résumé existed and then give
                  no way to get it — the download sat at the bottom of Contact,
                  past the whole scroll sequence. From the menu it is now one
                  click from anywhere on the page. */}
              <p className="menu-meta-resume">
                <span aria-hidden="true" />
                {/* The label and both links wrap as one group, so a narrow meta
                    column breaks the line under the label rather than orphaning
                    a single language against the marker. */}
                <span className="menu-meta-resume-body">
                  <span className="menu-meta-resume-label">Résumé</span>
                  <a
                    href="/assets/resume/edgar-bonilla-resume-en.pdf"
                    download="Edgar-Bonilla-Resume-EN.pdf"
                  >
                    English<span className="sr-only"> (PDF)</span>
                  </a>
                  <i aria-hidden="true">·</i>
                  <a
                    href="/assets/resume/edgar-bonilla-resume-es.pdf"
                    download="Edgar-Bonilla-Resume-ES.pdf"
                    lang="es"
                    hrefLang="es"
                  >
                    Español<span className="sr-only"> (PDF)</span>
                  </a>
                </span>
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
                sizes="(max-width: 56.25em) 100vw, 38vw"
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
