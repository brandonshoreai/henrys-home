import type { Metadata, Viewport } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Mission Control — OpenClaw",
  description: "OpenClaw Gateway Dashboard",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mission Control",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#007AFF" />
      </head>
      <body>
        <Sidebar />
        <main className="md:ml-60 min-h-screen bg-white pb-24 md:pb-0">
          <div className="max-w-7xl mx-auto px-4 py-4 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
