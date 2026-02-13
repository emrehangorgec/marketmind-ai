import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { SettingsProvider } from "@/components/settings/SettingsContext";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { TermsAcceptanceModal } from "@/components/modals/TermsAcceptanceModal";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyMarketMind | Multi-Agent Investment Intelligence",
  description:
    "MarketMind orchestrates market data, technical and fundamental AI agents, sentiment, and risk for decisive investment calls.",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "MyMarketMind | Multi-Agent Investment Intelligence",
    description:
      "MarketMind orchestrates market data, technical and fundamental AI agents, sentiment, and risk for decisive investment calls.",
    url: "https://mymarketmind.net",
    siteName: "MyMarketMind",
    images: [
      {
        url: "https://mymarketmind.net/og-image.png",
        width: 1200,
        height: 630,
        alt: "MyMarketMind - AI-Powered Investment Intelligence Dashboard",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyMarketMind | Multi-Agent Investment Intelligence",
    description:
      "MarketMind orchestrates market data, technical and fundamental AI agents, sentiment, and risk for decisive investment calls.",
    images: ["https://mymarketmind.net/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <LanguageProvider>
            <SettingsProvider>
              {children}
              <SettingsModal />
              <TermsAcceptanceModal />
              <Footer />
            </SettingsProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
