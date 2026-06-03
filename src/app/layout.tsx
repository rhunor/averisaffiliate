import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Averis Academy — Wealth Creation Platform",
  description:
    "Averis Academy is a wealth creation platform. Learn to build real income selling digital products online, then invest that income to build generational wealth. Nigeria's premier two-phase wealth system.",
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
