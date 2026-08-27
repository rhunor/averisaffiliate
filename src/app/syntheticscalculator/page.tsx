import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Indices Calculator | Averis Academy",
  description:
    "Calculate your synthetic indices position size based on account risk with the Averis Academy Indices Calculator.",
  alternates: { canonical: "https://www.averisacademy.com/syntheticscalculator" },
};

export default function SyntheticsCalculatorPage() {
  return (
    <iframe
      src="/calculators/synthetics/index.html"
      title="Averis Academy Indices Calculator"
      className="h-dvh w-full border-0"
    />
  );
}
