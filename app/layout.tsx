
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "./providers"; // Import the new client component
import "./globals.css";

// Proper Metadata API usage
export const metadata: Metadata = {
  title: "Vynsec Nexus",
  description: "Complaint Management System",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vynsec Nexus",
  },
  other: {
    "mobile-web-app-capable": "yes"
  },
  icons: {
    apple: "/android-chrome-192x192.png",
    icon: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased flex flex-col h-full`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
