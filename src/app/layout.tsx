import type { Metadata, Viewport } from "next";
import { RegisterServiceWorker } from "@/components/register-sw";
import { ThemeProvider } from "@/components/theme-provider";
import { getConfig } from "@/lib/config";
import { themeInitScript } from "@/lib/theme-script";
import "./globals.css";

const config = getConfig();

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: `${config.site.name} Status`,
  description:
    config.site.tagline ??
    "Live status and uptime for Altify apps and services.",
  applicationName: config.site.name,
  manifest: `${base}/manifest.webmanifest`,
  icons: {
    icon: [
      { url: `${base}/icon.svg`, type: "image/svg+xml" },
      { url: `${base}/icon-192.png`, sizes: "192x192", type: "image/png" },
    ],
    apple: `${base}/apple-touch-icon.png`,
  },
  appleWebApp: {
    capable: true,
    title: config.site.name,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#05070d" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:border focus:border-signal/40 focus:bg-abyss focus:px-3 focus:py-2 focus:text-sm focus:text-signal"
        >
          Skip to content
        </a>

        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="grid-field grid-mask animate-drift absolute inset-0" />
          <div className="ambient-signal absolute -top-40 left-1/2 h-[36rem] w-[64rem] -translate-x-1/2 rounded-full blur-[120px]" />
          <div className="ambient-up absolute bottom-0 right-0 h-[28rem] w-[28rem] translate-x-1/3 translate-y-1/3 rounded-full blur-[120px]" />
        </div>

        <ThemeProvider>
          {children}
        </ThemeProvider>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
