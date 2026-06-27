import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { resolvePaystackAccount } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { bankCode, accountNumber } = await req.json();
    if (!bankCode || !accountNumber || String(accountNumber).length !== 10) {
      return NextResponse.json({ error: "Bank code and 10-digit account number required." }, { status: 400 });
    }

    const result = await resolvePaystackAccount(String(accountNumber), String(bankCode));
    return NextResponse.json({ accountName: result.accountName });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[banks/resolve]", msg);
    return NextResponse.json({ error: "Could not verify account. Check the account number and bank, then try again." }, { status: 400 });
  }
}
