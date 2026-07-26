import type { Metadata } from "next";
import { headers } from "next/headers";
import "lenis/dist/lenis.css";
import "./globals.css";

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
    title: "Edgar Bonilla G. — Senior UI/UX Designer",
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
      <body>{children}</body>
    </html>
  );
}
