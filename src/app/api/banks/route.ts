import { NextResponse } from "next/server";
import { listBanks } from "@/lib/korapay";

let cached: { banks: { name: string; code: string }[] } | null = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Comprehensive Nigerian bank fallback — used if Korapay API is unavailable.
const NG_BANKS_FALLBACK: { name: string; code: string }[] = [
  { name: "Access Bank", code: "044" },
  { name: "Citibank Nigeria", code: "023" },
  { name: "Ecobank Nigeria", code: "050" },
  { name: "FCMB (First City Monument Bank)", code: "214" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "GTBank (Guaranty Trust Bank)", code: "058" },
  { name: "Heritage Bank", code: "030" },
  { name: "Keystone Bank", code: "082" },
  { name: "Kuda Bank", code: "090267" },
  { name: "Moniepoint MFB", code: "000011" },
  { name: "OPay Digital Services", code: "000015" },
  { name: "PalmPay", code: "999991" },
  { name: "Polaris Bank", code: "076" },
  { name: "Providus Bank", code: "101" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Standard Chartered Bank", code: "068" },
  { name: "Sterling Bank", code: "232" },
  { name: "Titan Trust Bank", code: "090115" },
  { name: "UBA (United Bank for Africa)", code: "033" },
  { name: "Union Bank of Nigeria", code: "032" },
  { name: "Unity Bank", code: "215" },
  { name: "VFD Microfinance Bank", code: "566" },
  { name: "Wema Bank / ALAT", code: "035" },
  { name: "Zenith Bank", code: "057" },
];

export async function GET() {
  try {
    if (cached && Date.now() - cacheTime < CACHE_TTL) {
      return NextResponse.json(cached);
    }

    const result = await listBanks();
    const banks = (Array.isArray(result) ? result : []).map((b) => ({
      name: b.name,
      code: b.code,
    }));

    if (banks.length === 0) {
      // Korapay returned empty — use fallback so UI is never broken
      console.warn("[banks] Korapay returned 0 banks — using fallback list");
      return NextResponse.json({ banks: NG_BANKS_FALLBACK, source: "fallback" });
    }

    cached = { banks };
    cacheTime = Date.now();
    return NextResponse.json({ banks });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[banks] Korapay error:", msg);
    // Surface the error so it's visible in Vercel logs + always serve the fallback
    return NextResponse.json({ banks: NG_BANKS_FALLBACK, source: "fallback", apiError: msg });
  }
}
