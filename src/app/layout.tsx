import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.averisacademy.com"),
  title: "Averis Academy — Wealth Creation Platform",
  description:
    "Averis Academy is a wealth creation platform. Learn to build real income selling digital products online, then invest that income to build generational wealth. Nigeria's premier two-phase wealth system.",
  keywords: [
    "Averis Academy",
    "averisacademy",
    "wealth creation Nigeria",
    "digital marketing course Nigeria",
    "make money online Nigeria",
    "affiliate marketing Nigeria",
    "how to make money online in Nigeria",
    "earn money online Nigeria",
    "online income Nigeria",
    "digital product Nigeria",
    "online business Nigeria",
    "make money from phone Nigeria",
    "best online course Nigeria",
    "affiliate marketing course Nigeria",
    "investment Nigeria",
    "wealth building Nigeria",
  ],
  alternates: { canonical: "https://www.averisacademy.com" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: "Averis Academy — Wealth Creation Platform",
    description:
      "Averis Academy is a wealth creation platform. Learn to build real income selling digital products online, then invest that income to build generational wealth. Nigeria's premier two-phase wealth system.",
    url: "https://www.averisacademy.com",
    siteName: "Averis Academy",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Averis Academy — Wealth Creation Platform",
    description:
      "Averis Academy is a wealth creation platform. Learn to build real income selling digital products online, then invest that income to build generational wealth. Nigeria's premier two-phase wealth system.",
    site: "@averisacademy",
    creator: "@averisacademy",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
