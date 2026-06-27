import { NextResponse } from "next/server";
import { listPaystackBanks } from "@/lib/paystack";

let cached: { banks: { name: string; code: string }[] } | null = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Fallback list of major traditional Nigerian banks (Paystack 3-digit codes).
// Only used if the Paystack API call fails — fintech codes vary so they are omitted here.
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
  { name: "Moniepoint MFB", code: "50515" },
  { name: "OPay", code: "100004" },
  { name: "PalmPay", code: "100033" },
  { name: "Polaris Bank", code: "076" },
  { name: "Providus Bank", code: "101" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Standard Chartered Bank", code: "068" },
  { name: "Sterling Bank", code: "232" },
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

    const banks = await listPaystackBanks();

    if (banks.length === 0) {
      console.warn("[banks] Paystack returned 0 banks — using fallback list");
      return NextResponse.json({ banks: NG_BANKS_FALLBACK, source: "fallback" });
    }

    cached = { banks };
    cacheTime = Date.now();
    return NextResponse.json({ banks });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[banks] Paystack error:", msg);
    return NextResponse.json({ banks: NG_BANKS_FALLBACK, source: "fallback", apiError: msg });
  }
}
