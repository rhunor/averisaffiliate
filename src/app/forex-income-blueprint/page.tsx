"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ForexSalesPageContent from "./_content";

function ForexPageInner() {
  const params = useSearchParams();
  return <ForexSalesPageContent affiliateCode={params.get("ref") ?? undefined} />;
}

export default function ForexPage() {
  return (
    <Suspense fallback={<div style={{ background: "#070f14", minHeight: "100vh" }} />}>
      <ForexPageInner />
    </Suspense>
  );
}
