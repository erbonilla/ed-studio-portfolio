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
    <section
      className={styles.marquee}
      aria-label="Selected work case studies: Atlan adapts when plans change. Osteóplus makes the next safe action clear."
    >
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
