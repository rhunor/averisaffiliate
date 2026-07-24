"use client";
import { useParams } from "next/navigation";
import DIBContent from "../_content";

export default function DIBAffiliatePage() {
  const { affiliateCode } = useParams<{ affiliateCode: string }>();
  return <DIBContent affiliateCode={affiliateCode} />;
}
