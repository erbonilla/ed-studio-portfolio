"use client";

/*
 * Last resort: a failure in the root layout itself. This replaces the whole
 * document, so it cannot assume globals.css, the self-hosted faces, or any
 * component loaded. Everything here is inline and system-font-based on
 * purpose — the one job is that the visitor never sees an unstyled stack
 * trace and always has the email address.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "grid",
          alignContent: "center",
          padding: "clamp(48px, 9vw, 120px) clamp(20px, 5vw, 56px)",
          color: "#ffffff",
          background: "#050505",
          fontFamily:
            "'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif",
        }}
      >
        <p
          style={{
            margin: "0 0 24px",
            color: "#ff4f18",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Error — this page stopped early
        </p>

        <h1
          style={{
            maxWidth: "14ch",
            margin: 0,
            fontSize: "clamp(38px, 8vw, 88px)",
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: "-0.05em",
            textTransform: "uppercase",
            overflowWrap: "anywhere",
          }}
        >
          Something lost focus.
        </h1>

        <p
          style={{
            width: "min(52ch, 100%)",
            margin: "28px 0 0",
            color: "rgba(255, 255, 255, 0.78)",
            fontSize: "17px",
            lineHeight: 1.55,
          }}
        >
          This portfolio failed to start. Reloading usually clears it. If it
          does not, write to me directly — I would rather hear about it than
          have you leave.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "14px",
            marginTop: "36px",
          }}
        >
          <button
            type="button"
            onClick={() => reset()}
            style={{
              minHeight: "48px",
              padding: "0 18px",
              border: 0,
              borderRadius: 0,
              color: "#050505",
              background: "#ff4f18",
              fontFamily: "inherit",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Reload the page
          </button>
          <a
            href="mailto:erbonilla@outlook.com"
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: "48px",
              padding: "0 18px",
              border: "1px solid rgba(255, 255, 255, 0.24)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.09em",
              textDecoration: "none",
              textTransform: "uppercase",
            }}
          >
            erbonilla@outlook.com
          </a>
        </div>

        {error.digest ? (
          <p
            style={{
              margin: "32px 0 0",
              color: "#a3a3a3",
              fontSize: "11px",
              letterSpacing: "0.06em",
            }}
          >
            Reference {error.digest}
          </p>
        ) : null}
      </body>
    </html>
  );
}
