"use client";

import { useEffect } from "react";
import { Button04 } from "@/components/ui/animated-arrow-button";
import styles from "./system-page.module.css";

/*
 * The page is one route carrying a WebGL scene, a 195-frame canvas sequence,
 * two Canvas 2D reveals, and a GSAP/Lenis scroll rig. Any one of those failing
 * at runtime used to take the whole document with it and leave a blank
 * near-black screen with no way out. This boundary keeps the visitor inside
 * the site and keeps the two things they came for — the work and the contact
 * address — reachable without JavaScript recovering first.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The scroll rig locks the document while the intro and menu are open. If
    // the crash happened mid-transition those locks survive the unmount, so
    // release them before the visitor tries to scroll this page.
    document.documentElement.classList.remove("is-loading", "menu-open");
    console.error(error);
  }, [error]);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <p className={styles.topline}>
          <span className={styles.code}>Error</span>
          <span>This page stopped early</span>
        </p>
        <span className={styles.seam} aria-hidden="true" />

        <h1 className={styles.heading}>
          <span>Something</span>
          <span>lost focus.</span>
        </h1>

        <p className={styles.body}>
          Part of this page failed while it was loading, so the rest of it
          stopped too. Reloading clears it most of the time. If it keeps
          happening, the case studies are hosted separately and open fine on
          their own — and email always works.
        </p>

        {error.digest ? (
          <p className={styles.digest}>
            <b>Reference</b>
            {error.digest}
          </p>
        ) : null}

        <div className={styles.actions}>
          <Button04
            text="Reload the page"
            compactText="Reload"
            variant="brand"
            size="medium"
            onClick={() => reset()}
          />
          {/* The body says these are hosted separately; the links themselves
              should say they leave this tab. */}
          <Button04
            href="https://atlan-case-study-v2.vercel.app/Atlan%20Case%20Study.html"
            text="Atlan case study"
            compactText="Atlan"
            aria-label="Atlan case study (opens in a new tab)"
            variant="outline-light"
            size="medium"
            target="_blank"
            rel="noreferrer"
          />
          <Button04
            href="https://osteoplus-case-study-v2.vercel.app/"
            text="Osteóplus case study"
            compactText="Osteóplus"
            aria-label="Osteóplus case study (opens in a new tab)"
            variant="outline-light"
            size="medium"
            target="_blank"
            rel="noreferrer"
          />
        </div>

        <p className={styles.meta}>
          <span>Edgar Bonilla G. — UI/UX Designer</span>
          <a href="mailto:erbonilla@outlook.com">erbonilla@outlook.com</a>
          <a
            href="/assets/resume/edgar-bonilla-resume-en.pdf"
            download="Edgar-Bonilla-Resume-EN.pdf"
          >
            Résumé (EN, PDF)
          </a>
        </p>
      </div>
    </main>
  );
}
