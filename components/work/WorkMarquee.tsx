import styles from "./WorkMarquee.module.css";

const marqueeItems = [
  "Work",
  "Case",
  "Studies",
  "Atlan",
  "Adapt when plans change",
  "Osteóplus",
  "Make the next safe action clear",
] as const;

function MarqueeGroup({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className={styles.group} aria-hidden="true">
      {marqueeItems.map((item) => (
        <span className={styles.item} key={`${duplicate ? "duplicate" : "primary"}-${item}`}>
          {item}
          <i>—</i>
        </span>
      ))}
    </div>
  );
}

export function WorkMarquee() {
  return (
    /*
     * A named <section> becomes a landmark, so this band was listing itself in
     * the landmark menu under a whole two-sentence name. Everything it says —
     * both project names and both taglines — is stated properly in the Work
     * chapter immediately below, so it leaves the accessibility tree entirely
     * and stays what it looks like: a kinetic seam between two registers.
     */
    <section className={styles.marquee} data-nav-theme="light" aria-hidden="true">
      <div className={styles.meta} aria-hidden="true">
        <span>Next / Selected work</span>
        <span>02 case studies</span>
      </div>

      <div className={styles.viewport}>
        <div className={styles.track}>
          <MarqueeGroup />
          <MarqueeGroup duplicate />
        </div>
      </div>
    </section>
  );
}
