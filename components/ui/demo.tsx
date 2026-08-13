import { Button04 } from "@/components/ui/animated-arrow-button";

export default function DemoOne() {
  return <Button04 href="#" text="Read case study" />;
}

export function Button04Variations() {
  return (
    <div
      aria-label="Animated arrow button variations"
      style={{
        display: "grid",
        gap: 24,
        padding: 32,
        background: "#f2efe8",
      }}
    >
      <Button04 href="#" text="Brand action" variant="brand" size="small" />
      <Button04 href="#" text="Light action" variant="light" />
      <Button04 href="#" text="Dark action" variant="dark" />
      <div style={{ padding: 24, background: "#050505" }}>
        <Button04
          href="#"
          text="Light outline"
          variant="outline-light"
          size="large"
        />
      </div>
      <Button04
        href="#"
        text="Dark outline"
        compactText="Outline"
        variant="outline-dark"
        fullWidth
      />
      <Button04 text="Button behavior" variant="brand" />
      <Button04 text="Disabled action" variant="dark" disabled />
    </div>
  );
}
