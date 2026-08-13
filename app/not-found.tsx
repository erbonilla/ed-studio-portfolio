import type { Metadata } from "next";
import { Button04 } from "@/components/ui/animated-arrow-button";
import styles from "./system-page.module.css";

export const metadata: Metadata = {
  title: "Not found — Edgar Bonilla G.",
  description: "That address does not match anything on this site.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <p className={styles.topline}>
          <span className={styles.code}>404</span>
          <span>Address not found</span>
        </p>
        <span className={styles.seam} aria-hidden="true" />

        <h1 className={styles.heading}>
          <span>Nothing</span>
          <span>in focus here.</span>
        </h1>

        {/* Names what went wrong and where the visitor actually needs to go.
            The site is a single route, so "try another page" would be a lie. */}
        <p className={styles.body}>
          That address does not match anything on this site. The portfolio is a
          single page — the work, the background, and the contact details all
          live there.
        </p>

        <div className={styles.actions}>
          <Button04
            href="/"
            text="Back to the portfolio"
            compactText="Back to start"
            variant="brand"
            size="medium"
          />
          <Button04
            href="/#work"
            text="Go to selected work"
            compactText="Selected work"
            variant="outline-light"
            size="medium"
          />
        </div>

        <p className={styles.meta}>
          <span>Edgar Bonilla G. — UI/UX Designer</span>
          <span>Zarcero, Costa Rica · Remote worldwide</span>
          <a href="mailto:erbonilla@outlook.com">erbonilla@outlook.com</a>
        </p>
      </div>
    </main>
  );
}
