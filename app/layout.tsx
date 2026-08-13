import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { SitePointer } from "@/components/ui/SitePointer";
import "lenis/dist/lenis.css";
import "./globals.css";
// Inlined rather than linked: a <noscript> stylesheet has to be present in the
// first response, and there is no request to spend on it.
import { NO_SCRIPT_STYLES } from "./no-script-styles";

/*
 * The page has one register and it is near-black. Declaring it stops mobile
 * browser chrome and the pre-paint canvas from flashing white before the ink
 * ground arrives — the intro is meant to open out of darkness, not out of a
 * white frame. `maximum-scale` is deliberately absent: pinch-zoom stays.
 *
 * `viewport-fit` is not set on purpose. The default keeps content inside the
 * safe area on notched phones; `cover` would only be correct alongside
 * `env(safe-area-inset-*)` padding on the fixed header and the hero rails,
 * which this layout does not use.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505",
  colorScheme: "dark",
};


export async function generateMetadata(): Promise<Metadata> {
  const incomingHeaders = await headers();
  const host = incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host");
  const protocol =
    incomingHeaders.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host ?? "localhost:3000"}`);
  const description =
    "Selected product design work by Edgar Bonilla across health, wellness, fitness, and endurance.";

  return {
    metadataBase,
    title: "Edgar Bonilla G. — UI/UX Designer",
    description,
    icons: {
      icon: "/assets/brand/ed-favicon.svg",
    },
    openGraph: {
      type: "website",
      title: "Edgar Bonilla G. — Selected Work",
      description,
      images: [
        {
          url: new URL("/og.png", metadataBase).toString(),
          width: 1200,
          height: 630,
          alt: "Selected work by Edgar Bonilla: real constraints, clear experiences.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Edgar Bonilla G. — Selected Work",
      description,
      images: [new URL("/og.png", metadataBase).toString()],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: NO_SCRIPT_STYLES }} />
        </noscript>
        {children}
        {/* Last in the body so it paints over everything, including the menu
            overlay and the skip link. It renders nothing on coarse pointers. */}
        <SitePointer />
      </body>
    </html>
  );
}
