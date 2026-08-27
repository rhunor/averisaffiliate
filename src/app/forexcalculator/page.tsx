import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forex Calculator | Averis Academy",
  description:
    "Calculate your forex position size based on account risk with the Averis Academy Forex Calculator.",
  alternates: { canonical: "https://www.averisacademy.com/forexcalculator" },
};

export default function ForexCalculatorPage() {
  return (
    <iframe
      src="/calculators/forex/index.html"
      title="Averis Academy Forex Calculator"
      className="h-dvh w-full border-0"
    />
  );
}
