"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DIBContent from "./_content";

function DIBPageInner() {
  const params = useSearchParams();
  return <DIBContent affiliateCode={params.get("ref") ?? undefined} />;
}

export default function DIBPage() {
  return (
    <Suspense fallback={<div style={{ background: "#070f14", minHeight: "100vh" }} />}>
      <DIBPageInner />
    </Suspense>
  );
}
