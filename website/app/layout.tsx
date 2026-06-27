import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import {
  GeistPixelSquare,
  GeistPixelGrid,
  GeistPixelCircle,
  GeistPixelTriangle,
  GeistPixelLine
} from "geist/font/pixel";

import { Analytics } from "@vercel/analytics/next";

import { HomeLink } from "@/components/home-link";
import { RouteAwareSiteFooter } from "@/components/route-aware-site-footer";
import { SiteMarkIcon } from "@/components/site-mark-icon";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

const siteUrl =
  typeof process.env.NEXT_PUBLIC_SITE_URL === "string" && process.env.NEXT_PUBLIC_SITE_URL.length > 0
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined;

const defaultTitle = "loginwithchatgpt";
const siteDescription =
  "A drop-in Login with ChatGPT button. Let your users power your app's AI with their own ChatGPT subscription — no API key, no usage bill.";

const fontVariables = [
  GeistSans.variable,
  GeistMono.variable,
  GeistPixelSquare.variable,
  GeistPixelGrid.variable,
  GeistPixelCircle.variable,
  GeistPixelTriangle.variable,
  GeistPixelLine.variable
].join(" ");

const themeInitScript = `(() => {
  try {
    const key = "lwc-theme";
    const stored = localStorage.getItem(key);
    const theme = stored === "light" || stored === "dark" ? stored : "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.style.colorScheme = "dark";
  }
})();`;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: siteUrl } : {}),
  applicationName: defaultTitle,
  title: {
    default: `${defaultTitle} — Login with ChatGPT`,
    template: "%s · loginwithchatgpt"
  },
  description: siteDescription,
  keywords: [
    "login with chatgpt",
    "chatgpt",
    "openai",
    "codex",
    "oauth",
    "pkce",
    "react",
    "nextjs",
    "authentication",
    "ai"
  ],
  category: "technology",
  robots: { index: true, follow: true },
  alternates: siteUrl ? { canonical: "/" } : undefined,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: defaultTitle,
    title: defaultTitle,
    description: siteDescription,
    ...(siteUrl ? { url: new URL("/", siteUrl).href } : {})
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: siteDescription
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="dark" style={{ colorScheme: "dark" }}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${GeistPixelCircle.className} ${fontVariables} flex min-h-dvh flex-col font-medium antialiased`}
      >
        <Link
          href="/"
          aria-label="Home"
          className="fixed left-4 top-4 z-20 inline-flex items-center justify-center rounded-[10px] bg-surface p-0.5 transition-transform duration-200 ease focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5"
        >
          <SiteMarkIcon className="relative z-10 size-8.5 shrink-0 select-none pointer-events-none" />
        </Link>
        <div className="fixed right-4 top-4 z-20 flex items-center gap-2">
          <HomeLink />
          <ThemeToggle />
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <RouteAwareSiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
