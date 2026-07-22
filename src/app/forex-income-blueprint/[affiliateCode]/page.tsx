"use client";

import { useParams } from "next/navigation";
import ForexSalesPageContent from "../_content";

export default function ForexAffiliatePage() {
  const { affiliateCode } = useParams<{ affiliateCode: string }>();
  return <ForexSalesPageContent affiliateCode={affiliateCode} />;
}
