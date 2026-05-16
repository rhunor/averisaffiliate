import { NextResponse } from "next/server";
import { listBanks } from "@/lib/korapay";

let cached: { banks: { name: string; code: string }[] } | null = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

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

    cached = { banks };
    cacheTime = Date.now();

    return NextResponse.json({ banks });
  } catch (err) {
    console.error("[banks]", err);
    return NextResponse.json({ banks: [] });
  }
}
