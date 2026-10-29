import { Instrument_Sans } from "next/font/google";
import { DashboardShell } from "@/components/layout/dashboard-shell";

// Dashboard-only typeface — keeps the marketing site on Inter/Playfair while
// giving the product surface its own, less default-looking voice.
const instrument = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dash",
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell className={`${instrument.variable} ${instrument.className}`}>
      {children}
    </DashboardShell>
  );
}
