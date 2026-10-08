import type { Metadata, Viewport } from "next";
import { Inter, Signika } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const signika = Signika({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-signika", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Organic Farm Products — Family farm in Mohale's Hoek, Lesotho",
    template: "%s · Organic Farm Products",
  },
  description:
    "Family-owned agricultural business in Mohale's Hoek, Lesotho. Sorghum, maize and sugar beans from our farm, rainbow trout sourced from SanLi Lesotho, and packaged chicken coming soon.",
  openGraph: {
    type: "website",
    siteName: "Organic Farm Products",
    locale: "en_LS",
    images: [{ url: "/brand/logo-full.jpg", width: 1200, height: 802, alt: "Organic Farm Products logo" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#cdf0b0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const analyticsToken = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN;
  return (
    <html lang="en" className={`${inter.variable} ${signika.variable}`}>
      <body className="min-h-dvh">
        {children}
        {analyticsToken ? (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: analyticsToken })}
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
