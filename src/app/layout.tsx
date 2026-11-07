import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClipPilot — Video Clipping & Multi-Channel Studio",
  description: "Personal video clipping and social media management dashboard for YouTube Shorts, Instagram Reels, and TikTok.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ClipPilot",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="h-full bg-[#090c15] text-slate-100 antialiased selection:bg-violet-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
