import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/pwa/pwa-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SBBN",
  description: "Small Business Buyers Network",
  manifest: "/manifest.webmanifest",
  themeColor: "#0b0b0f",
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var key = "theme";
    var stored = localStorage.getItem(key);
    var theme = (stored === "light" || stored === "dark") ? stored : null;
    if (!theme) {
      var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      theme = prefersDark ? "dark" : "light";
    }
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-dvh bg-background text-foreground  antialiased`}>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}